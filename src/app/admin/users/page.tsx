
import Link from 'next/link';
import { ArrowLeft, Users, Edit, Trash2 } from 'lucide-react'; // PlusCircle removed as Add User is not implemented
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { User } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin'; // Using Firebase Admin SDK

async function getUsersFromFirestore(): Promise<User[]> {
  if (!adminDb) {
    console.error("AdminUsersPage: Firebase Admin SDK is not initialized. Users cannot be fetched.");
    // Propagate a specific error or return empty to indicate failure clearly
    throw new Error("Admin SDK not initialized, cannot fetch users.");
  }
  try {
    const usersCol = adminDb.collection('users');
    // No query needed for just listing all users from admin context
    const userSnapshot = await usersCol.get();
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
  } catch (error) {
    console.error("Error fetching users from Firestore (Admin SDK):", error);
    throw error; // Re-throw the error to be caught by the page component
  }
}

export default async function AdminUsersPage() {
  let users: User[] = [];
  let error: string | null = null;

  try {
    users = await getUsersFromFirestore();
  } catch (e: any) {
    console.error("Failed to fetch users for AdminUsersPage:", e.message);
    if (e.message === "Admin SDK not initialized, cannot fetch users.") {
      error = "Server configuration error: Unable to connect to the database to fetch users. Please check server logs. (Admin SDK not initialized)";
    } else {
      error = `Failed to load users. Please ensure Firebase is configured correctly and you have a 'users' collection. Details: ${e.message}`;
    }
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
            <CardDescription>View and manage application users from Firestore (Admin Access).</CardDescription>
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
            <p className="text-muted-foreground">No users found in Firestore, or Firebase Admin SDK is not configured correctly. Users will appear here after they register.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
