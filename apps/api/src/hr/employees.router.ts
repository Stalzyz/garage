import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import crypto from 'crypto';

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
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        jobTitle: z.string(),
        joiningDate: z.string(),
        salary: z.number().optional(),
        departmentId: z.string().optional(),
        managerId: z.string().optional(),
        customRoleId: z.string().optional(),
        bloodGroup: z.string().optional(),
        emergencyContact: z.any().optional(),
        bankDetails: z.any().optional(),
        governmentId: z.any().optional(),
        teamId: z.string().optional(),
        designationId: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const data = req.body;
    
    // Generate a code if none provided
    const employeeCode = `EMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Generate a secure random password
    const tempPassword = Math.random().toString(36).slice(-8) + "!";
    const passwordHash = await require('bcryptjs').hash(tempPassword, 10);

    const existingUser = await server.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return reply.status(400).send({ error: 'Email already exists' });
    }

    try {
      const employee = await server.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: 'STAFF',
            customRoleId: data.customRoleId || null,
            status: 'ACTIVE',
            passwordHash
          }
        });

        return await tx.employee.create({
          data: {
            userId: user.id,
            employeeCode,
            jobTitle: data.jobTitle,
            joiningDate: new Date(data.joiningDate),
            salary: data.salary,
            departmentId: data.departmentId,
            managerId: data.managerId,
            bloodGroup: data.bloodGroup,
            emergencyContact: data.emergencyContact,
            bankDetails: data.bankDetails,
            governmentId: data.governmentId,
            teamId: data.teamId,
            designationId: data.designationId
          }
        });
      });

      return reply.status(201).send({ employee, credentials: { email: data.email, password: tempPassword } });
    } catch (error: any) {
      console.error("EMPLOYEE CREATION ERROR:", error);
      return reply.status(500).send({ error: "Failed to create employee: " + (error.message || String(error)) });
    }
  });

  server.put('/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        avatarUrl: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
        customRoleId: z.string().optional(),
        jobTitle: z.string().optional(),
        salary: z.number().optional(),
        departmentId: z.string().optional(),
        managerId: z.string().optional(),
        bio: z.string().optional(),
        skills: z.array(z.string()).optional(),
        bloodGroup: z.string().optional(),
        emergencyContact: z.any().optional(),
        bankDetails: z.any().optional(),
        governmentId: z.any().optional(),
        teamId: z.string().optional(),
        designationId: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { firstName, lastName, email, avatarUrl, status, customRoleId, ...employeeData } = req.body;
    
    const updated = await server.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findUnique({ where: { id: req.params.id } });
      if (!employee) throw new Error("Employee not found");
      
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      if (status !== undefined) updateData.status = status;
      if (customRoleId !== undefined) updateData.customRoleId = customRoleId || null;
      
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({
          where: { id: employee.userId },
          data: updateData
        });
      }
      
      return await tx.employee.update({
        where: { id: req.params.id },
        data: employeeData,
        include: { user: true, department: true }
      });
    });
    
    return { updated };
  });

  server.delete('/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    try {
      await server.prisma.$transaction(async (tx) => {
        const employee = await tx.employee.findUnique({ where: { id: req.params.id } });
        if (!employee) return;
        
        // Due to onDelete: Cascade on Prisma relations, we don't need to manually delete time entries, leaves, etc.
        
        // Delete the employee
        await tx.employee.delete({
          where: { id: req.params.id }
        });
        
        // Delete the associated user
        await tx.user.delete({
          where: { id: employee.userId }
        });
      });
      return { success: true };
    } catch (error: any) {
      console.error("PERMANENT DELETE ERROR:", error);
      return reply.status(500).send({ error: "Failed to permanently delete employee: " + (error.message || String(error)) });
    }
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

  // Reset Password
  server.post('/:id/reset-password', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    const employee = await server.prisma.employee.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    
    if (!employee || !employee.user) {
      return reply.status(404).send({ error: "Employee or User not found" });
    }

    const tempPassword = Math.random().toString(36).slice(-8) + "!";
    const passwordHash = await require('bcryptjs').hash(tempPassword, 10);

    await server.prisma.user.update({
      where: { id: employee.userId },
      data: { passwordHash }
    });

    return reply.status(200).send({ 
      message: "Password reset successfully", 
      credentials: { email: employee.user.email, password: tempPassword } 
    });
  });

  // GET /api/v1/hr/employees/:id/activity
  server.get('/:id/activity', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    const employee = await server.prisma.employee.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    
    if (!employee || !employee.user) {
      return reply.status(404).send({ error: "Employee or User not found" });
    }

    const userId = employee.userId;

    // Fetch Time Entries (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const timeEntries = await server.prisma.timeEntry.findMany({
      where: { employeeId: employee.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'desc' },
      take: 20
    });

    // Fetch Projects managed by User
    const projects = await server.prisma.project.findMany({
      where: { managerId: userId },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    // Fetch Tasks assigned to User
    const tasks = await server.prisma.task.findMany({
      where: { assigneeId: userId },
      include: { project: true },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    return { timeEntries, projects, tasks };
  });
}
