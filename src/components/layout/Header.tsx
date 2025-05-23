
"use client"; // For handling auth state, though mocked for now

import Link from 'next/link';
import { ShieldCheck, UserCircle, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME, NAV_LINKS } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function Header() {
  // Mock authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  // Effect to simulate auth check on mount (e.g., from localStorage or a cookie)
  useEffect(() => {
    // In a real app, check actual auth status
    // For now, let's toggle based on a dummy item or randomly
    const mockAuth = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(mockAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    // router.push('/auth/login'); // Or wherever you want to redirect after logout
  };
  
  const handleLoginLink = () => {
    // This is a mock function. In a real app, login would set this.
    // For testing purposes, clicking Login then Register can simulate login.
    if (pathname === '/auth/register' && !isAuthenticated) {
       // Simulate login after registration for demo purposes
       // This is a simplified mock. Real auth flow is more complex.
       // localStorage.setItem('isAuthenticated', 'true');
       // setIsAuthenticated(true);
    }
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-4">
          {NAV_LINKS.filter(link => 
            (!link.authRequired && !link.publicOnly) ||
            (link.authRequired && isAuthenticated) ||
            (link.publicOnly && !isAuthenticated)
          ).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.href === '/auth/login' ? handleLoginLink : undefined}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-foreground/70"
              )}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            pathname !== '/auth/login' && pathname !== '/auth/register' && (
               <Button asChild variant="ghost" size="sm">
                 <Link href="/auth/login">
                   <LogIn className="mr-2 h-4 w-4" /> Login
                 </Link>
               </Button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
