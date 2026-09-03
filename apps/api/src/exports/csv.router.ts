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

  // GET /api/v1/exports/attendance.csv
  app.get('/attendance.csv', async (req, reply) => {
    const { startDate, endDate, employeeId, status } = req.query as {
      startDate?: string;
      endDate?: string;
      employeeId?: string;
      status?: string;
    };

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status && status !== 'all') where.status = status.toUpperCase();
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const records = await app.prisma.attendance.findMany({
      where,
      include: {
        employee: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        shift: true
      },
      orderBy: { date: 'desc' }
    });

    const headers = [
      'date',
      'employeeCode',
      'employeeName',
      'email',
      'status',
      'shift',
      'clockIn',
      'clockOut',
      'duration',
      'isGeofenced',
      'notes'
    ];

    const csv = toCsv(records.map(r => {
      let durationStr = '--';
      if (r.clockIn && r.clockOut) {
        let m = Math.floor((r.clockOut.getTime() - r.clockIn.getTime()) / 60000);
        if (r.breakStart && r.breakEnd) {
          m -= Math.floor((r.breakEnd.getTime() - r.breakStart.getTime()) / 60000);
        }
        durationStr = `${Math.floor(m / 60)}h ${Math.max(0, m % 60)}m`;
      }

      return {
        date: r.date.toISOString().split('T')[0],
        employeeCode: r.employee.employeeCode || r.employee.id,
        employeeName: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
        email: r.employee.user.email,
        status: r.status,
        shift: r.shift?.name || 'Standard',
        clockIn: r.clockIn ? r.clockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        clockOut: r.clockOut ? r.clockOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        duration: durationStr,
        isGeofenced: r.isGeofenced ? 'Yes' : 'No',
        notes: r.notes || ''
      };
    }), headers);

    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="attendance.csv"');
    return reply.send(csv);
  });
}
