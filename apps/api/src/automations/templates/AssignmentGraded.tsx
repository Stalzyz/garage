import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseTemplate } from './BaseTemplate';

export function AssignmentGradedEmail({ studentName, courseName, score, portalUrl }: { studentName: string, courseName: string, score: number, portalUrl: string }) {
  const isPassing = score >= 70;
  
  return (
    <BaseTemplate previewText={`Your assignment for ${courseName} was graded!`}>
      <Section>
        <Text className="text-2xl font-bold text-white mb-4">
          Assignment Graded 🎓
        </Text>
        <Text className="text-[#a1a1aa] text-base leading-6 mb-6">
          Hi {studentName}, your instructor has reviewed your recent submission for <strong>{courseName}</strong>.
        </Text>
        
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 mb-8 text-center">
          <Text className="text-[#666] text-sm uppercase tracking-widest font-bold m-0 mb-2">Final Score</Text>
          <Text className={`text-5xl font-bold m-0 ${isPassing ? 'text-emerald-400' : 'text-amber-400'}`}>
            {score}/100
          </Text>
        </div>

        <Button
          href={portalUrl}
          className="bg-blue-600 rounded-lg text-white px-6 py-3 font-semibold no-underline"
        >
          View Feedback
        </Button>
      </Section>
    </BaseTemplate>
  );
}
