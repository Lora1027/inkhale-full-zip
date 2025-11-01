import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-2xl font-bold">Inkhale Pro</h1>
            <nav className="flex gap-2 sm:ml-auto">
              <Tab href="/">Dashboard</Tab>
              <Tab href="/income">Income</Tab>
              <Tab href="/expenses">Expenses</Tab>
              <Tab href="/methods">Methods</Tab>
              <Tab href="/inventory">Inventory</Tab>
              <Tab href="/comparison">Comparison</Tab>
              <Tab href="/reports">Reports</Tab>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
function Tab({ href, children }: { href: string; children: React.ReactNode }){
  return <Link className="px-3 py-2 rounded-xl bg-white border text-sm hover:bg-gray-50" href={href}>{children}</Link>;
}
