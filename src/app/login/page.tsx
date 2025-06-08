
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark } from 'lucide-react'; // Import a suitable logo icon

export default function LoginPage() {

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Dummy login - does nothing real
    console.log("Login attempt (dummy)");
    // In a real app, you would add authentication logic here
    alert("Login functionality is not implemented in this demo.");
    // Redirect to the dashboard after "login"
    window.location.href = "/dashboard"; // Simple redirect for demo
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background">
       {/* Background Image Container */}
        <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('https://picsum.photos/seed/money/1920/1080')" }} // Placeholder image (seed=money)
            // In a real app, replace with your actual image URL:
            // style={{ backgroundImage: "url('/path/to/your/money-background.jpg')" }}
        ></div>
        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-background/50"></div>

        {/* Login Card - ensure it's above the background/overlay */}
      <Card className="w-full max-w-sm z-20">
        <CardHeader className="text-center"> {/* Center align header content */}
          <div className="flex items-center justify-center mb-2"> {/* Flex container for logo and title */}
             <Landmark className="w-8 h-8 text-primary mr-2" /> {/* Logo */}
             <CardTitle className="text-2xl font-bold"> {/* App Name */}
                Local Ledger
             </CardTitle>
          </div>
          <CardDescription>
            Enter your credentials below to access your personal ledger. (Demo only)
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
