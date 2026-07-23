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
  deliveryMode: z.enum(['ONSITE', 'ONLINE']).optional(),
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
          deliveryMode: body.deliveryMode || 'ONSITE',
        }
      });

      if (body.batchId) {
        const batch = await tx.batch.findUnique({ where: { id: body.batchId }, include: { course: true } });
        await tx.enrollment.create({
          data: {
            studentId: newStudent.id,
            batchId: body.batchId,
            status: 'ACTIVE',
            totalFee: batch?.course?.fee || 0,
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
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      batchId: z.string().optional(),
    });
    
    const body = schema.parse(req.body);

    const student = await app.prisma.$transaction(async (tx) => {
      const existingStudent = await tx.student.findUnique({ where: { id }, include: { user: true } });
      if (!existingStudent) throw new Error("Student not found");

      // Update User if needed
      if (body.firstName || body.lastName || body.phone) {
        await tx.user.update({
          where: { id: existingStudent.userId },
          data: {
            ...(body.firstName && { firstName: body.firstName }),
            ...(body.lastName && { lastName: body.lastName }),
            ...(body.phone && { phone: body.phone }),
          }
        });
      }

      // Update base student fields
      const updatedStudent = await tx.student.update({
        where: { id },
        data: {
          ...(body.address !== undefined && { address: body.address }),
          ...(body.parentName !== undefined && { parentName: body.parentName }),
          ...(body.parentPhone !== undefined && { parentPhone: body.parentPhone }),
          ...(body.portfolio !== undefined && { portfolio: body.portfolio }),
          ...(body.isAlumni !== undefined && { isAlumni: body.isAlumni }),
        },
        include: {
          user: true,
          enrollments: { include: { batch: true } }
        }
      });

      // Update batch if provided
      if (body.batchId) {
        // Find existing active enrollment
        const activeEnrollment = await tx.enrollment.findFirst({
          where: { studentId: id, status: 'ACTIVE' }
        });
        
        const batch = await tx.batch.findUnique({ where: { id: body.batchId }, include: { course: true } });
        
        if (activeEnrollment && activeEnrollment.batchId !== body.batchId) {
          // Drop existing
          await tx.enrollment.update({
            where: { id: activeEnrollment.id },
            data: { status: 'DROPPED' }
          });
          // Create new
          await tx.enrollment.create({
            data: { studentId: id, batchId: body.batchId, status: 'ACTIVE', totalFee: batch?.course?.fee || 0 }
          });
        } else if (!activeEnrollment) {
          await tx.enrollment.create({
            data: { studentId: id, batchId: body.batchId, status: 'ACTIVE', totalFee: batch?.course?.fee || 0 }
          });
        }
      }

      return updatedStudent;
    });

    return student;
  });
}
