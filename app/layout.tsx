import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "国内航班与价格查询",
  description: "按出发地、目的地与日期查询国内航班与价格",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
