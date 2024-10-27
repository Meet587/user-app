"use client";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const [user, setUser] = useState({
    cpassword: "",
    password: "",
  });

  const onReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (user.cpassword !== user.password) {
      toast({
        title: "Confirm password does not match.",
      });
      return;
    }
    try {
      const response = await axios.post("/api/auth/reset-password", {
        newPassword: user.password,
        token,
      });
      toast({
        title: response.data.message,
      });
      router.push("/login");
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error While Login",
        description: error.response.data.message ?? "",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>Reset Password Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onReset}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                  placeholder="Enter Password"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="cpassword">Confirm Password</Label>
                <Input
                  id="cpassword"
                  type="password"
                  value={user.cpassword}
                  onChange={(e) =>
                    setUser({ ...user, cpassword: e.target.value })
                  }
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button type="submit" className="mt-2">
                Reset Password
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Link href={"/login"}>Back To Login</Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
