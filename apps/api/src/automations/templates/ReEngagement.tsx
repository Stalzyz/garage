import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseTemplate } from './BaseTemplate';

export function ReEngagementEmail({ leadName, courseInterest }: { leadName: string, courseInterest?: string }) {
  const course = courseInterest || 'our masterclass bootcamps';
  return (
    <BaseTemplate previewText="Don't miss your chance to enroll!">
      <Section>
        <Text className="text-2xl font-bold text-white mb-4">
          We miss you, {leadName}!
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-6">
          A few days ago, you enquired about our <strong>{course}</strong>. We wanted to reach out and check if you have any questions about the curriculum, schedule, or financing options.
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-6">
          Seats for the upcoming batch are filling up fast, and we are currently offering a limited-time 10% early-bird enrollment discount.
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-8">
          If you are still interested, click the button below to schedule a 1-on-1 counseling call with our lead instructor:
        </Text>
        <Button
          href="https://grekamos.com/academy/schedule-call"
          className="bg-blue-600 rounded-lg text-white px-6 py-3 font-semibold no-underline inline-block text-center"
        >
          Book Counseling Call
        </Button>
      </Section>
    </BaseTemplate>
  );
}
