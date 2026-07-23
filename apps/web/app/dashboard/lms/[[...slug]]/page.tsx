import { redirect } from 'next/navigation';

export default async function DashboardLmsRedirect({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.slug ? `/${resolvedParams.slug.join('/')}` : '';
  redirect(`https://academy.grekam.in${path}`);
}
