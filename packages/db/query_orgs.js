const { PrismaClient } = require("./node_modules/@prisma/client");
const p = new PrismaClient();
p.organization.findMany().then(o => console.log(o)).finally(() => p.$disconnect());
