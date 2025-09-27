import './globals.css';

export const metadata = {
  title: 'Food & Grocery Marketplace',
  description: 'Vendor-Partner-Customer platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
            <a href="/" className="font-semibold">Food & Grocery</a>
            <nav className="flex gap-3">
              <a className="text-sm" href="/(auth)/login">Login</a>
              <a className="text-sm" href="/register/vendor">Register Vendor</a>
              <a className="text-sm" href="/register/partner">Register Partner</a>
              <a className="text-sm" href="/register/customer">Register Customer</a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}