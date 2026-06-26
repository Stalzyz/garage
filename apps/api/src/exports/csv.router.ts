import { FastifyInstance } from 'fastify';

export default async function csvExportsRouter(app: FastifyInstance) {

  function toCsv(rows: Record<string, any>[], headers: string[]): string {
    const escape = (v: any) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
  }

  // GET /api/v1/exports/leads.csv
  app.get('/leads.csv', async (req, reply) => {
    const leads = await app.prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    const headers = ['id', 'name', 'email', 'phone', 'company', 'source', 'status', 'score', 'estimatedBudget', 'createdAt'];
    const csv = toCsv(leads.map(l => ({ ...l, createdAt: l.createdAt.toISOString().split('T')[0] })), headers);
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="leads.csv"');
    return reply.send(csv);
  });

  // GET /api/v1/exports/students.csv
  app.get('/students.csv', async (req, reply) => {
    const students = await app.prisma.student.findMany({
      include: { user: { select: { email: true, firstName: true, lastName: true, phone: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const headers = ['studentId', 'firstName', 'lastName', 'email', 'phone', 'status', 'enrolledAt'];
    const csv = toCsv(students.map(s => ({
      studentId: s.id,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      email: s.user.email,
      phone: s.user.phone,
      status: s.user.status,
      enrolledAt: s.createdAt?.toISOString().split('T')[0],
    })), headers);
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="students.csv"');
    return reply.send(csv);
  });

  // GET /api/v1/exports/employees.csv
  app.get('/employees.csv', async (req, reply) => {
    const employees = await app.prisma.employee.findMany({
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const headers = ['employeeId', 'firstName', 'lastName', 'email', 'designation', 'department', 'salaryAmount', 'joinDate'];
    const csv = toCsv(employees.map(e => ({
      employeeId: e.employeeCode,
      firstName: e.user.firstName,
      lastName: e.user.lastName,
      email: e.user.email,
      designation: e.jobTitle,
      department: e.departmentId || '',
      salaryAmount: e.salary ?? 0,
      joinDate: e.joiningDate?.toISOString().split('T')[0],
    })), headers);
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="employees.csv"');
    return reply.send(csv);
  });
}
