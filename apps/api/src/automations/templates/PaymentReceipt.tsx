import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseTemplate } from './BaseTemplate';

export function PaymentReceiptEmail({ clientName, invoiceNumber, amount, portalUrl }: { clientName: string, invoiceNumber: string, amount: string, portalUrl: string }) {
  return (
    <BaseTemplate previewText={`Payment Receipt for Invoice #${invoiceNumber}`}>
      <Section>
        <Text className="text-2xl font-bold text-emerald-400 mb-4">
          Payment Successful 💸
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-6">
          Hi {clientName}, we have successfully received your payment of <strong>{amount}</strong> for Invoice #{invoiceNumber}.
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-8">
          A copy of your paid invoice is permanently stored in your client portal for your records.
        </Text>
        <Button
          href={portalUrl}
          className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 rounded-lg px-6 py-3 font-semibold no-underline"
        >
          View Invoice
        </Button>
      </Section>
    </BaseTemplate>
  );
}
