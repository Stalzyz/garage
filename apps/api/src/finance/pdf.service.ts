import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { TemplateInvoice, TemplateInvoiceProps } from '../documents/pdf-system/TemplateInvoice';
import { TemplateCertificate, TemplateCertificateProps } from '../documents/pdf-system/TemplateCertificate';
import { TemplateOfferLetter, TemplateOfferLetterProps } from '../documents/pdf-system/TemplateOfferLetter';
import { TemplateExperienceLetter, TemplateExperienceLetterProps } from '../documents/pdf-system/TemplateExperienceLetter';
import { TemplateExpenseReport, TemplateExpenseReportProps } from '../documents/pdf-system/TemplateExpenseReport';
import { TemplateProposal, TemplateProposalProps } from '../documents/pdf-system/TemplateProposal';

export async function generateInvoicePDF(props: TemplateInvoiceProps): Promise<Buffer> {
  const element = React.createElement(TemplateInvoice, props);
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}

export async function generateProposalPDF(props: TemplateProposalProps): Promise<Buffer> {
  const element = React.createElement(TemplateProposal, props);
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}

export async function generateCertificatePDF(props: TemplateCertificateProps): Promise<Buffer> {
  const element = React.createElement(TemplateCertificate, props);
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}

export async function generateOfferLetterPDF(props: TemplateOfferLetterProps): Promise<Buffer> {
  const element = React.createElement(TemplateOfferLetter, props);
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}

export async function generateExperienceLetterPDF(props: TemplateExperienceLetterProps): Promise<Buffer> {
  const element = React.createElement(TemplateExperienceLetter, props);
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}

export async function generateExpenseReportPDF(props: TemplateExpenseReportProps): Promise<Buffer> {
  const element = React.createElement(TemplateExpenseReport, props);
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
