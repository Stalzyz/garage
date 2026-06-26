import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseTemplate } from './BaseTemplate';

export function TrialReminderEmail({ leadName, courseInterest, trialDate }: { leadName: string, courseInterest?: string, trialDate?: string }) {
  const course = courseInterest || 'our masterclass bootcamps';
  const dateStr = trialDate || 'tomorrow';
  return (
    <BaseTemplate previewText="Your Academy Trial Class is scheduled!">
      <Section>
        <Text className="text-2xl font-bold text-white mb-4">
          Hi {leadName}, ready to level up?
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-6">
          Your interactive, live trial session for the <strong>{course}</strong> is scheduled for <strong>{dateStr}</strong>.
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-6">
          Meet your instructors, interact with peers, and get hands-on experience in our virtual classroom environment. Make sure to join from a laptop or desktop computer for the best experience.
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-8">
          Use the button below to join the trial class room. We suggest logging in 5 minutes early to test your audio/video:
        </Text>
        <Button
          href="https://grekamos.com/academy/trial-room"
          className="bg-blue-600 rounded-lg text-white px-6 py-3 font-semibold no-underline inline-block text-center"
        >
          Join Trial Class
        </Button>
      </Section>
    </BaseTemplate>
  );
}
