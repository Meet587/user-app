"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const TwoFactorAuthForm = ({ userId }: { userId: string }) => {
  const [token, setToken] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/verify-2fa", { userId, twoFactorToken: token });
      if (response.data.success) {
        toast({ title: "2FA verified successfully" });
        router.push("/profile");
      } else {
        toast({ title: "Invalid 2FA token", description: "Please try again" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error verifying 2FA", description: "Please try again" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter 2FA token"
      />
      <Button type="submit">Verify</Button>
    </form>
  );
};

export default TwoFactorAuthForm;
