import { redirect } from "next/navigation"

export default function LandingHub() {
  // Since this app is now exclusively the Academy, redirect the root to the Student OS (LMS 2.0).
  // The NextAuth middleware will automatically handle routing unauthenticated users to the login screen.
  redirect("/dashboard/student")
}
