const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const ALGORITHM = "aes-256-cbc";
const SECRET = (process.env.ENCRYPTION_SECRET || "grekam-os-default-secret-32bytes!").slice(0, 32);

function decrypt(text) {
  try {
    const parts = text.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET), iv);
    let decrypted = decipher.update(parts[1], "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch(e) { return text; }
}

const p = new PrismaClient();
p.integrationKey.findMany({ where: { service: "SMTP" } }).then(keys => console.log(keys.map(k => k.keyName + "=" + decrypt(k.encryptedValue)))).finally(()=>p.$disconnect());
