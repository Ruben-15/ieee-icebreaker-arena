import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ActivityProvider } from "@/context/ActivityContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IEEE Icebreaker Arena",
  description:
    "A real-time networking platform for IEEE Student Branch orientations. Break the ice, make connections, climb the leaderboard!",
  keywords: ["IEEE", "networking", "icebreaker", "student branch", "orientation"],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "IEEE Icebreaker Arena",
    description: "Real-time networking platform for IEEE Student Branch orientations",
    type: "website",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#0a0f1e] text-white antialiased">
        <AuthProvider>
          <ActivityProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "rgba(20, 29, 46, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f8fafc",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                },
                success: {
                  iconTheme: { primary: "#22c55e", secondary: "#0a0f1e" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "#0a0f1e" },
                },
              }}
            />
          </ActivityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
