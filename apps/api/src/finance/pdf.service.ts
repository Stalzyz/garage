import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from './invoice-pdf';
import { ProposalPDF } from '../crm/proposal-pdf';

export async function generateInvoicePDF(props: Parameters<typeof InvoicePDF>[0]): Promise<Buffer> {
  const element = React.createElement(InvoicePDF, props);
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}

export async function generateProposalPDF(props: Parameters<typeof ProposalPDF>[0]): Promise<Buffer> {
  const element = React.createElement(ProposalPDF, props);
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
