"use client";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import Image from "next/image";

const TwoFactorSetupForm = ({ userId }: { userId: string }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const { toast } = useToast();

  const setupTwoFactor = async () => {
    try {
      const response = await axios.post("/api/auth/setup-2fa", { userId });
      if (response.data.status === 200) {
        setQrCode(response.data.qrCodeImage);
        setSecret(response.data.secret);
        toast({
          title: "2FA Setup Successful",
          description: "Scan the QR code with your authenticator app",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error setting up 2FA",
        description: "Please try again",
      });
    }
  };

  return (
    <div>
      <h2>Two-Factor Authentication Setup</h2>
      {!qrCode && (
        <Button onClick={setupTwoFactor}>Set up Two-Factor Authentication</Button>
      )}
      {qrCode && (
        <div>
          <p>Scan this QR code with your authenticator app:</p>
          <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
          <p>Or enter this secret manually: {secret}</p>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetupForm;
