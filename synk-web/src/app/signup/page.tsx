"use client";
import { useGlobalToast } from "@/components/Toast-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showToast } = useGlobalToast();
  const router = useRouter();
  const handleSignup = async () => {
    if (!name || !password || !confirmPassword || !email) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    if (password != confirmPassword) {
      console.log("Passwords do not match");
      showToast("Password should be match", "error");
      return;
    }
    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_BASE_URL! + "api/auth/signup",
        {
          name,
          emailId: email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      if (res.status === 200) {
        showToast("Account created successfully", "success");
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center mt-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Enter your deatils below to get started
          </CardDescription>
          <CardAction>
            <Link href="/login">
              <Button variant="link">Sign In</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="John@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>

                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Confirm Password</Label>

                <Input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  id="password"
                  type="password"
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" onClick={handleSignup}>
            Get Started
          </Button>
          <Button variant="outline" className="w-full">
            Sign up using Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
