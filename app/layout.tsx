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
      <body className="antialiased">
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-50 -translate-y-full rounded-md bg-blue-600 px-4 py-2 text-white focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          跳至主内容
        </a>
        {children}
      </body>
    </html>
  );
}
