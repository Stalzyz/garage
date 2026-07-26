import { prisma } from "../../src/lib/prisma";
import { TrustedByMarquee } from "./TrustedByMarquee";
import { TrustedBy } from "./TrustedBy";

export async function HiringPartners() {
  let partners: any[] = [];
  try {
    partners = await prisma.placementCompany.findMany({
      select: {
        name: true,
        logoUrl: true,
      },
      take: 15, // limit to 15 companies
    });
  } catch (error) {
    console.warn("Could not fetch placement companies from database during build, using fallbacks.");
  }

  if (partners.length > 0) {
    return <TrustedByMarquee partners={partners} />;
  }

  // Fallback to the original static component if no companies found
  return <TrustedBy />;
}
