import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIDI 2.0｜企业 AI 工作平台 Demo",
  description: "雅迪企业内部 AI 工作平台 AIDI 2.0 交互原型。",
  icons: {
    icon: "/aidi-logo.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
