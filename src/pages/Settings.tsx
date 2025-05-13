import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Settings2Icon, 
  SaveIcon, 
  UserIcon, 
  BuildingIcon, 
  MailIcon,
  PhoneIcon,
  GlobeIcon,
  ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { DEFAULT_HOSPITAL_NAME } from '@/lib/constants';
import { useHospital } from '@/hooks/useHospital';

export default function Settings() {
  const { hospitalName } = useHospital();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [hospitalSettings, setHospitalSettings] = useState({
    name: 'City General Hospital',
    type: 'government',
    email: 'contact@citygeneralhospital.org',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Center Blvd, Healthcare City, HC 12345',
    website: 'https://citygeneralhospital.org',
    logo: '/placeholder-logo.png'
  });
  
  const [userSettings, setUserSettings] = useState({
    name: 'Dr. Jane Smith',
    email: 'jane.smith@citygeneralhospital.org',
    role: 'admin',
    notifications: {
      email: true,
      push: true,
      lowInventory: true,
      newRequests: true
    }
  });
  
  const [systemSettings, setSystemSettings] = useState({
    theme: 'system',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    autoLogout: 30,
    criticalLevel: 2
  });
  
  const handleHospitalChange = (field: string, value: string) => {
    setHospitalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleUserChange = (field: string, value: string | boolean) => {
    setUserSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNotificationChange = (field: string, value: boolean) => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };
  
  const handleSystemChange = (field: string, value: string | number) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const saveSettings = async () => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Settings | {hospitalName} Blood Bank</title>
      </Helmet>
      
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and system preferences
            </p>
          </div>
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="bg-bloodRed-500 hover:bg-bloodRed-600 text-white"
          >
            <SaveIcon className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="profile">
              <UserIcon className="h-4 w-4 mr-2" />
              User Profile
            </TabsTrigger>
            <TabsTrigger value="hospital">
              <BuildingIcon className="h-4 w-4 mr-2" />
              Hospital
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings2Icon className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={userSettings.name} 
                      onChange={(e) => handleUserChange('name', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={userSettings.email} 
                      onChange={(e) => handleUserChange('email', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={userSettings.role} 
                      onValueChange={(value) => handleUserChange('role', value)}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex gap-2">
                      <Input id="password" type="password" value="••••••••" disabled />
                      <Button variant="outline">Change</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="email-notifications" 
                        className="rounded border-gray-300 text-bloodRed-500 focus:ring-bloodRed-500"
                        checked={userSettings.notifications.email}
                        onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="push-notifications" 
                        className="rounded border-gray-300 text-bloodRed-500 focus:ring-bloodRed-500"
                        checked={userSettings.notifications.push}
                        onChange={(e) => handleNotificationChange('push', e.target.checked)}
                      />
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="low-inventory" 
                        className="rounded border-gray-300 text-bloodRed-500 focus:ring-bloodRed-500"
                        checked={userSettings.notifications.lowInventory}
                        onChange={(e) => handleNotificationChange('lowInventory', e.target.checked)}
                      />
                      <Label htmlFor="low-inventory">Low Inventory Alerts</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="new-requests" 
                        className="rounded border-gray-300 text-bloodRed-500 focus:ring-bloodRed-500"
                        checked={userSettings.notifications.newRequests}
                        onChange={(e) => handleNotificationChange('newRequests', e.target.checked)}
                      />
                      <Label htmlFor="new-requests">New Request Alerts</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hospital" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Information</CardTitle>
                <CardDescription>
                  Update your hospital details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hospital-name">Hospital Name</Label>
                    <Input 
                      id="hospital-name" 
                      value={hospitalSettings.name} 
                      onChange={(e) => handleHospitalChange('name', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital-type">Hospital Type</Label>
                    <Select 
                      value={hospitalSettings.type} 
                      onValueChange={(value) => handleHospitalChange('type', value)}
                    >
                      <SelectTrigger id="hospital-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="nonprofit">Non-profit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital-email">Email Address</Label>
                    <div className="flex">
                      <div className="bg-muted p-2 rounded-l-md flex items-center">
                        <MailIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input 
                        id="hospital-email" 
                        type="email" 
                        className="rounded-l-none"
                        value={hospitalSettings.email} 
                        onChange={(e) => handleHospitalChange('email', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital-phone">Phone Number</Label>
                    <div className="flex">
                      <div className="bg-muted p-2 rounded-l-md flex items-center">
                        <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input 
                        id="hospital-phone" 
                        className="rounded-l-none"
                        value={hospitalSettings.phone} 
                        onChange={(e) => handleHospitalChange('phone', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="hospital-address">Address</Label>
                    <Input 
                      id="hospital-address" 
                      value={hospitalSettings.address} 
                      onChange={(e) => handleHospitalChange('address', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital-website">Website</Label>
                    <div className="flex">
                      <div className="bg-muted p-2 rounded-l-md flex items-center">
                        <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input 
                        id="hospital-website" 
                        className="rounded-l-none"
                        value={hospitalSettings.website} 
                        onChange={(e) => handleHospitalChange('website', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital-logo">Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-md border flex items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button variant="outline">Upload New Logo</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Configure system-wide settings and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={systemSettings.theme} 
                      onValueChange={(value) => handleSystemChange('theme', value)}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={systemSettings.language} 
                      onValueChange={(value) => handleSystemChange('language', value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select 
                      value={systemSettings.dateFormat} 
                      onValueChange={(value) => handleSystemChange('dateFormat', value)}
                    >
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time-format">Time Format</Label>
                    <Select 
                      value={systemSettings.timeFormat} 
                      onValueChange={(value) => handleSystemChange('timeFormat', value)}
                    >
                      <SelectTrigger id="time-format">
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="auto-logout">Auto Logout (minutes)</Label>
                    <Input 
                      id="auto-logout" 
                      type="number" 
                      min="5"
                      max="120"
                      value={systemSettings.autoLogout} 
                      onChange={(e) => handleSystemChange('autoLogout', parseInt(e.target.value))} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="critical-level">Critical Inventory Level</Label>
                    <Input 
                      id="critical-level" 
                      type="number" 
                      min="1"
                      max="10"
                      value={systemSettings.criticalLevel} 
                      onChange={(e) => handleSystemChange('criticalLevel', parseInt(e.target.value))} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Units below this level will trigger low inventory alerts
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
                  <div className="space-y-4">
                    <Button variant="outline">Export All Data</Button>
                    <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                      Reset System Defaults
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
