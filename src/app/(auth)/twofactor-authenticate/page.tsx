"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function TwoFactorAuthenticate() {
  const [token, setToken] = useState<string>("");
  const [qrCodeImage, setQrCodeImage] = useState("");
  const [secret, setSecret] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const userId = useSearchParams().get("userId");

  useEffect(() => {
    const setup2FA = async () => {
      const res = await fetch("/api/auth/setup-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setQrCodeImage(data.qrCodeImage);
      setSecret(data.secret); // Save this for verification later
    };

    setup2FA();
  }, [userId]);

  const verify2FA = async () => {
    const res = await fetch("/api/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    });
    const data = await res.json();
    console.log(data);

    if (data.success) {
      router.push("/profile");
    } else {
      toast({
        description: "Invalid 2FA code",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1>Setup 2FA</h1>
      <p>Scan the QR code below with your Google Authenticator app:</p>
      <img src={qrCodeImage} alt="QR Code for 2FA setup" />
      <p>If you need it, your secret is: {secret}</p>
      <Card>
        <CardHeader>
          <CardTitle>Reset Password Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={verify2FA}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button type="button" onClick={verify2FA} className="mt-2">
                Verify
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
