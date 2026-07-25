const { PrismaClient } = require("./node_modules/@prisma/client");
const p = new PrismaClient();
p.organization.findFirst().then(o => console.log(o)).finally(() => p.$disconnect());
