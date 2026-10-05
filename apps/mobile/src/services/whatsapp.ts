import { Linking } from 'react-native';

export interface WhatsAppTemplate {
  id: string;
  title: string;
  badge: string;
  color: string;
  getMessage: (lead: { name: string; company?: string; service: string; amount: string }) => string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'speed_pitch',
    title: 'Instant Portfolio & Case Studies Deck',
    badge: 'Speed-to-Lead',
    color: '#ec4899',
    getMessage: (lead) =>
      `Hi ${lead.name}! Thank you for reaching out regarding your project for ${lead.company || 'your brand'}. Here is our verified web app & marketing case study portfolio: https://garage.grekam.in/portfolio. When would be a good time for a quick 10-minute discovery call?`,
  },
  {
    id: 'proposal',
    title: 'Project Proposal & SOW Estimate',
    badge: 'High Value',
    color: '#34d399',
    getMessage: (lead) =>
      `Hi ${lead.name}, thank you for discussing your project requirements with our digital agency! As agreed, here is your project scope & estimate for ${lead.company || 'your project'} (${lead.service}) totaling ${lead.amount}. You can review the milestone breakdown and live proposal here: https://garage.grekam.in/proposal`,
  },
  {
    id: 'discovery',
    title: 'Discovery Call Follow-Up',
    badge: 'Discovery',
    color: '#60a5fa',
    getMessage: (lead) =>
      `Hi ${lead.name}, we just tried reaching you regarding your web development & marketing inquiry for ${lead.company || 'your project'}. When would be a good time to connect for a 15-minute technical discovery session?`,
  },
  {
    id: 'sprint_milestone',
    title: 'Sprint Demo & Staging Sign-Off',
    badge: 'Milestone',
    color: '#a855f7',
    getMessage: (lead) =>
      `Hello ${lead.name}, great news! Sprint Milestone "${lead.service}" for ${lead.company || 'your project'} has been deployed to staging for your team's review and sign-off. Staging URL: https://staging.grekam.in/demo`,
  },
  {
    id: 'retainer_invoice',
    title: 'Monthly Retainer & Campaign Report',
    badge: 'Retainer',
    color: '#f59e0b',
    getMessage: (lead) =>
      `Hi ${lead.name}, your monthly performance marketing & maintenance retainer for ${lead.company || 'your brand'} (${lead.amount}) is ready along with this month's analytics report. Pay invoice: https://garage.grekam.in/pay`,
  },
];

export function getOverdueNudge(clientName: string, invoiceNo: string, amount: string, isUrgent = false) {
  if (isUrgent) {
    return (
      `Hi ${clientName}, to ensure uninterrupted staging server hosting and scheduled engineering sprints for your project, ` +
      `please complete the pending milestone payment for ${invoiceNo} (${amount}) today.\n\n` +
      `• Direct 1-Tap UPI: upi://pay?pa=billing@grekam.in&pn=Grekam%20OS&am=${amount.replace(/[^0-9]/g, '')}&cu=INR\n` +
      `• Online Payment Link: https://garage.grekam.in/verify/invoice/${invoiceNo}\n\n` +
      `Please let us know once transferred so our DevOps team keeps deployment pipelines active.`
    );
  }

  return (
    `Hi ${clientName}, friendly reminder regarding invoice ${invoiceNo} (${amount}) for your agency services.\n\n` +
    `• Direct 1-Tap UPI: upi://pay?pa=billing@grekam.in&pn=Grekam%20OS&am=${amount.replace(/[^0-9]/g, '')}&cu=INR\n` +
    `• Online Card / NetBanking: https://garage.grekam.in/verify/invoice/${invoiceNo}\n\n` +
    `Thank you!`
  );
}

export function getClientBlockerMessage(clientName: string, projectName: string, blocker: string) {
  return (
    `Hello ${clientName}!\n\n` +
    `Our engineering team is ready to ship the next sprint for "${projectName}", ` +
    `but we are currently blocked waiting on: *${blocker}*.\n\n` +
    `Could you please share this at your earliest convenience so we stay on track for your target launch date? Thank you!`
  );
}

export function getFounderReassuranceMessage(clientName: string, projectName: string, reason: string) {
  return (
    `Hi ${clientName}!\n\n` +
    `Stalin here, checking in personally on behalf of our agency leadership regarding "${projectName}".\n\n` +
    `I am actively monitoring your sprint deliverables: ${reason}. Our team is fully committed to ensuring a flawless launch.\n\n` +
    `Let me know if you would like to connect for a quick 10-minute executive alignment call today!`
  );
}

export async function sendWhatsAppMessage(phone: string, text: string) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);

  const nativeUrl = cleanPhone
    ? `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`
    : `whatsapp://send?text=${encodedText}`;

  const webUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  try {
    const supported = await Linking.canOpenURL(nativeUrl);
    if (supported) {
      await Linking.openURL(nativeUrl);
    } else {
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.warn('Could not launch WhatsApp native scheme, using web fallback:', error);
    try {
      await Linking.openURL(webUrl);
    } catch (e) {
      console.warn('Web URL fallback failed:', e);
    }
  }
}

