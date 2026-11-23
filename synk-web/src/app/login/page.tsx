"use client";
import { useGlobalToast } from "@/components/Toast-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useDispatch } from "react-redux";
import {
  authenticateWithGoogle,
} from "@/services/authService";
import { GoogleLogin } from "@react-oauth/google";


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
