import { FastifyInstance } from 'fastify';

export default async function riskRouter(app: FastifyInstance) {
  // GET /api/v1/academy/risk
  // Returns a list of all students with at least 1 risk factor
  app.get('/risk', async (req, reply) => {
    // We fetch all students with their relevant relations
    const students = await app.prisma.student.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
        enrollments: {
          include: {
            installments: { where: { status: 'OVERDUE' } },
            batch: {
              include: {
                sessions: {
                  include: { attendances: true }
                }
              }
            }
          }
        },
        skills: true,
      }
    });

    const atRiskStudents: any[] = [];

    for (const student of students) {
      const risks: any[] = [];
      
      // 1. Financial Risk (Overdue Fees)
      const overdueInstallments = student.enrollments.flatMap(e => e.installments);
      if (overdueInstallments.length > 0) {
        const totalDue = overdueInstallments.reduce((sum, i) => sum + i.amount, 0);
        risks.push({ type: 'FINANCIAL', level: 'HIGH', message: `₹${totalDue} in overdue fees` });
      }

      // 2. Attendance Risk (< 60%)
      const allSessions = student.enrollments.flatMap(e => e.batch?.sessions || []);
      const totalSessions = allSessions.length;
      if (totalSessions > 5) {
        const presentCount = allSessions.filter(s => s.attendances.some(a => a.studentId === student.id && a.status === 'PRESENT')).length;
        const attendanceRate = presentCount / totalSessions;
        if (attendanceRate < 0.6) {
          risks.push({ type: 'ATTENDANCE', level: 'HIGH', message: `Attendance critically low at ${Math.round(attendanceRate * 100)}%` });
        } else if (attendanceRate < 0.75) {
          risks.push({ type: 'ATTENDANCE', level: 'MEDIUM', message: `Attendance slipping (${Math.round(attendanceRate * 100)}%)` });
        }
      }

      // 3. Career/Skill Risk (< 40 Career Score)
      if (student.careerScore < 40 && totalSessions > 10) {
        risks.push({ type: 'PERFORMANCE', level: 'MEDIUM', message: `Low Career Readiness Score (${student.careerScore}/100)` });
      }

      // 4. Learning Drop (No skills added recently, handled simplistically by checking if they have very few skills)
      if (totalSessions > 10 && student.skills.length === 0) {
        risks.push({ type: 'ENGAGEMENT', level: 'LOW', message: `No skills verified by mentors yet.` });
      }

      if (risks.length > 0) {
        atRiskStudents.push({
          studentId: student.id,
          studentCode: student.studentCode,
          name: `${student.user.firstName} ${student.user.lastName}`,
          phone: student.user.phone,
          careerScore: student.careerScore,
          risks
        });
      }
    }

    // Sort by number of risks
    atRiskStudents.sort((a, b) => b.risks.length - a.risks.length);

    return atRiskStudents;
  });
}
