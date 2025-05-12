
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { APP_NAME } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { register as registerUser, HospitalType, Hospital } from "@/utils/auth";
import { X, Plus } from "lucide-react";

const hospitalSchema = z.object({
  name: z.string().min(2, "Hospital name is required"),
  type: z.enum(["private", "government", "nonprofit"] as const)
});

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  userType: z.enum(["admin", "hospital"]),
  hospitalName: z.string().optional(),
  hospitalType: z.enum(["private", "government", "nonprofit"] as const).optional(),
  hospitals: z.array(hospitalSchema).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  // If user is hospital type, hospitalName and hospitalType are required
  if (data.userType === "hospital") {
    return !!data.hospitalName && !!data.hospitalType;
  }
  // If user is admin type, at least one hospital is required
  if (data.userType === "admin") {
    return (data.hospitals && data.hospitals.length > 0);
  }
  return true;
}, {
  message: "Hospital information is required",
  path: ["hospitalName"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [newHospital, setNewHospital] = useState<Hospital>({ name: "", type: "private" });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "hospital",
      hospitals: [],
    },
  });

  const userType = form.watch("userType");

  const addHospital = () => {
    if (newHospital.name.trim().length < 2) {
      toast({
        title: "Invalid hospital name",
        description: "Hospital name must be at least 2 characters",
        variant: "destructive",
      });
      return;
    }

    const updatedHospitals = [...hospitals, { ...newHospital }];
    setHospitals(updatedHospitals);
    form.setValue("hospitals", updatedHospitals);
    setNewHospital({ name: "", type: "private" });
  };

  const removeHospital = (index: number) => {
    const updatedHospitals = hospitals.filter((_, i) => i !== index);
    setHospitals(updatedHospitals);
    form.setValue("hospitals", updatedHospitals);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      console.log("Registration data:", data);
      
      // For system admin, ensure hospitals are included
      if (data.userType === "admin" && (!data.hospitals || data.hospitals.length === 0)) {
        toast({
          title: "Registration error",
          description: "System admin must have at least one hospital",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // For hospital user, ensure hospital details are included
      if (data.userType === "hospital" && (!data.hospitalName || !data.hospitalType)) {
        toast({
          title: "Registration error",
          description: "Hospital details are required",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Register with our auth utility (will be replaced with Supabase)
      const success = await registerUser(data);
      
      if (success) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Redirecting to dashboard...",
        });
        
        // Redirect to dashboard after successful registration
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast({
          title: "Registration failed",
          description: "An error occurred during registration. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-red-500/5 py-12">
      <Helmet>
        <title>Register | {APP_NAME}</title>
      </Helmet>
      
      <div className="w-full max-w-md px-4">
        <div className="mb-6 text-center">
          <Logo size="lg" />
          <h1 className="mt-4 text-2xl font-bold">Hospital Admin Portal</h1>
          <p className="text-muted-foreground">Create a new account</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Create an account to manage hospital blood banks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs defaultValue="hospital" className="w-full mb-6" onValueChange={(value: "admin" | "hospital") => {
                  form.setValue("userType", value);
                  // Reset form values when switching tabs
                  if (value === "admin") {
                    form.setValue("hospitalName", undefined);
                    form.setValue("hospitalType", undefined);
                  } else {
                    form.setValue("hospitals", []);
                    setHospitals([]);
                  }
                }}>
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="hospital">Hospital User</TabsTrigger>
                    <TabsTrigger value="admin">System Admin</TabsTrigger>
                  </TabsList>
                </Tabs>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{userType === "admin" ? "Admin Name" : "Hospital Admin Name"}</FormLabel>
                      <FormControl>
                        <Input placeholder={userType === "admin" ? "System Administrator" : "Hospital Administrator"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {userType === "hospital" ? (
                  <>
                    <FormField
                      control={form.control}
                      name="hospitalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hospital Name</FormLabel>
                          <FormControl>
                            <Input placeholder="General Hospital" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hospitalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hospital Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select hospital type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="private">Private Hospital</SelectItem>
                              <SelectItem value="government">Government Hospital</SelectItem>
                              <SelectItem value="nonprofit">Non-profit Hospital</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/40 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Managed Hospitals</h3>
                      
                      {hospitals.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No hospitals added. Add at least one hospital below.</p>
                      ) : (
                        <ul className="space-y-2">
                          {hospitals.map((hospital, index) => (
                            <li key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                              <div>
                                <span className="font-medium">{hospital.name}</span>
                                <span className="text-xs ml-2 text-muted-foreground">
                                  ({hospital.type === "private" ? "Private" : 
                                    hospital.type === "government" ? "Government" : "Non-profit"})
                                </span>
                              </div>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeHospital(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="mt-4 flex flex-col gap-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <Input 
                              placeholder="Hospital name" 
                              value={newHospital.name}
                              onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                            />
                          </div>
                          <Select 
                            value={newHospital.type}
                            onValueChange={(value: HospitalType) => 
                              setNewHospital({...newHospital, type: value})
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="nonprofit">Non-profit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full flex items-center gap-1"
                          onClick={addHospital}
                        >
                          <Plus className="h-4 w-4" /> Add Hospital
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@hospital.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
