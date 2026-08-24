import React from 'react';
import { render } from '@react-email/render';
import { TemplateNotification, TemplateNotificationProps } from './email-system/TemplateNotification';

export async function generateNotificationEmailHtml(props: TemplateNotificationProps): Promise<string> {
  const emailHtml = await render(React.createElement(TemplateNotification, props));
  return emailHtml;
}
