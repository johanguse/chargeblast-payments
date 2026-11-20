import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const dashboardFont = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--dashboard-font",
});
export const metadata: Metadata = {
  title: "Transactions · cramly.ai",
  icons: {
    shortcut: "/favicon.ico",
    icon: [{ url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" }],
    apple: [{ url: "/favicon-180x180.png", sizes: "180x180" }],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dashboardFont.variable}>
      <body>{children}</body>
    </html>
  );
}
