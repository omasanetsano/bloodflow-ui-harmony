
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Settings2Icon, 
  UserIcon, 
  BellIcon, 
  ShieldIcon, 
  GlobeIcon, 
  PaletteIcon,
  SaveIcon,
  ServerIcon,
  BuildingIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/providers/ThemeProvider';
import { HOSPITAL_NAME } from './Dashboard';
import { APP_NAME } from '@/lib/constants';
import Logo from '@/components/Logo';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [hospitalName, setHospitalName] = useState(HOSPITAL_NAME);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [criticalAlertsThreshold, setCriticalAlertsThreshold] = useState(3);
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  
  const handleSaveSettings = () => {
    // In a real app, this would persist settings to a backend
    toast.success('Settings saved successfully');
  };

  const handleResetSettings = () => {
    setHospitalName(HOSPITAL_NAME);
    setEmailNotifications(true);
    setSmsNotifications(false);
    setCriticalAlertsThreshold(3);
    setLanguage('en');
    setDateFormat('MM/DD/YYYY');
    setTemperatureUnit('celsius');
    setTheme('system');
    toast.success('Settings reset to defaults');
  };

  return (
    <>
      <Helmet>
        <title>Settings | {hospitalName} Blood Bank</title>
      </Helmet>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and user preferences
          </p>
        </div>

        <div className="text-center p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
          <Logo size="lg" appNameOnly={true} className="mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {APP_NAME} Blood Bank Management System v1.0
          </p>
        </div>

        <Tabs defaultValue="general" className="animate-fade-in transition-all duration-300">
          <TabsList className="mb-6">
            <TabsTrigger value="general">
              <Settings2Icon className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <BellIcon className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <PaletteIcon className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="account">
              <UserIcon className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card className="bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BuildingIcon className="h-5 w-5 text-muted-foreground" />
                  Organization Settings
                </CardTitle>
                <CardDescription>Configure your organization information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hospital/Organization Name</label>
                  <Input 
                    value={hospitalName} 
                    onChange={(e) => setHospitalName(e.target.value)} 
                    placeholder="Enter hospital name"
                    className="transition-all duration-300"
                  />
                  <p className="text-xs text-muted-foreground">
                    This name will appear throughout the application and on reports
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="transition-all duration-300">
                      <GlobeIcon className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger className="transition-all duration-300">
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
                  <label className="text-sm font-medium">Temperature Unit</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="celsius"
                        checked={temperatureUnit === 'celsius'}
                        onChange={() => setTemperatureUnit('celsius')}
                        className="rounded-full border-gray-300 text-bloodRed-600 focus:ring-bloodRed-600"
                      />
                      <label htmlFor="celsius">Celsius (°C)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="fahrenheit"
                        checked={temperatureUnit === 'fahrenheit'}
                        onChange={() => setTemperatureUnit('fahrenheit')}
                        className="rounded-full border-gray-300 text-bloodRed-600 focus:ring-bloodRed-600"
                      />
                      <label htmlFor="fahrenheit">Fahrenheit (°F)</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card className="bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure alerts and notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-xs text-muted-foreground">
                      Receive important alerts via email
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">SMS Notifications</label>
                    <p className="text-xs text-muted-foreground">
                      Receive urgent alerts via SMS
                    </p>
                  </div>
                  <Switch 
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Critical Alerts Threshold</label>
                  <Select 
                    value={criticalAlertsThreshold.toString()} 
                    onValueChange={(val) => setCriticalAlertsThreshold(parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 unit</SelectItem>
                      <SelectItem value="2">2 units</SelectItem>
                      <SelectItem value="3">3 units</SelectItem>
                      <SelectItem value="5">5 units</SelectItem>
                      <SelectItem value="10">10 units</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Send alerts when blood inventory falls below this threshold
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        theme === 'light' ? 'border-bloodRed-500 bg-bloodRed-50 dark:bg-bloodRed-950/20' : 'border-border'
                      }`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="bg-white rounded-md border p-4 mb-3 shadow-sm">
                        <div className="h-2 w-16 bg-gray-200 rounded-md mb-2"></div>
                        <div className="h-2 w-10 bg-gray-200 rounded-md"></div>
                      </div>
                      <div className="text-center text-sm font-medium">Light</div>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        theme === 'dark' ? 'border-bloodRed-500 bg-bloodRed-50 dark:bg-bloodRed-950/20' : 'border-border'
                      }`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="bg-gray-800 rounded-md border border-gray-700 p-4 mb-3 shadow-sm">
                        <div className="h-2 w-16 bg-gray-600 rounded-md mb-2"></div>
                        <div className="h-2 w-10 bg-gray-600 rounded-md"></div>
                      </div>
                      <div className="text-center text-sm font-medium">Dark</div>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        theme === 'system' ? 'border-bloodRed-500 bg-bloodRed-50 dark:bg-bloodRed-950/20' : 'border-border'
                      }`}
                      onClick={() => setTheme('system')}
                    >
                      <div className="bg-gradient-to-r from-white to-gray-800 rounded-md border p-4 mb-3 shadow-sm">
                        <div className="h-2 w-16 bg-gray-400 rounded-md mb-2"></div>
                        <div className="h-2 w-10 bg-gray-400 rounded-md"></div>
                      </div>
                      <div className="text-center text-sm font-medium">System</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Settings */}
          <TabsContent value="account">
            <Card className="bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
                    A
                  </div>
                  <div>
                    <h3 className="font-medium">Admin User</h3>
                    <p className="text-sm text-muted-foreground">admin@bloodbank.org</p>
                    <Button variant="link" className="p-0 h-auto text-sm text-bloodRed-500">
                      Change profile picture
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input value="admin@bloodbank.org" disabled />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <div className="flex items-center gap-2">
                    <ShieldIcon className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm">Administrator</span>
                  </div>
                </div>
                
                <div className="rounded-md border p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <ServerIcon className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Database Information</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Connected to: <span className="font-mono">blood_bank_prod_db</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last backup: <span className="font-mono">2023-05-30 04:00 UTC</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleResetSettings} className="transition-all duration-300">
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSaveSettings} 
            className="bg-bloodRed-500 hover:bg-bloodRed-600 text-white transition-all duration-300"
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </>
  );
}
