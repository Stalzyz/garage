import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function employeeRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', async (req, reply) => {
    const employees = await server.prisma.employee.findMany({
      include: { user: true, department: true }
    });
    return { employees };
  });

  server.get('/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    const employee = await server.prisma.employee.findUnique({
      where: { id: req.params.id },
      include: { 
        user: true, 
        department: true,
        documents: true,
        onboardingTasks: true
      }
    });
    if (!employee) return reply.status(404).send({ error: 'Employee not found' });
    return { employee };
  });

  server.post('/', {
    schema: {
      body: z.object({
        userId: z.string(),
        employeeCode: z.string(),
        jobTitle: z.string(),
        joiningDate: z.string(),
        salary: z.number().optional(),
        departmentId: z.string().optional(),
        managerId: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const data = req.body;
    const employee = await server.prisma.employee.create({
      data: {
        ...data,
        joiningDate: new Date(data.joiningDate),
      }
    });
    return reply.status(201).send(employee);
  });

  server.put('/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        jobTitle: z.string().optional(),
        salary: z.number().optional(),
        departmentId: z.string().optional(),
        managerId: z.string().optional(),
        bio: z.string().optional(),
        skills: z.array(z.string()).optional()
      })
    }
  }, async (req, reply) => {
    const updated = await server.prisma.employee.update({
      where: { id: req.params.id },
      data: req.body
    });
    return { updated };
  });

  server.delete('/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    await server.prisma.employee.delete({
      where: { id: req.params.id }
    });
    return { success: true };
  });

  // Employee Documents
  server.post('/:id/documents', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        name: z.string(),
        fileUrl: z.string(),
        type: z.string(),
        uploadedBy: z.string()
      })
    }
  }, async (req, reply) => {
    const doc = await server.prisma.employeeDocument.create({
      data: {
        employeeId: req.params.id,
        ...req.body
      }
    });
    return reply.status(201).send(doc);
  });
}
