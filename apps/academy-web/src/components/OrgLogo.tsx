"use client";

import { Organization } from "@/lib/useOrganization";

interface OrgLogoProps {
  org: Organization;
  /** Size in pixels (applied as width & height via Tailwind-like style) */
  size?: number;
  className?: string;
}

/**
 * Renders the organization logo if one is saved, otherwise
 * falls back to a coloured initial avatar.
 */
export function OrgLogo({ org, size = 48, className = "" }: OrgLogoProps) {
  const initial = (org.name ?? "G").charAt(0).toUpperCase();

  if (org.logoUrl) {
    return (
      <img
        src={org.logoUrl}
        alt={`${org.name} logo`}
        className={`object-contain rounded-xl ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-xl flex items-center justify-center font-black text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initial}
    </div>
  );
}
