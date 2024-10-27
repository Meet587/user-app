"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";

const TwoFactorSetupVerify = ({ userId }: { userId: string }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setupTwoFactor();
  }, []);

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

  const verifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/verify-2fa", {
        userId,
        twoFactorToken: token,
      });
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
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1>Setup 2FA</h1>
      {qrCode && (
        <>
          <p>Scan the QR code below with your Google Authenticator app:</p>
          <Image
            src={qrCode}
            alt="QR Code for 2FA setup"
            width={200}
            height={200}
          />
          <p>If you need it, your secret is: {secret}</p>
        </>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Verify Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={verifyTwoFactor}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="token">6-Digit Code</Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Button type="submit" className="mt-2">
                Verify
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorSetupVerify;
