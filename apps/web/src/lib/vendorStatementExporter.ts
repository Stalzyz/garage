/**
 * Vendor Financial Statement & Tax Exporter
 * Generates formatted CSV exports for Monthly Payout Statements & 1099-K / GST Summaries
 */

export interface StatementRecord {
  payoutId: string;
  requestedAt: string;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  status: string;
  bankName: string;
}

export function exportVendorStatementCSV(vendorName: string, records: StatementRecord[]) {
  const headers = ['Payout Ref ID', 'Request Date', 'Gross Revenue (INR)', 'Platform Fee (INR)', 'Net Vendor Disbursal (INR)', 'Status', 'Bank Account'];
  
  const rows = records.map(r => [
    r.payoutId,
    r.requestedAt,
    r.grossAmount.toFixed(2),
    r.platformFee.toFixed(2),
    r.netPayout.toFixed(2),
    r.status,
    `"${r.bankName}"`
  ]);

  const csvContent = [
    `# Financial Statement for ${vendorName}`,
    `# Generated on: ${new Date().toISOString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${vendorName.replace(/\s+/g, '_')}_Financial_Statement.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
