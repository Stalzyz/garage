import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET = (process.env.ENCRYPTION_SECRET || "grekam-os-default-secret-32bytes!").slice(0, 32);

function decrypt(text: string): string {
  if (!text) return "";
  try {
    const [ivHex, encryptedHex] = text.split(":");
    if (!ivHex || !encryptedHex) return text;
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return text;
  }
}

/**
 * SMTP transport for apps/web with dynamic IntegrationKey support.
 */
async function getTransporter(): Promise<{ transporter: nodemailer.Transporter | null; fromAddress: string; ccList?: string[] }> {
  let host = process.env.SMTP_HOST;
  let port = Number(process.env.SMTP_PORT || 587);
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  let secure = process.env.SMTP_SECURE === "true";
  let fromAddress = process.env.SMTP_FROM || "Grekam <no-reply@grekam.in>";
  let ccRaw = process.env.SMTP_CC_EMAILS || "";

  try {
    const keys = await prisma.integrationKey.findMany({
      where: { service: "SMTP", isActive: true },
    });
    for (const k of keys) {
      if (k.keyName === "SMTP_HOST") host = decrypt(k.encryptedValue);
      if (k.keyName === "SMTP_PORT") port = parseInt(decrypt(k.encryptedValue));
      if (k.keyName === "SMTP_USER") user = decrypt(k.encryptedValue);
      if (k.keyName === "SMTP_PASS") pass = decrypt(k.encryptedValue);
      if (k.keyName === "SMTP_FROM") fromAddress = decrypt(k.encryptedValue);
      if (k.keyName === "SMTP_SECURE") secure = decrypt(k.encryptedValue) === "true";
      if (k.keyName === "SMTP_CC_EMAILS") ccRaw = decrypt(k.encryptedValue);
    }
  } catch (e) {
    console.warn("[Email lib] Could not load SMTP keys from DB:", e);
  }

  if (!host) return { transporter: null, fromAddress };

  let ccList: string[] | undefined;
  if (ccRaw) {
    const parsed = ccRaw
      .split(/[,;\n\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@") && e.length > 3);
    if (parsed.length > 0) ccList = parsed;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: secure || port === 465,
    auth: user && pass ? { user, pass } : undefined,
    tls: { rejectUnauthorized: false },
  });

  return { transporter, fromAddress, ccList };
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const { transporter, fromAddress, ccList } = await getTransporter();
  if (!transporter) {
    throw new Error(
      "SMTP_HOST is not configured — cannot send email. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in Settings."
    );
  }

  const finalCc = ccList?.filter((c) => c.toLowerCase() !== to.trim().toLowerCase());

  await transporter.sendMail({
    from: fromAddress,
    to,
    cc: finalCc && finalCc.length > 0 ? finalCc : undefined,
    subject,
    html,
  });
}