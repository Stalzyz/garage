import { redirect } from 'next/navigation';

export default function LmsRedirect() {
  // Redirect to the standalone academy-web application running on port 3001
  redirect('http://localhost:3001');
}
