"use client";
import { useSearchParams } from "next/navigation";
import TwoFactorSetupVerify from "@/components/TwoFactorSetupVerify";

export default function TwoFactorAuthenticate() {
  const userId = useSearchParams().get("userId");

  if (!userId) {
    return <div>Error: User ID not provided</div>;
  }

  return <TwoFactorSetupVerify userId={userId} />;
}
