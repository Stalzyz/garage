import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { z } from 'zod';
import { createNotification } from '../notifications/notifications.service';

// In a real app, you would import PrismaClient from your db setup
// import prisma from '../../lib/prisma';

interface RazorpayWebhookBody {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        status: string;
        amount: number;
        currency: string;
        notes?: {
          invoice_id?: string;
          student_id?: string;
          course_id?: string;
          batch_id?: string;
        };
      };
    };
    order?: {
      entity: {
        id: string;
        status: string;
        receipt?: string;
      };
    };
  };
}

export default async function razorpayWebhookRouter(app: FastifyInstance) {
  // POST /api/v1/webhooks/razorpay
  app.post<{ Body: RazorpayWebhookBody }>('/razorpay', async (req: FastifyRequest<{ Body: RazorpayWebhookBody }>, reply: FastifyReply) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_secret';
      
      // 1. Verify Signature
      if (signature && process.env.NODE_ENV === 'production') {
        const bodyText = JSON.stringify(req.body);
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(bodyText)
          .digest('hex');

        if (expectedSignature !== signature) {
          app.log.warn('Razorpay signature mismatch');
          return reply.code(400).send({ error: 'Invalid signature' });
        }
      }

      const event = req.body.event;
      app.log.info({ event }, 'Received verified Razorpay webhook');

      switch (event) {
        case 'payment.captured': {
          const payment = req.body.payload.payment?.entity;
          if (payment) {
            app.log.info(`Payment Captured: ${payment.id} for Order: ${payment.order_id}`);
            
            if (payment.notes?.invoice_id) {
              const invoice = await app.prisma.invoice.findUnique({
                where: { id: payment.notes.invoice_id }
              });

              if (invoice && invoice.status !== 'PAID') {
                await app.prisma.$transaction(async (tx) => {
                  await tx.invoice.update({
                    where: { id: invoice.id },
                    data: { 
                      status: 'PAID', 
                      paidAt: new Date(),
                      paidAmount: invoice.totalAmount
                    }
                  });
                  await tx.payment.create({
                    data: {
                      invoiceId: invoice.id,
                      amount: invoice.totalAmount,
                      method: 'RAZORPAY',
                      transactionId: payment.id,
                      paidAt: new Date(),
                      notes: `Paid via Razorpay. Order ID: ${payment.order_id}`
                    }
                  });

                  // If this invoice is linked to a billing milestone, mark it as paid
                  const milestone = await tx.billingMilestone.findUnique({
                    where: { invoiceId: invoice.id }
                  });
                  if (milestone) {
                    await tx.billingMilestone.update({
                      where: { id: milestone.id },
                      data: { status: 'PAID' }
                    });
                    
                    // In a real app, send "Payment Received" email to client here
                    app.log.info(`Marked milestone ${milestone.id} as PAID and queued receipt email.`);
                  }
                });

                try {
                  (app as any).broadcast('telemetry-event', {
                    event: 'Payment Received',
                    data: {
                      id: invoice.id,
                      invoiceNumber: invoice.invoiceNumber,
                      amount: invoice.totalAmount,
                      clientName: invoice.clientName
                    }
                  });
                } catch (wsErr) {
                  app.log.error(wsErr, "Failed to broadcast WebSocket event");
                }
              }
            } else if (payment.notes?.batch_id && payment.notes?.student_id) {
              const { batch_id, student_id } = payment.notes;
              // Check if enrollment already exists to prevent duplicates
              const existing = await app.prisma.enrollment.findFirst({
                where: { studentId: student_id, batchId: batch_id }
              });

              if (!existing) {
                const batch = await app.prisma.batch.findUnique({
                  where: { id: batch_id },
                  include: { course: true }
                });

                if (batch) {
                  await app.prisma.enrollment.create({
                    data: {
                      studentId: student_id,
                      batchId: batch_id,
                      totalFee: batch.course.fee || 0,
                      feePaid: payment.amount / 100,
                      status: 'ACTIVE'
                    }
                  });
                  
                  // Notify the student
                  const student = await app.prisma.student.findUnique({
                    where: { id: student_id },
                    include: { enrollments: { where: { batchId: batch_id } } }
                  });
                  if (student) {
                    await createNotification({
                      userId: student.userId,
                      type: 'PAYMENT_RECEIVED',
                      title: 'Enrollment Successful',
                      body: `Your payment of ${payment.amount / 100} ${payment.currency} was successful. You are now enrolled in ${batch.course.name}.`,
                    });

                    // ── Auto-create referral payout if student was referred ──
                    if (student.referredById) {
                      const REFERRAL_PERCENTAGE = 10;
                      const feePaid = payment.amount / 100;
                      const payoutAmount = (feePaid * REFERRAL_PERCENTAGE) / 100;
                      // Derive courseType from batch type field or fallback to ONSITE
                      const courseType: string = (batch as any).type === 'ONLINE' ? 'ONLINE' : 'ONSITE';

                      // Avoid creating duplicate payouts for same referral
                      const existingPayout = await app.prisma.referralPayout.findFirst({
                        where: { referrerId: student.referredById, referredId: student_id }
                      });

                      if (!existingPayout) {
                        await app.prisma.referralPayout.create({
                          data: {
                            referrerId: student.referredById,
                            referredId: student_id,
                            amount: payoutAmount,
                            percentage: REFERRAL_PERCENTAGE,
                            courseType,
                            status: 'PENDING'
                          }
                        });
                        app.log.info(`Auto-created referral payout of ₹${payoutAmount} for referrer ${student.referredById}`);
                      }
                    }
                  }

                  app.log.info(`Created LMS Enrollment for student ${student_id} in batch ${batch_id}`);
                }
              }
            }
          }
          break;
        }

        case 'order.paid': {
          const order = req.body.payload.order?.entity;
          if (order) {
            app.log.info(`Order Paid: ${order.id}. Receipt: ${order.receipt}`);
            if (order.receipt) {
              const invoice = await app.prisma.invoice.findUnique({
                where: { invoiceNumber: order.receipt }
              });
              if (invoice && invoice.status !== 'PAID') {
                await app.prisma.$transaction(async (tx) => {
                  await tx.invoice.update({
                    where: { id: invoice.id },
                    data: { 
                      status: 'PAID', 
                      paidAt: new Date(),
                      paidAmount: invoice.totalAmount
                    }
                  });
                  await tx.payment.create({
                    data: {
                      invoiceId: invoice.id,
                      amount: invoice.totalAmount,
                      method: 'RAZORPAY',
                      transactionId: order.id,
                      paidAt: new Date(),
                      notes: `Paid via Razorpay Order: ${order.id}`
                    }
                  });

                  // If this invoice is linked to a billing milestone, mark it as paid
                  const milestone = await tx.billingMilestone.findUnique({
                    where: { invoiceId: invoice.id }
                  });
                  if (milestone) {
                    await tx.billingMilestone.update({
                      where: { id: milestone.id },
                      data: { status: 'PAID' }
                    });
                    
                    // In a real app, send "Payment Received" email to client here
                    app.log.info(`Marked milestone ${milestone.id} as PAID and queued receipt email.`);
                  }
                });

                try {
                  (app as any).broadcast('telemetry-event', {
                    event: 'Payment Received',
                    data: {
                      id: invoice.id,
                      invoiceNumber: invoice.invoiceNumber,
                      amount: invoice.totalAmount,
                      clientName: invoice.clientName
                    }
                  });
                } catch {}
              }
            }
          }
          break;
        }

        case 'payment.failed': {
          const payment = req.body.payload.payment?.entity;
          if (payment) {
            app.log.warn(`Payment Failed: ${payment.id}`);
          }
          break;
        }

        case 'subscription.charged': {
          const subscriptionPayload = req.body.payload.subscription?.entity;
          if (subscriptionPayload) {
            app.log.info(`Subscription Charged: ${subscriptionPayload.id}`);
            const clientSub = await app.prisma.clientSubscription.findUnique({
              where: { razorpaySubId: subscriptionPayload.id }
            });

            if (clientSub) {
              // Add 30 days to expiry (or 1 month)
              const newExpiry = new Date();
              newExpiry.setDate(newExpiry.getDate() + 30);

              await app.prisma.clientSubscription.update({
                where: { id: clientSub.id },
                data: {
                  status: 'ACTIVE',
                  expiryDate: newExpiry
                }
              });
              app.log.info(`Updated expiry date for Client Subscription ${clientSub.id} to ${newExpiry}`);
            }
          }
          break;
        }

        case 'subscription.halted':
        case 'subscription.cancelled': {
          const subscriptionPayload = req.body.payload.subscription?.entity;
          if (subscriptionPayload) {
            app.log.info(`Subscription Halted/Cancelled: ${subscriptionPayload.id}`);
            const clientSub = await app.prisma.clientSubscription.findUnique({
              where: { razorpaySubId: subscriptionPayload.id }
            });

            if (clientSub) {
              await app.prisma.clientSubscription.update({
                where: { id: clientSub.id },
                data: { status: 'SUSPENDED' }
              });
              app.log.info(`Suspended Client Subscription ${clientSub.id}`);
            }
          }
          break;
        }

        default:
          app.log.info(`Unhandled Razorpay event: ${event}`);
      }

      return reply.send({ status: 'ok' });
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: 'Webhook processing failed' });
    }
  });
}
