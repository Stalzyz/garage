import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseTemplate } from './BaseTemplate';

export function WelcomeClientEmail({ clientName, loginUrl }: { clientName: string, loginUrl: string }) {
  return (
    <BaseTemplate previewText="Welcome to Grekam Visuals!">
      <Section>
        <Text className="text-2xl font-bold text-white mb-4">
          Welcome aboard, {clientName}!
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-6">
          We are absolutely thrilled to partner with you. Your project has officially been provisioned in our system, and our team is already reviewing the brief.
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-8">
          You can track project milestones, view and sign proposals, and download all final deliverables directly through your dedicated Client Portal.
        </Text>
        <Button
          href={loginUrl}
          className="bg-blue-600 rounded-lg text-white px-6 py-3 font-semibold no-underline"
        >
          Access Client Portal
        </Button>
      </Section>
    </BaseTemplate>
  );
}
