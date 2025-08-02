import type { ReactNode } from 'react';
import Navbar from './Navbar';    

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-light font-sans">
      <Navbar />                             {/* header */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
