"use client";

import { useState, useEffect } from "react";
import { getHiringPartners } from "../../app/actions/courses";
import { TrustedByMarquee } from "./TrustedByMarquee";
import { TrustedBy } from "./TrustedBy";

export function HiringPartners() {
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getHiringPartners();
      setPartners(data || []);
    }
    load();
  }, []);

  if (partners.length > 0) {
    return <TrustedByMarquee partners={partners} />;
  }

  // Fallback to the original static component if no companies found
  return <TrustedBy />;
}
