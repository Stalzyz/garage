import nodemailer from 'nodemailer';

async function test() {
  const host = "smtp.hostinger.com";
  const port = 465;
  const user = "admin@grekam.in";
  const pass = "Medusa09#";

  console.log("Testing with secure: true...");
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: { user, pass },
      debug: true,
      logger: true
    });

    const info = await transporter.sendMail({
      from: '"Team Grekam" <admin@grekam.in>',
      to: "mstalinkumar05@gmail.com",
      subject: "Test Direct SMTP SSL (Secure: true)",
      html: "<b>SSL Test</b>"
    });
    console.log("Success with secure: true!", info);
  } catch (err) {
    console.error("Failed with secure: true:", err);
  }

  console.log("\nTesting with secure: false...");
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
      debug: true,
      logger: true
    });

    const info = await transporter.sendMail({
      from: '"Team Grekam" <admin@grekam.in>',
      to: "mstalinkumar05@gmail.com",
      subject: "Test Direct SMTP non-SSL (Secure: false)",
      html: "<b>Non-SSL Test</b>"
    });
    console.log("Success with secure: false!", info);
  } catch (err) {
    console.error("Failed with secure: false:", err);
  }
}
test();
