import "./globals.css";

export const metadata = {
  title: "Sherlog",
  description: "Real-Time Microcap Intelligence Terminal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-bg font-sans text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
