
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
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { APP_NAME } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { register as registerUser, HospitalType } from "@/utils/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  hospitalName: z.string().min(2, "Hospital name is required"),
  hospitalType: z.enum(["private", "government", "nonprofit"] as const),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      hospitalName: "",
      hospitalType: "private",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      console.log("Registration data:", data);
      
      // Register with our Supabase auth utility
      const success = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        hospitalName: data.hospitalName,
        hospitalType: data.hospitalType as HospitalType,
      });
      
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
          variant: "destructive",
          title: "Registration failed",
          description: "An error occurred during registration. Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital Admin Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Hospital Administrator" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@hospital.com" {...field} />
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
