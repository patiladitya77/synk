"use client";

import { redirect } from "next/navigation";

export default function SignupPage() {
  return (
    redirect("/login")
  );
}


