
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Users, BookOpen, Settings, Newspaper } from 'lucide-react'; // Added Newspaper icon
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <ShieldAlert className="mr-3 h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage application users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="mt-4 w-full">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Course Management
            </CardTitle>
            <CardDescription>
              Create, edit, and manage courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="mt-4 w-full">
              <Link href="/admin/courses">Manage Courses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Newspaper className="mr-2 h-5 w-5 text-primary" /> {/* Changed icon */}
              Blog Management
            </CardTitle>
            <CardDescription>
              Create, edit, and manage blog posts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="mt-4 w-full">
              <Link href="/admin/blog">Manage Blog Posts</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Site Settings
            </CardTitle>
            <CardDescription>
              Configure application-wide settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="mt-4 w-full">
              <Link href="/admin/settings">Configure Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
