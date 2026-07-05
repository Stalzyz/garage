import { redirect } from 'next/navigation';

export default function AcademyDashboardRedirect() {
  redirect('/dashboard/academy/students');
}
