import { z } from 'zod';
const LeadSourceValues = ['WEBSITE', 'WHATSAPP', 'REFERRAL', 'COLD_OUTREACH', 'INSTAGRAM', 'LINKEDIN', 'ACADEMY_ALUMNI', 'OTHER'] as const;
const LeadStatusValues = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ENQUIRY', 'COUNSELLING', 'TRIAL', 'ENROLLED_ACADEMY', 'DROPPED'] as const;

const CreateLeadSchema = z.object({
  name: z.string().min(1),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  phone: z.union([z.string(), z.literal("")]).optional(),
  company: z.string().optional(),
  source: z.enum(LeadSourceValues).optional().default('WEBSITE'),
  status: z.enum(LeadStatusValues).optional(),
  estimatedBudget: z.number().optional(),
  projectType: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.union([z.string(), z.literal("")]).optional().transform(val => val === "" ? undefined : val),
  businessUnit: z.enum(['AGENCY', 'ACADEMY']).optional(),
  courseInterest: z.string().optional(),
  batchId: z.string().optional(),
});

const payload = {
  name: "Test Lead",
  email: "",
  phone: "",
  courseInterest: "",
  source: "WEBSITE",
  businessUnit: "ACADEMY",
  status: "ENQUIRY"
};

try {
  console.log(CreateLeadSchema.parse(payload));
} catch (e: any) {
  console.error(e.errors);
}
