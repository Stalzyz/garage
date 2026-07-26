const { PrismaClient } = require("./node_modules/@prisma/client");
const p = new PrismaClient();
p.financeSettings.findFirst().then(fs => console.log(fs)).finally(() => p.$disconnect());
