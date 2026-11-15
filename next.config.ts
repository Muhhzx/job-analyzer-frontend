import type { NextConfig } from "next";

// O frontend não acessa banco nem IA: tudo passa pela API do backend.
// Encaminhar /api para o backend mantém o cookie de sessão no mesmo domínio.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  // Raiz deste projeto (evita o Next "adivinhar" a raiz pelas pastas de cima).
  outputFileTracingRoot: __dirname,
  // Pasta do build. Trocável por variável para rodar um build de teste sem
  // atrapalhar o `npm run dev` que usa a pasta .next padrão.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Cabeçalhos de segurança em todas as páginas: não pode ser aberto dentro de iframe de outro site
  // (clickjacking), o navegador não adivinha tipos de arquivo e o endereço completo não vaza para outros sites.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
