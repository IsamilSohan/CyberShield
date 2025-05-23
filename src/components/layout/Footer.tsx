import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="mt-1">Empowering Your Cyber Defenses.</p>
      </div>
    </footer>
  );
}
