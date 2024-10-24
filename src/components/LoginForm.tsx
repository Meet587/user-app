"use client";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { EMAIL_REGEX } from "@/constant/regEx";
import { signIn, useSession } from "next-auth/react";

const LoginForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [btnDisable, setBtnDisable] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.twoFactorEnabled && !session.user.twoFactorVerified) {
      router.push(`/twofactor-authenticate?userId=${session.user.id}`);
    } else if (session) {
      router.push("/profile");
    }
  }, [session, router]);

  // useEffect(() => {
  //   if (user.email.length > 0) {
  //     setBtnDisable(false);
  //   } else {
  //     setBtnDisable(true);
  //   }
  // }, [user]);

  const onLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", user);
      console.log("LogIn success ", response.data);
      if (response.data.twoFactorRequired) {
        router.push(`/twofactor-authenticate?userId=${response.data.userId}`);
      } else {
        toast({
          title: response.data.message,
        });
        router.push("/profile");
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: error.response.data.message ?? "",
        description: "Error While Login",
      });
    }
  };

  const forgetPassword = async () => {
    if (!EMAIL_REGEX.test(user.email)) {
      toast({ description: "Enter Valid Email.", type: "foreground" });
      return;
    }
    try {
      const response = await axios.post("/api/auth/forget-password", user);
      console.log("Forget password", response.data);
      toast({
        title: "Mail sent for password reset.",
      });
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error While Sending Mail.",
        description: error.response.data.message ?? "",
      });
    }
  };
  const handleGoogleSignIn = () => {
    // Use NextAuth's signIn function to initiate Google OAuth
    signIn("google", { callbackUrl: "/profile" });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in Page</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onLogin}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Enter your Email"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                placeholder="Enter Password"
              />
              <p className="font-thin cursor-pointer" onClick={forgetPassword}>
                Forget Password!
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" disabled={btnDisable} className="mt-2">
              Log In
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGoogleSignIn}>Sign in with Google</Button>
        <Link href={"/register"}>Click here to Register</Link>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
