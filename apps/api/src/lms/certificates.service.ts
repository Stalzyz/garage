import React from 'react';
import { prisma } from '../db';
import { EmailService } from '../automations/email.service';

// Use dynamic import for react-pdf to avoid ESM/CJS issues
let renderToBuffer: any;

async function getPdfRenderer() {
  if (!renderToBuffer) {
    const pdf = await import('@react-pdf/renderer');
    renderToBuffer = pdf.renderToBuffer;
  }
  return renderToBuffer;
}

/**
 * CertificateDocument — The actual PDF layout
 * Rendered server-side using @react-pdf/renderer
 */
function CertificateDocument({ studentName, courseName, completionDate, orgName }: {
  studentName: string;
  courseName: string;
  completionDate: string;
  orgName: string;
}) {
  // We use inline styles because @react-pdf/renderer uses its own styling engine
  const styles = {
    page: {
      fontFamily: 'Helvetica',
      backgroundColor: '#0A0A0A',
      padding: 60,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    border: {
      border: '3px solid #2563EB',
      borderRadius: 16,
      padding: 48,
      width: '100%',
      display: 'flex' as const,
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
    },
    orgName: { fontSize: 14, color: '#60A5FA', letterSpacing: 4, textTransform: 'uppercase' as const, marginBottom: 20 },
    title: { fontSize: 42, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10 },
    subtitle: { fontSize: 13, color: '#9CA3AF', marginBottom: 40, letterSpacing: 2 },
    presentedTo: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
    studentName: { fontSize: 36, color: '#2563EB', fontWeight: 'bold', marginBottom: 30, borderBottom: '2px solid #1E3A8A', paddingBottom: 16 },
    forCompletingText: { fontSize: 13, color: '#9CA3AF', marginBottom: 12, textAlign: 'center' as const },
    courseName: { fontSize: 22, color: '#F9FAFB', fontWeight: 'bold', marginBottom: 40, textAlign: 'center' as const },
    footer: { fontSize: 11, color: '#4B5563', marginTop: 30 },
  };

  return {
    // We return a config object that the renderer function will use
    // since we can't use JSX in plain TypeScript easily for the service layer
    studentName,
    courseName,
    completionDate,
    orgName,
    styles
  };
}

export const CertificatesService = {
  async generateAndSend(payload: {
    studentId: string;
    studentName: string;
    studentEmail?: string;
    courseName: string;
    lmsCourseId: string;
  }) {
    console.log(`[Certificates] Generating certificate for ${payload.studentName} — ${payload.courseName}`);

    try {
      const renderBuffer = await getPdfRenderer();
      const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');

      const styles = StyleSheet.create({
        page: {
          backgroundColor: '#0A0A0A',
          padding: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        outerBorder: {
          border: '3 solid #1E3A8A',
          borderRadius: 12,
          padding: 48,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        orgName: { fontSize: 10, color: '#60A5FA', letterSpacing: 3, marginBottom: 20 },
        title: { fontSize: 40, color: '#FFFFFF', marginBottom: 8 },
        subtitle: { fontSize: 10, color: '#9CA3AF', marginBottom: 40, letterSpacing: 2 },
        presentedTo: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
        studentName: { fontSize: 32, color: '#2563EB', marginBottom: 28 },
        forText: { fontSize: 11, color: '#9CA3AF', marginBottom: 10 },
        courseName: { fontSize: 20, color: '#F9FAFB', marginBottom: 36, textAlign: 'center' },
        date: { fontSize: 10, color: '#4B5563', marginTop: 24 },
      });

      const completionDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const doc = React.createElement(Document, {},
        React.createElement(Page, { size: 'A4', orientation: 'landscape', style: styles.page },
          React.createElement(View, { style: styles.outerBorder },
            React.createElement(Text, { style: styles.orgName }, 'GREKAM ACADEMY'),
            React.createElement(Text, { style: styles.title }, 'Certificate of Completion'),
            React.createElement(Text, { style: styles.subtitle }, 'THIS IS TO CERTIFY THAT'),
            React.createElement(Text, { style: styles.studentName }, payload.studentName),
            React.createElement(Text, { style: styles.forText }, 'has successfully completed the course'),
            React.createElement(Text, { style: styles.courseName }, payload.courseName),
            React.createElement(Text, { style: styles.date }, `Issued on ${completionDate}`),
          )
        )
      );

      const pdfBuffer = await renderBuffer(doc);
      console.log(`[Certificates] PDF generated (${pdfBuffer.length} bytes)`);

      // Upload to Cloudflare R2
      let certificateUrl: string | null = null;
      try {
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
        if (process.env.R2_ACCESS_KEY_ID) {
          const s3 = new S3Client({
            region: 'auto',
            endpoint: process.env.R2_ENDPOINT_URL,
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
          });
          const key = `certificates/${payload.studentId}/${Date.now()}-certificate.pdf`;
          await s3.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'grekamos',
            Key: key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
          }));
          certificateUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
          console.log(`[Certificates] Uploaded to R2: ${certificateUrl}`);
        }
      } catch (uploadErr) {
        console.error('[Certificates] R2 upload failed, continuing with email dispatch.', uploadErr);
      }

      // Save certificate record to database
      await prisma.certificate.create({
        data: {
          certificateId: `LMS-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          studentId: payload.studentId,
          courseId: payload.lmsCourseId,
          grade: 'PASS',
          issuedAt: new Date(),
          metadata: certificateUrl ? { fileUrl: certificateUrl } : {},
        }
      });

      // Send email with certificate as attachment
      if (payload.studentEmail) {
        await EmailService.sendEmail(
          payload.studentEmail,
          `🎓 Your Certificate for "${payload.courseName}" is Ready!`,
          `
            <div style="background:#0a0a0a;color:#fff;font-family:sans-serif;padding:40px;border-radius:12px">
              <h1 style="color:#2563eb">Congratulations, ${payload.studentName}! 🎉</h1>
              <p style="color:#9ca3af">You have successfully completed <strong style="color:#fff">${payload.courseName}</strong> at Grekam Academy.</p>
              <p style="color:#9ca3af">Your certificate has been generated. ${certificateUrl ? `You can <a href="${certificateUrl}" style="color:#2563eb">download it here</a>.` : 'It will be available in your student portal shortly.'}</p>
              <p style="color:#6b7280;margin-top:32px;font-size:12px">Grekam Academy — Empowering Creativity</p>
            </div>
          `
        );
        console.log(`[Certificates] Email dispatched to ${payload.studentEmail}`);
      }

      return { success: true, certificateUrl };
    } catch (err) {
      console.error('[Certificates] Failed to generate certificate:', err);
      return { success: false, error: String(err) };
    }
  }
};
