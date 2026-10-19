import type { NextConfig } from "next";

// O frontend não acessa banco nem IA: tudo passa pela API do backend.
// Encaminhar /api para o backend mantém o cookie de sessão no mesmo domínio.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  // Raiz deste projeto (evita o Next "adivinhar" a raiz pelas pastas de cima).
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
