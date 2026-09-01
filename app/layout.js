import "./globals.css";

export const metadata = {
  title: "Microcap Engine",
  description: "Real-Time Microcap Intelligence Terminal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
