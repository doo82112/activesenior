import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { BFCacheHandler } from "@/components/main/BFCacheHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Active Senior - 활기찬 시니어를 위한 커뮤니티",
  description: "당신의 생각을 공유하고 새로운 인연을 만나보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.addEventListener('pageshow', function(event) {
                  if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
                    window.location.reload();
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-200 antialiased">
        <BFCacheHandler />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
