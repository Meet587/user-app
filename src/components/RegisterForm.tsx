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
import { signIn } from "next-auth/react";
import GoogleReCaptchaWrapper from "./GoogleReCaptchaWrapper";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Loader2 } from "lucide-react";

const RegisterFormContent = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const onSignup = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      console.log("Execute recaptcha not yet available");
      return;
    }

    setIsLoading(true);
    try {
      const token = await executeRecaptcha("register");
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

      // const response = await axios.post("/api/auth/register", user);

      // Sign in the user after successful registration
      const result = await signIn("credentials", {
        email: user.email,
        password: user.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "User register.",
        });
        router.push("/");
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error While register",
        description: error.response?.data?.message ?? error.message ?? "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign up Page</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSignup}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Enter Your Name"
                disabled={isLoading}
              />
            </div>
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
                  Signing up...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link className="font-thin p-0 h-auto hover:underline" href={"/login"}>
          Click here to Login
        </Link>
      </CardFooter>
    </Card>
  );
};

const RegisterForm = () => {
  return (
    <GoogleReCaptchaWrapper>
      <RegisterFormContent />
    </GoogleReCaptchaWrapper>
  );
};

export default RegisterForm;
