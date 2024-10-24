"use client";
import { useSession } from "next-auth/react";
import TwoFactorSetupForm from "@/components/TwoFactorSetupForm";

const SetupTwoFactorPage = () => {
  const { data: session, status } = useSession();
  console.log("session.user", session?.user);
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please log in to set up 2FA</div>;
  }

  return (
    <div>
      <h1>Set Up Two-Factor Authentication</h1>
      <TwoFactorSetupForm userId={session.user.id} />
    </div>
  );
};

export default SetupTwoFactorPage;
