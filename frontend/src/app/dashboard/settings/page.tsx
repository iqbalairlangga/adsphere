'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Smartphone, Bell, Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState({
    email: true, push: true, campaignAlerts: true, billingAlerts: true, weeklyReport: false,
  });

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', company: user?.company || '', website: user?.website || '', bio: user?.bio || '' },
  });

  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = (data: ProfileData) => {
    toast({ title: 'Profile updated', variant: 'success' });
  };

  const onPasswordSubmit = (data: PasswordData) => {
    toast({ title: 'Password changed', variant: 'success' });
    passwordForm.reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2"><Key className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="password" className="gap-2"><Shield className="h-4 w-4" /> Password</TabsTrigger>
          <TabsTrigger value="2fa" className="gap-2"><Smartphone className="h-4 w-4" /> Two-Factor</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...profileForm.register('name')} error={profileForm.formState.errors.name?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...profileForm.register('email')} error={profileForm.formState.errors.email?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" {...profileForm.register('company')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" placeholder="https://example.com" {...profileForm.register('website')} error={profileForm.formState.errors.website?.message} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...profileForm.register('bio')}
                  />
                </div>
                <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} error={passwordForm.formState.errors.currentPassword?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} error={passwordForm.formState.errors.newPassword?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} error={passwordForm.formState.errors.confirmPassword?.message} />
                </div>
                <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2fa">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">Use Google Authenticator or Authy</p>
                </div>
                <Button variant="outline" className="gap-2"><Smartphone className="h-4 w-4" /> Set up</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">SMS Authentication</p>
                  <p className="text-sm text-muted-foreground">Receive codes via SMS</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'email' && 'Receive notifications via email'}
                        {key === 'push' && 'Receive push notifications'}
                        {key === 'campaignAlerts' && 'Campaign status changes and milestones'}
                        {key === 'billingAlerts' && 'Billing and payment notifications'}
                        {key === 'weeklyReport' && 'Weekly performance summary'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [key]: checked }))}
                    />
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
