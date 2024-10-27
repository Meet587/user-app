"use client"; // Enable client-side rendering

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">You are not logged in</div>
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

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/user/update-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile photo");
      }

      const data = await response.json();
      await update({
        ...session,
        user: { ...session.user, imageUrl: data.imageUrl },
      });

      // router.refresh();
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="w-32 h-32">
              <AvatarImage
                src={session.user?.imageUrl || ""}
                alt={session.user?.name || ""}
              />
              <AvatarFallback>
                {session.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute bottom-0 left-0 w-full opacity-0 z-10 cursor-pointer"
              disabled={isUploading}
              placeholder={isUploading ? "Uploading..." : "Change Photo"}
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Change Photo"}
            </Button>
          </div>
          <h1 className="text-2xl font-semibold mb-2">{session.user?.name}</h1>
          <p className="text-gray-600 mb-4">{session.user?.email}</p>
          <div className="flex items-center mb-4">
            <Badge
              variant={
                session.user.twoFactorEnabled ? "default" : "destructive"
              }
            >
              {session.user.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-2">User ID: {session.user.id}</p>

          {!session.user.twoFactorEnabled && (
            <Button asChild className="mb-4">
              <Link href="/profile/setup-2fa">
                Set up Two-Factor Authentication
              </Link>
            </Button>
          )}
          <Button variant="destructive" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
