import "@/app/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Grekam Academy",
  description: "Immersive Learning Portal",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#050505] text-white min-h-screen antialiased selection:bg-blue-500/30 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
