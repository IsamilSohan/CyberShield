
"use client";

import Link from 'next/link';
import { ShieldCheck, LogOut, LogIn, UserCog } from 'lucide-react'; // UserCog for Admin
import { Button } from '@/components/ui/button';
import { APP_NAME, NAV_LINKS } from '@/lib/constants';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth'; // Import onAuthStateChanged and signOut

// Mock admin state - in a real app, this would come from user roles/permissions
// For example, you might fetch user data from Firestore and check an 'isAdmin' field.
const MOCK_IS_ADMIN = true; 

export function Header() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // In a real app, you would fetch user roles here from Firestore
        // For now, we'll use a mock value if a user is logged in.
        // Example: fetch user doc from Firestore users/{user.uid} and check an isAdmin field
        setIsAdmin(MOCK_IS_ADMIN); // This should be replaced with actual role checking
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Logout error:", error);
      // Handle logout error if needed
    }
  };
  
  const isAuthenticated = !!currentUser;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-4">
          {NAV_LINKS.filter(link => 
            (!link.authRequired && !link.publicOnly && !link.adminRequired) ||
            (link.authRequired && isAuthenticated && !link.adminRequired) ||
            (link.publicOnly && !isAuthenticated) ||
            (link.adminRequired && isAuthenticated && isAdmin) 
          ).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-foreground/70"
              )}
            >
              {/* Special case for Admin link to use UserCog icon */}
              {link.label === "Admin" && link.adminRequired && isAuthenticated && isAdmin ? (
                <>
                  <UserCog className="mr-1 h-4 w-4 inline-block" /> {link.label}
                </>
              ) : (
                link.label
              )}
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
