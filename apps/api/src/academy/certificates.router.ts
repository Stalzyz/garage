import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { CertificatePDF } from './certificate-pdf';
export default async function certificatesRouter(app: FastifyInstance) {
  
  // GET /api/v1/academy/certificates
  app.get('/', async (req, reply) => {
    const user = req.user;
    
    let whereClause = {};
    if (user.role === 'STUDENT') {
      const student = await app.prisma.student.findUnique({
        where: { userId: user.id }
      });
      if (!student) return { data: [], total: 0 };
      whereClause = { studentId: student.id };
    }

    const certificates = await app.prisma.certificate.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        course: {
          select: {
            name: true
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    return { data: certificates, total: certificates.length };
  });

  // POST /api/v1/academy/certificates (Issue new certificate)
  app.post('/', async (req, reply) => {
    const bodySchema = z.object({
      studentId: z.string().min(1),
      courseId: z.string().min(1),
      grade: z.string().optional().nullable()
    });

    const { studentId, courseId, grade } = bodySchema.parse(req.body);

    const certificateId = `GRK-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const cert = await app.prisma.certificate.create({
      data: {
        certificateId,
        studentId,
        courseId,
        grade
      }
    });

    reply.code(201);
    return cert;
  });

  // GET /api/v1/academy/certificates/:id (Verification)
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };

    const cert = await app.prisma.certificate.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            studentCode: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        course: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    if (!cert) return reply.notFound('Certificate not found');

    return { certificate: cert };
  });

  // GET /api/v1/academy/certificates/:id/download
  app.get('/:id/download', async (req, reply) => {
    const { id } = req.params as { id: string };

    const cert = await app.prisma.certificate.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        course: {
          select: {
            name: true
          }
        }
      }
    });

    if (!cert) return reply.notFound('Certificate not found');

    const element = React.createElement(CertificatePDF, {
      studentName: `${cert.student.user.firstName} ${cert.student.user.lastName}`,
      courseName: cert.course.name,
      certificateId: cert.certificateId,
      grade: cert.grade,
      issuedAt: cert.issuedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });

    const buffer = await renderToBuffer(element as any);
    const pdfBuffer = Buffer.from(buffer);

    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="Certificate-${cert.certificateId}.pdf"`);
    return reply.send(pdfBuffer);
  });
}
