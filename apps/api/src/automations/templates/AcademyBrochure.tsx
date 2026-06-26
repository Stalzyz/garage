import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseTemplate } from './BaseTemplate';

export function AcademyBrochureEmail({ leadName, courseInterest }: { leadName: string, courseInterest?: string }) {
  const course = courseInterest || 'our masterclass bootcamps';
  return (
    <BaseTemplate previewText={`Here is your brochure for ${course}`}>
      <Section>
        <Text className="text-2xl font-bold text-white mb-4">
          Hello {leadName},
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-6">
          Thank you for your interest in our <strong>{course}</strong>. We are excited to support your creative journey!
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-6">
          Our curriculum is custom-crafted to take you from a beginner to building a stunning professional portfolio. Learn from industry leaders, work on real projects, and join a vibrant creative community.
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-8">
          We offer free live trial classes every week. Click the button below to secure your spot for the next session:
        </Text>
        <Button
          href="https://grekamos.com/academy/trial"
          className="bg-blue-600 rounded-lg text-white px-6 py-3 font-semibold no-underline inline-block text-center"
        >
          Book Your Free Trial Class
        </Button>
      </Section>
    </BaseTemplate>
  );
}
