
import Link from 'next/link';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'; // Renamed to avoid conflict
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin Dashboard
      </Link>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <SettingsIcon className="mr-3 h-6 w-6 text-primary" />
            Site Settings
          </CardTitle>
          <CardDescription>Configure application-wide settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input id="appName" defaultValue="Cyber Shield Defender" />
            <p className="text-sm text-muted-foreground">
              This name will be displayed in the header and other places.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            <div className="flex items-center space-x-2">
              <Switch id="maintenanceMode" aria-label="Toggle maintenance mode" />
              <span className="text-sm text-muted-foreground">
                Temporarily disable access to the site for users.
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Admin Email</Label>
            <Input id="adminEmail" type="email" placeholder="admin@example.com" />
             <p className="text-sm text-muted-foreground">
              Contact email for administrative purposes.
            </p>
          </div>

          <div className="border-t pt-6 text-right">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
