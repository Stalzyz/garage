const { PrismaClient } = require("./node_modules/@prisma/client");
const p = new PrismaClient();
p.invoice.findFirst({ where: { status: 'PAID' } }).then(i => console.log(i?.id)).finally(() => p.$disconnect());
