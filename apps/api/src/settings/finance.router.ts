import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const UpdateFinanceSettingsSchema = z.object({
  baseCurrency:    z.string().optional(),
  currencySymbol:  z.string().optional(),
  taxModel:        z.enum(['GST', 'VAT', 'NONE']).optional(),
  gstNumber:       z.string().optional().or(z.literal('')),
  vatNumber:       z.string().optional().or(z.literal('')),
  fiscalYearStart: z.number().min(1).max(12).optional(),
  invoicePrefix:   z.string().optional(),
});

export default async function financeSettingsRouter(app: FastifyInstance) {
  // GET /api/v1/settings/finance
  app.get('/finance', async (req, reply) => {
    let settings = await app.prisma.financeSettings.findFirst();
    if (!settings) {
      settings = await app.prisma.financeSettings.create({ data: {} });
    }
    return { ...settings, currencies: CURRENCIES };
  });

  // PATCH /api/v1/settings/finance
  app.patch('/finance', async (req, reply) => {
    const body = UpdateFinanceSettingsSchema.parse(req.body);
    let settings = await app.prisma.financeSettings.findFirst();
    if (!settings) {
      settings = await app.prisma.financeSettings.create({ data: body });
    } else {
      settings = await app.prisma.financeSettings.update({
        where: { id: settings.id },
        data: body,
      });
    }
    return settings;
  });
}
