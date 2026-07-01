import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';

const CreateStudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  batchId: z.string().optional(),
  leadId: z.string().optional(),
});

export default async function studentsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/students
  app.get('/students', async (req, reply) => {
    const { isAlumni, deliveryMode } = req.query as { isAlumni?: string, deliveryMode?: string };
    
    let whereClause: any = {};
    if (isAlumni === 'true') whereClause.isAlumni = true;
    if (isAlumni === 'false') whereClause.isAlumni = false;
    if (deliveryMode) whereClause.deliveryMode = deliveryMode;

    const students = await app.prisma.student.findMany({
      where: whereClause,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        enrollments: { 
          include: { batch: { select: { name: true, course: { select: { name: true } } } } } 
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: students, total: students.length };
  });

  // GET /api/v1/academy/students/:id
  app.get('/students/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const student = await app.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        enrollments: { include: { batch: { include: { course: true } } } },
        application: true,
      },
    });
    if (!student) return reply.notFound('Student not found');
    return student;
  });

  // POST /api/v1/academy/students
  app.post('/students', async (req, reply) => {
    const body = CreateStudentSchema.parse(req.body);
    
    // Using a default hash or generating one
    const passwordHash = crypto.createHash('sha256').update('Grekam@2026').digest('hex');

    const studentCode = `GRA-${new Date().getFullYear() % 100}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const student = await app.prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: body.email,
          passwordHash,
          role: 'STUDENT',
          status: 'ACTIVE',
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
        }
      });

      const newStudent = await tx.student.create({
        data: {
          userId: user.id,
          studentCode,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
          leadId: body.leadId || undefined,
        }
      });

      if (body.batchId) {
        await tx.enrollment.create({
          data: {
            studentId: newStudent.id,
            batchId: body.batchId,
            status: 'ACTIVE',
          }
        });
      }

      return newStudent;
    });

    reply.code(201);
    return student;
  });

  // PATCH /api/v1/academy/students/:id
  app.patch('/students/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      address: z.string().optional(),
      parentName: z.string().optional(),
      parentPhone: z.string().optional(),
      portfolio: z.string().url().optional(),
      isAlumni: z.boolean().optional(),
    });
    
    const body = schema.parse(req.body);
    const student = await app.prisma.student.update({
      where: { id },
      data: body,
    });
    return student;
  });
}
