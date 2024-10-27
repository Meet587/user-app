"use client";
import { useSession } from "next-auth/react";
import TwoFactorSetupVerify from "@/components/TwoFactorSetupVerify";

const SetupTwoFactorPage = () => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please log in to set up 2FA</div>;
  }

  return (
    <div>
      <h1>Set Up Two-Factor Authentication</h1>
      <TwoFactorSetupVerify userId={session.user.id} />
    </div>
  );
};

export default SetupTwoFactorPage;
