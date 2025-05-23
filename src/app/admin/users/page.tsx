
import Link from 'next/link';
import { ArrowLeft, Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { placeholderUsers } from '@/lib/data';

export default function AdminUsersPage() {
  const users = placeholderUsers;

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin Dashboard
      </Link>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Users className="mr-3 h-6 w-6 text-primary" />
            User Management
          </CardTitle>
          <CardDescription>View and manage application users.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrolled Courses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium truncate max-w-xs">{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="truncate max-w-xs">{user.enrolledCourses.join(', ')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" aria-label={`Edit user ${user.name}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" aria-label={`Delete user ${user.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No users found.</p>
          )}
          <div className="mt-6 text-right">
            <Button>Add New User</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
