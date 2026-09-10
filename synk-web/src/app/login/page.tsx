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
import { Suspense, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useDispatch } from "react-redux";
import {
  authenticateWithGoogle,
} from "@/services/authService";
import { GoogleLogin } from "@react-oauth/google";

enum AuthStep {
  LOGIN = "login",
  FORGOT_EMAIL = "forgot_email",
  OTP = "otp",
  SET_NEW_PASSWORD = "set_new_password",
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

function Login() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const { showToast } = useGlobalToast();
  const [step, setStep] = useState<AuthStep>(AuthStep.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();


  return (
    <div className="flex justify-center mt-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Synk</CardTitle>
          <CardDescription>Sign in with your Google account to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <GoogleLogin
            width="100%"
            onSuccess={async (credentialResponse) => {
              try {
                const res = await authenticateWithGoogle(
                  credentialResponse.credential!,
                  dispatch,
                  inviteToken || undefined
                );
                showToast("Welcome!", "success");
                if (res && "inviteSlug" in res && res.inviteSlug) {
                  router.replace(`/workspace/${res.inviteSlug}`);
                  return;
                }
                router.replace("/dashboard");
              } catch {
                showToast("Google sign-in failed", "error");
              }
            }}
            onError={() => showToast("Google sign-in failed", "error")}
          />
        </CardContent>
      </Card>

    </div>
  );
}
