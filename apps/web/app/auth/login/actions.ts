"use server"

import { signIn } from "../../../auth"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const code = formData.get("code") as string;
    console.log("Attempting sign in for:", email);

    // Pre-check: validate credentials before calling signIn so we can return specific errors
    if (!code) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        return "No account found with that email address.";
      }
      const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordsMatch) {
        return "Incorrect password. Please try again.";
      }
    }
    
    await signIn("credentials", {
      email,
      password,
      code: code || "",
      redirectTo: "/dashboard",
    })
    console.log("Sign in successful!");
  } catch (error) {
    console.log("Sign in error caught:", error);
    
    if (error instanceof AuthError) {
      const customMsg = (error as any).cause?.err?.message || error.message || "";
      if (customMsg.includes("2FA_REQUIRED")) {
        return "2FA_REQUIRED";
      }
      if (customMsg.includes("2FA_INVALID")) {
        return "2FA_INVALID";
      }

      switch (error.type) {
        case "CredentialsSignin":
        case "CallbackRouteError":
          return "Invalid credentials."
        default:
          return `Authentication error: ${error.type}`
      }
    }
    
    // Rethrow redirect errors and unknown errors so Next.js can handle them
    throw error
  }
}
