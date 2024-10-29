"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { UserRole } from "@/enum/userRole";

export default function Home() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session &&
      session.user.twoFactorEnabled &&
      !session.user.twoFactorVerified
    ) {
      router.push("/setup-2fa");
    }
  }, [session, router]);

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

    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      toast({
        title: "Please upload an image file (JPEG, PNG, or WebP)",
      });
      event.target.value = "";
      return;
    }

    // File size validation
    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: "File size must be less than 4MB",
      });
      event.target.value = "";
      return;
    }

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

  const toggleGAStatus = async ({ user }: { user: any }) => {
    try {
      //   setLoading(true);
      const response = await fetch("/api/user/toggle-two-factor", {
        method: "POST",
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle two-factor status");
      }

      const data = await response.json();
      toast({
        title: "Status Updated.",
      });
      router.refresh();
      console.log("Toggled twoFactorEnabled:");
    } catch (error) {
      console.error("Error toggling two-factor status:", error);
      toast({
        title: "error while updating status.",
      });
    } finally {
      //   setLoading(false);
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
          <div className="flex flex-col gap-3 items-center mb-4">
            <Badge
              variant={
                session.user.twoFactorEnabled ? "default" : "destructive"
              }
            >
              {session.user.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
            </Badge>
            {/* <Switch
              id={session.user.id}
              checked={session.user.twoFactorEnabled as boolean}
              onCheckedChange={(e) => {
                toggleGAStatus({ user: session.user });
              }}
            /> */}
          </div>
          <p className="text-sm text-gray-500 mb-2">
            User ID: {session.user.id}
          </p>

          {session.user.twoFactorEnabled && !session.user.twoFactorVerified && (
            <Button asChild className="mb-4">
              <Link href="/setup-2fa">Set up Two-Factor Authentication</Link>
            </Button>
          )}
          <Button
            variant="destructive"
            className="my-2"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
          {session.user.role === UserRole.admin && (
            <Button asChild className="mb-4">
              <Link className="font-thin" href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
