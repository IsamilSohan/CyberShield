
import Link from 'next/link';
import { ArrowLeft, Users, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

async function getUsersFromFirestore(): Promise<User[]> {
  const usersCol = collection(db, 'users');
  const q = query(usersCol);
  const userSnapshot = await getDocs(q);
  const usersList = userSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id, // Firestore document ID is user.uid
      name: data.name || 'N/A',
      email: data.email || 'N/A',
      enrolledCourses: data.enrolledCourses || [],
      certificates: data.certificates || [],
      // isAdmin: data.isAdmin || false, // If you add an isAdmin field
    } as User;
  });
  return usersList;
}

export default async function AdminUsersPage() {
  let users: User[] = [];
  let error: string | null = null;

  try {
    users = await getUsersFromFirestore();
  } catch (e) {
    console.error("Failed to fetch users from Firestore:", e);
    error = "Failed to load users. Please ensure Firebase is configured correctly and you have a 'users' collection.";
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin Dashboard
      </Link>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-2xl">
              <Users className="mr-3 h-6 w-6 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>View and manage application users from Firestore.</CardDescription>
          </div>
          {/* <Button asChild>
            <Link href="/admin/users/new"> // Future: Add New User page
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New User
            </Link>
          </Button> */}
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
          )}
          {!error && users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">User ID (UID)</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Enrolled Courses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium truncate max-w-xs">{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-center">{user.enrolledCourses.length}</TableCell>
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
          ) : !error && (
            <p className="text-muted-foreground">No users found in Firestore, or Firebase is not configured. Users will appear here after they register.</p>
          )}
          {/* <div className="mt-6 text-right">
            <Button>Add New User</Button> // Kept original button, can be linked later
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
