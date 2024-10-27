"use client";
import { useSession } from "next-auth/react";
import TwoFactorSetupVerify from "@/components/TwoFactorSetupVerify";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SetupTwoFactorPage = () => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Please log in to set up 2FA</div>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1>Set Up Two-Factor Authentication</h1>
      <TwoFactorSetupVerify userId={session.user.id} />
    </div>
  );
};

export default SetupTwoFactorPage;
