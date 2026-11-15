import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

// Inter para o texto corrido; Plus Jakarta Sans para títulos (mais personalidade).
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Job Analyzer",
  description: "Sua central de vagas: coleta, analisa com IA de acordo com seu perfil e avisa das melhores.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${jakarta.variable}`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
