"use client";
import { signOut, useSession } from "next-auth/react";
import TwoFactorSetupVerify from "@/components/TwoFactorSetupVerify";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SetupTwoFactorPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  const handleSignOut = () => {
    signOut({ redirect: false }).then(() => {
      router.push("/login");
    });
  };

  return (
    <div>
      <h1 className="text-center mb-3">Set Up Two-Factor Authentication</h1>
      <TwoFactorSetupVerify userId={session.user.id} />
      <div className="flex justify-center">
        <Button variant="destructive" className="mt-3" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default SetupTwoFactorPage;
