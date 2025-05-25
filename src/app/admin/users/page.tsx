
import Link from 'next/link';
import { ArrowLeft, Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { User } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';
import { collection, getDocs, query as firestoreQuery, orderBy } from 'firebase-admin/firestore'; // Ensure correct import for admin

async function getUsersFromFirestore(): Promise<User[]> {
  if (!adminDb) {
    console.error("AdminUsersPage: Firebase Admin SDK not initialized. Users cannot be fetched.");
    throw new Error("Admin SDK not initialized, cannot fetch users.");
  }
  try {
    const usersCol = adminDb.collection('users');
    const q = firestoreQuery(usersCol, orderBy('name')); // Use adminDb's collection method
    const userSnapshot = await getDocs(q); // getDocs from admin/firestore
    
    const usersList = userSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, 
        name: data.name || 'N/A',
        email: data.email || 'N/A',
        enrolledCourses: Array.isArray(data.enrolledCourses) ? data.enrolledCourses : [],
        certificates: Array.isArray(data.certificates) ? data.certificates : [],
      } as User;
    });
    return usersList;
  } catch (error) {
    console.error("Error fetching users from Firestore (Admin SDK):", error);
    throw error; 
  }
}

export default async function AdminUsersPage() {
  let users: User[] = [];
  let error: string | null = null;

  try {
    users = await getUsersFromFirestore();
  } catch (e: any) {
    console.error("Failed to fetch users for AdminUsersPage:", e.message);
    if (e.message.includes("Admin SDK not initialized")) {
      error = "Server configuration error: Unable to connect to the database to fetch users. (Admin SDK not initialized)";
    } else if (e.message.includes("firestore/permission-denied") || e.message.includes("Missing or insufficient permissions")) {
       error = "Permission denied fetching users. Check Firestore rules or Admin SDK setup.";
    } else {
      error = `Failed to load users. Details: ${e.message}`;
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
            <CardDescription>View and manage application users (Admin Access).</CardDescription>
          </div>
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
                    <TableHead className="w-[250px] hidden sm:table-cell">User ID (UID)</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Enrolled</TableHead>
                    <TableHead className="hidden lg:table-cell text-center">Certs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium truncate max-w-xs hidden sm:table-cell">{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{user.enrolledCourses.length}</TableCell>
                      <TableCell className="hidden lg:table-cell text-center">{user.certificates.length}</TableCell>
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
            <p className="text-muted-foreground">No users found or unable to load users. Check server logs and Firebase configuration.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
