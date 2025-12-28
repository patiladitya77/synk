"use client";
import { useGlobalToast } from "@/components/Toast-provider";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/getErrorMessage";
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
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

enum AuthStep {
  LOGIN = "login",
  FORGOT_EMAIL = "forgot_email",
  OTP = "otp",
}

export default function Login() {
  const { showToast } = useGlobalToast();
  const [step, setStep] = useState<AuthStep>(AuthStep.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_BASE_URL! + "api/auth/login",
        {
          emailId: email,
          password: password,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        showToast("Welcome back!", "success");
        router.push("/dashboard");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        showToast("Invalid email or password", "error");
        return;
      }
      const message = getErrorMessage(error);
      showToast(message, "error");
    }
  };

  return (
    <div className="flex justify-center mt-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            {step === AuthStep.LOGIN && "Login to your account"}
            {step === AuthStep.FORGOT_EMAIL && "Forgot Password"}
            {step === AuthStep.OTP && "Verify OTP"}
          </CardTitle>

          <CardDescription>
            {step === AuthStep.LOGIN &&
              "Enter your email below to login to your account"}
            {step === AuthStep.FORGOT_EMAIL &&
              "Enter your email to receive OTP"}
            {step === AuthStep.OTP && `Enter the 6-digit OTP sent to ${email}`}
          </CardDescription>

          {step === AuthStep.LOGIN && (
            <CardAction>
              <Link href="/signup">
                <Button variant="link">Sign Up</Button>
              </Link>
            </CardAction>
          )}
        </CardHeader>

        <CardContent>
          {/* LOGIN */}
          {step === AuthStep.LOGIN && (
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="John@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label>Password</Label>
                    <button
                      type="button"
                      className="ml-auto text-sm underline"
                      onClick={() => setStep(AuthStep.FORGOT_EMAIL)}
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <Input
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </form>
          )}

          {/* FORGOT EMAIL */}
          {step === AuthStep.FORGOT_EMAIL && (
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* OTP */}
          {step === AuthStep.OTP && (
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2">
          {step === AuthStep.LOGIN && (
            <>
              <Button className="w-full" onClick={handleLogin}>
                Login
              </Button>
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
            </>
          )}

          {step === AuthStep.FORGOT_EMAIL && (
            <>
              <Button className="w-full" onClick={() => setStep(AuthStep.OTP)}>
                Send OTP
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep(AuthStep.LOGIN)}
              >
                Back to Login
              </Button>
            </>
          )}

          {step === AuthStep.OTP && (
            <>
              <Button className="w-full">Verify OTP</Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep(AuthStep.FORGOT_EMAIL)}
              >
                Back
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
