import { EventEmitter } from 'events';

// Create a strongly typed Global Event Bus using Node's built-in EventEmitter
class GlobalEventBus extends EventEmitter {}

export const EventBus = new GlobalEventBus();

// List of all system events to prevent typos
export const SystemEvents = {
  // CRM
  LEAD_CREATED: 'lead.created',
  LEAD_WON: 'lead.won',
  PROPOSAL_SIGNED: 'proposal.signed',
  
  // Finance
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',

  // LMS / Academy
  STUDENT_ENROLLED: 'student.enrolled',
  ASSIGNMENT_SUBMITTED: 'assignment.submitted',
  ASSIGNMENT_GRADED: 'assignment.graded',
  COURSE_COMPLETED: 'course.completed',
  ACADEMY_ENQUIRY_RECEIVED: 'academy.enquiry.received',
  ACADEMY_TRIAL_SCHEDULED: 'academy.trial.scheduled',
  ACADEMY_LEAD_INACTIVE: 'academy.lead.inactive',
  FEE_PAID: 'fee.paid',
  FEE_DUE_REMINDER: 'fee.due_reminder',
  FEE_OVERDUE: 'fee.overdue',

  // Projects
  PROJECT_STARTED: 'project.started',
  TASK_ASSIGNED: 'task.assigned',

  // HR
  LEAVE_REQUESTED: 'leave.requested',
  LEAVE_APPROVED: 'leave.approved',
};
