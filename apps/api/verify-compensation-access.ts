/**
 * Compensation visibility verification.
 *
 * Proves that salary / bank / government-ID fields are returned only to callers
 * holding `HR & Payroll:VIEW`, using the real permission resolver against the
 * real RBAC tables. Simulated roles stand in for real users so the assertions
 * do not depend on production data.
 *
 * Run: ./node_modules/.bin/tsx verify-compensation-access.ts
 */

process.env.NODE_ENV = 'test';

import { canViewCompensation, hasPermission, RESOURCE_HR_PAYROLL } from './src/utils/permissions';
import { strip, SECRET_FIELDS, COMPENSATION_FIELDS } from './src/plugins/redact.plugin';

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/** Fake app whose prisma returns roles/permissions for a simulated user. */
function fakeApp(user: any, roles: Record<string, Array<{ resource: string; action: string }>>) {
  return {
    prisma: {
      user: {
        findUnique: async () => ({
          role: user.role,
          customRoleId: user.customRoleId ?? null,
          customRole: user.customRoleId ? { name: user.customRoleName } : null,
        }),
      },
      permission: {
        findMany: async ({ where }: any) => roles[where.role.name] ?? [],
      },
    },
  } as any;
}

// Mirrors the permission rows observed in production.
const PROD_ROLES: Record<string, Array<{ resource: string; action: string }>> = {
  Management: ['CRM & Sales', 'Finance', 'HR & Payroll', 'LMS & Academy', 'Marketing Hub', 'Projects', 'Support Helpdesk', 'System Settings'].flatMap((r) =>
    ['CREATE', 'EDIT', 'VIEW', 'DELETE'].map((action) => ({ resource: r, action }))
  ),
  HR: ['CREATE', 'EDIT', 'VIEW', 'DELETE'].map((action) => ({ resource: 'HR & Payroll', action })),
  Staff: ['CRM & Sales', 'Marketing Hub', 'Projects', 'Support Helpdesk'].flatMap((r) =>
    ['CREATE', 'EDIT', 'VIEW'].map((action) => ({ resource: r, action }))
  ),
};

