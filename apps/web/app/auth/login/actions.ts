"use server"

import { signIn } from "../../../auth"
import { AuthError } from "next-auth"

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const code = formData.get("code") as string;
    console.log("Attempting sign in for:", email);
    
    await signIn("credentials", {
      email,
      password,
      code: code || "",
      redirect: true,
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
          return "Something went wrong."
      }
    }
    
    // Rethrow redirect errors and unknown errors so Next.js can handle them
    throw error
  }
}
