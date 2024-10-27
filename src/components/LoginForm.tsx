"use client";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { signIn, useSession, getSession } from "next-auth/react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import GoogleReCaptchaWrapper from "./GoogleReCaptchaWrapper";
import { Loader2 } from "lucide-react";

const LoginFormContent = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isForgetPasswordLoading, setIsForgetPasswordLoading] = useState(false);
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const onLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      console.log("Execute recaptcha not yet available");
      return;
    }

    setIsLoading(true);
    try {
      const token = await executeRecaptcha("login");
      const recaptchaResponse = await axios.post("/api/verify-recaptcha", {
        token,
      });

      if (!recaptchaResponse.data.success) {
        toast({
          title: "reCAPTCHA verification failed",
          description: "Please try again.",
        });
        return;
      }

      const result = await signIn("credentials", {
        email: user.email,
        password: user.password,
        redirect: false,
      });
      if (result?.error) {
        toast({
          title: "Invalid credentials",
        });
      } else {
        const session = await getSession();
        if (session) {
          if (session.user.twoFactorEnabled) {
            router.push("/setup-2fa");
          } else {
            // Redirect based on user role
            let userRole = session.user.role || "user";
            if (userRole === "admin") {
              router.push("/dashboard");
            } else {
              router.push("/profile");
            }
          }
        }
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error While Login",
        description: error.message ?? "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forgetPassword = async () => {
    if (!EMAIL_REGEX.test(user.email)) {
      toast({ description: "Enter Valid Email.", type: "foreground" });
      return;
    }
    setIsForgetPasswordLoading(true);
    try {
      const response = await axios.post("/api/auth/forget-password", user);
      toast({
        title: "Mail sent for password reset.",
      });
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error While Sending Mail.",
        description: error.response.data.message ?? "",
      });
    } finally {
      setIsForgetPasswordLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsGoogleSignInLoading(true);
    try {
      await signIn("google", { callbackUrl: "/profile" });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error signing in with Google",
        description: "Please try again.",
      });
    } finally {
      setIsGoogleSignInLoading(false);
    }
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" disabled={isLoading} className="mt-2">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleGoogleSignIn} disabled={isGoogleSignInLoading}>
          {isGoogleSignInLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in with Google...
            </>
          ) : (
            "Sign in with Google"
          )}
        </Button>
        <Button
          variant="link"
          className="font-thin p-0 h-auto"
          onClick={forgetPassword}
          disabled={isForgetPasswordLoading}
        >
          {isForgetPasswordLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Forget Password!"
          )}
        </Button>
        <Link
          className="font-thin p-0 h-auto hover:underline"
          href={"/register"}
        >
          Click here to Register
        </Link>
      </CardFooter>
    </Card>
  );
};

const LoginForm = () => {
  return (
    <GoogleReCaptchaWrapper>
      <LoginFormContent />
    </GoogleReCaptchaWrapper>
  );
};

export default LoginForm;