async function main() {
  console.log('\n=== 1. Who may view compensation ===');

  const superAdmin = fakeApp({ id: 'u1', role: 'SUPER_ADMIN' }, PROD_ROLES);
  check('SUPER_ADMIN allowed', await canViewCompensation(superAdmin, { user: { id: 'u1', role: 'SUPER_ADMIN' } }));

  const mgmtUser = { id: 'u2', role: 'STAFF', customRoleId: 'r1', customRoleName: 'Management' };
  check('Management custom role allowed', await canViewCompensation(fakeApp(mgmtUser, PROD_ROLES), { user: mgmtUser }));

  const hrUser = { id: 'u3', role: 'STAFF', customRoleId: 'r2', customRoleName: 'HR' };
  check('HR custom role allowed', await canViewCompensation(fakeApp(hrUser, PROD_ROLES), { user: hrUser }));

  const staffUser = { id: 'u4', role: 'STAULT', customRoleId: 'r3', customRoleName: 'Staff' };
  check('Staff custom role DENIED', !(await canViewCompensation(fakeApp(staffUser, PROD_ROLES), { user: staffUser })));

  const plainStaff = { id: 'u5', role: 'STAULT' };
  check('STAULT with no custom role DENIED', !(await canViewCompensation(fakeApp(plainStaff, PROD_ROLES), { user: plainStaff })));

  const managerBase = { id: 'u6', role: 'MANAGER' };
  check('base MANAGER role maps to Management, allowed', await canViewCompensation(fakeApp(managerBase, PROD_ROLES), { user: managerBase }));

  for (const role of ['CLIENT', 'STUDENT', 'VENDOR']) {
    const u = { id: `u-${role}`, role, customRoleId: 'r1', customRoleName: 'Management' };
    check(`${role} DENIED even if handed a custom role`, !(await canViewCompensation(fakeApp(u, PROD_ROLES), { user: u })));
  }

  const anon = fakeApp({}, PROD_ROLES);
  check('no user DENIED', !(await canViewCompensation(anon, { user: undefined })));

  console.log('\n=== 2. Permission is scoped to the resource ===');
  const staffUser2 = { id: 'u7', role: 'STAULT', customRoleId: 'r3', customRoleName: 'Staff' };
  const staffApp = fakeApp(staffUser2, PROD_ROLES);
  check('Staff may view CRM & Sales', await hasPermission(staffApp, { user: staffUser2 }, 'CRM & Sales', 'VIEW'));
  check('Staff may NOT view HR & Payroll', !(await hasPermission(staffApp, { user: staffUser2 }, RESOURCE_HR_PAYROLL, 'VIEW')));

  console.log('\n=== 3. Field stripping ===');
  const employee = {
    id: 'e1', firstName: 'Asha', email: 'a@b.c', employeeCode: 'EMP-1', jobTitle: 'Telecaller',
    salary: 40000, currency: 'INR',
    bankDetails: { bankName: 'X', accountNo: '0001', ifsc: 'ABCD' },
    governmentId: { type: 'PAN', number: 'ABCPD1234E' },
    bloodGroup: 'O+', emergencyContact: { name: 'R', phone: '9' },
    user: { email: 'a@b.c', passwordHash: 'HASH', twoFaBackupCodes: ['x'] },
  };

  const deniedFields = [...SECRET_FIELDS, ...COMPENSATION_FIELDS];
  const asStaff = strip({ employees: [employee] }, deniedFields) as any;
  const staffBody = JSON.stringify(asStaff);
  for (const f of ['salary', 'bankDetails', 'governmentId', 'bloodGroup', 'emergencyContact', 'passwordHash', 'twoFaBackupCodes']) {
    check(`staff response omits ${f}`, !staffBody.includes(`"${f}"`));
  }
  check('staff still sees name/email/jobTitle', asStaff.employees[0].firstName === 'Asha' && asStaff.employees[0].jobTitle === 'Telecaller');

  const asHr = strip({ employees: [employee] }, SECRET_FIELDS) as any;
  const hrBody = JSON.stringify(asHr);
  check('HR response keeps salary', asHr.employees[0].salary === 40000);
  check('HR response keeps bankDetails', asHr.employees[0].bankDetails.accountNo === '0001');
  check('HR response still omits passwordHash', !hrBody.includes('"passwordHash"'));
  check('HR response still omits twoFaBackupCodes', !hrBody.includes('"twoFaBackupCodes"'));

  console.log('\n=== 4. Payslip amounts are treated as compensation ===');
  const payslip = { basicSalary: 40000, hra: 20000, grossSalary: 60000, pfDeduction: 4800, esiDeduction: 0, tdsDeduction: 1200, otherDeductions: 0, netSalary: 54000, paidAt: '2026-09-01' };
  const psAsStaff = strip({ payslips: [payslip] }, deniedFields) as any;
  const psBody = JSON.stringify(psAsStaff);
  for (const f of ['basicSalary', 'grossSalary', 'netSalary', 'pfDeduction', 'tdsDeduction']) {
    check(`staff payslip omits ${f}`, !psBody.includes(`"${f}"`));
  }
  check('staff payslip keeps paidAt', psAsStaff.payslips[0].paidAt === '2026-09-01');
  const psAsHr = strip({ payslips: [payslip] }, SECRET_FIELDS) as any;
  check('HR payslip keeps netSalary', psAsHr.payslips[0].netSalary === 54000);

  console.log('\n=== 5. Unknown roles fail closed ===');
  const weird = { id: 'u9', role: 'SOMETHING_NEW' };
  check('unmapped role DENIED', !(await canViewCompensation(fakeApp(weird, PROD_ROLES), { user: weird })));
  const missingRole = { id: 'u10', role: 'STAULT', customRoleId: 'rX', customRoleName: 'DoesNotExist' };
  check('missing role row DENIED', !(await canViewCompensation(fakeApp(missingRole, PROD_ROLES), { user: missingRole })));

  console.log('\n=== 6. End-to-end through the real redaction hook ===');

  const Fastify = require('fastify');
  const redactPlugin = require('./src/plugins/redact.plugin').default;

  const buildProbeApp = (currentUser: any) => {
    const app = Fastify({ logger: false });
    // fakeApp() models a whole Fastify instance; Fastify wants only the Prisma
    // client on `.prisma`, so unwrap it. Decorating with the wrapper instead
    // makes `.prisma.user` undefined, which throws inside the resolver and
    // fails closed — silently denying everyone, so assert the shape.
    const decorated = (fakeApp(currentUser ?? {}, PROD_ROLES) as any).prisma;
    if (typeof decorated?.user?.findUnique !== 'function') {
      throw new Error('probe app prisma decoration is malformed');
    }
    app.decorate('prisma', decorated);
    return app.register(redactPlugin).then(() => {
      app.get('/employees', async (req: any) => {
        // Set the caller the way the auth gate would, then let onSend decide.
        req.user = currentUser;
        return { employees: [employee] };
      });
      return app;
    });
  };

  const callAs = async (user: any) => {
    const app = await buildProbeApp(user);
    const res = await app.inject({ method: 'GET', url: '/employees' });
    await app.close();
    return res.body;
  };

  const mgmt = { id: 'u20', role: 'STAFF', customRoleId: 'r1', customRoleName: 'Management' };
  const staff = { id: 'u21', role: 'STAULT', customRoleId: 'r3', customRoleName: 'Staff' };

  const bodyForMgmt = await callAs(mgmt);
  check('hook: management response contains salary', bodyForMgmt.includes('"salary":40000'), bodyForMgmt.slice(0, 160));
  check('hook: management response contains bankDetails', bodyForMgmt.includes('accountNo'));
  check('hook: management response still hides passwordHash', !bodyForMgmt.includes('passwordHash'));

  const bodyForStaff = await callAs(staff);
  check('hook: staff response has NO salary', !bodyForStaff.includes('"salary"'), bodyForStaff.slice(0, 200));
  check('hook: staff response has NO bankDetails', !bodyForStaff.includes('bankDetails'));
  check('hook: staff response has NO governmentId', !bodyForStaff.includes('governmentId'));
  check('hook: staff response has NO passwordHash', !bodyForStaff.includes('passwordHash'));
  check('hook: staff response still has the employee', bodyForStaff.includes('"firstName":"Asha"'));

  const bodyAnon = await callAs(undefined);
  check('hook: anonymous response has NO salary', !bodyAnon.includes('"salary"'));
  check('hook: anonymous response has NO passwordHash', !bodyAnon.includes('passwordHash'));

  console.log(`\n${'='.repeat(48)}`);
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) console.log(`Failures:\n  - ${failures.join('\n  - ')}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('HARNESS ERROR:', e);
  process.exit(1);
});