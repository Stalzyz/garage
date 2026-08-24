import * as React from 'react';
import { Text } from '@react-email/components';
import { BrandConfig } from '../../utils/brand';
import { EmailLayout, EmailButton } from './components';

export interface TemplateNotificationProps {
  brand: BrandConfig;
  subject: string;
  greeting?: string;
  message: string[];
  buttonText?: string;
  buttonUrl?: string;
}

export const TemplateNotification = ({
  brand,
  subject,
  greeting = 'Hello,',
  message,
  buttonText,
  buttonUrl,
}: TemplateNotificationProps) => {
  return (
    <EmailLayout brand={brand} previewText={subject}>
      <Text style={textStyle}>{greeting}</Text>
      
      {message.map((paragraph, index) => (
        <Text key={index} style={textStyle}>{paragraph}</Text>
      ))}

      {buttonText && buttonUrl && (
        <EmailButton text={buttonText} href={buttonUrl} color={brand.primaryColor} />
      )}

      <Text style={signoffStyle}>
        Best regards,<br />
        The {brand.companyName} Team
      </Text>
    </EmailLayout>
  );
};

const textStyle = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const signoffStyle = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
};
