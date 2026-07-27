import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import puppeteer from 'puppeteer';

export default async function certificatesRouter(app: FastifyInstance) {
  // GET /api/v1/academy/certificates/templates
  app.get('/templates', async (req, reply) => {
    const templates = await app.prisma.certificateTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return templates;
  });

  // POST /api/v1/academy/certificates/templates
  app.post('/templates', async (req, reply) => {
    const schema = z.object({
      name: z.string(),
      htmlContent: z.string(),
      backgroundUrl: z.string().optional(),
      watermarkUrl: z.string().optional(),
      educatorSignatureUrl: z.string().optional(),
      academyHeadSignatureUrl: z.string().optional()
    });
    const data = schema.parse(req.body);

    const template = await app.prisma.certificateTemplate.create({
      data
    });
    return template;
  });

  // POST /api/v1/academy/certificates/generate
  app.post('/generate', async (req, reply) => {
    const schema = z.object({
      studentId: z.string(),
      courseId: z.string(),
      templateId: z.string(),
      sendEmail: z.boolean().default(false)
    });
    
    const data = schema.parse(req.body);

    const student = await app.prisma.student.findUnique({ where: { id: data.studentId }, include: { user: true } });
    if (!student) return reply.code(404).send({ error: 'Student not found' });

    const course = await app.prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) return reply.code(404).send({ error: 'Course not found' });

    const template = await app.prisma.certificateTemplate.findUnique({ where: { id: data.templateId } });
    if (!template) return reply.code(404).send({ error: 'Template not found' });

    // Ensure Certificate ID is unique
    const certificateId = `GRK-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Inject data into HTML
    let html = template.htmlContent
      .replace(/{{STUDENT_NAME}}/g, `${student.user.firstName} ${student.user.lastName}`)
      .replace(/{{COURSE_NAME}}/g, course.title)
      .replace(/{{ISSUE_DATE}}/g, new Date().toLocaleDateString())
      .replace(/{{VERIFICATION_CODE}}/g, certificateId)
      .replace(/{{BACKGROUND_URL}}/g, template.backgroundUrl || '')
      .replace(/{{WATERMARK_URL}}/g, template.watermarkUrl || '')
      .replace(/{{EDUCATOR_SIGNATURE_URL}}/g, template.educatorSignatureUrl || '')
      .replace(/{{ACADEMY_HEAD_SIGNATURE_URL}}/g, template.academyHeadSignatureUrl || '');

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set content and wait for network idle to ensure fonts/images load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true
    });
    
    await browser.close();

    const pdfUrl = `https://storage.grekam.in/certificates/${certificateId}.pdf`; 

    const certificate = await app.prisma.certificate.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        templateId: data.templateId,
        certificateId,
        pdfUrl
      }
    });

    if (data.sendEmail) {
      app.log.info(`Sending certificate email to ${student.user.email}`);
    }

    // Since we are returning the pdf inline for preview in this builder
    reply.header('Content-Type', 'application/pdf');
    return reply.send(pdfBuffer);
  });
}
