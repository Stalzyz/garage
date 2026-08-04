"use server";

import { prisma } from "../../src/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function submitLead(formData: FormData, courseCode: string, courseName: string) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!name || (!email && !phone)) {
      return { success: false, error: "Name and either email or phone are required." };
    }

    // Save lead to CRM
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        source: "WEBSITE",
        status: "NEW",
        businessUnit: "ACADEMY",
        courseInterest: courseCode,
        notes: `Enrolled from Academy website for course: ${courseName}`,
      },
    });

    // Send email notification (Fail gracefully if RESEND_API_KEY is not set correctly)
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Academy Admissions <onboarding@resend.dev>",
        to: ["greeksacademy@gmail.com"],
        cc: ["admissions@grekam.in"],
        subject: `🎓 New Lead for ${courseName}`,
        html: `
          <h2>New Lead Captured from Academy</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Course:</strong> ${courseName} (${courseCode})</p>
          <p><small>Lead ID: ${lead.id}</small></p>
        `,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit lead:", error);
    return { success: false, error: "Internal server error." };
  }
}
