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
import { signIn } from "next-auth/react";

const RegisterForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [btnDisable, setBtnDisable] = useState(false);

  useEffect(() => {
    if (
      user.email.length > 0 &&
      user.password.length > 0 &&
      user.name.length > 0
    ) {
      setBtnDisable(false);
    } else {
      setBtnDisable(true);
    }
  }, [user]);

  const onSignup = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/register", user);
      console.log("singup success ", response.data);
      toast({
        title: response.data.message,
      });
      // router.push("/login");
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error While register",
        description: error.message ?? "",
      });
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
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" disabled={btnDisable} className="mt-2">
              Sign up
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Link href={"/login"}>Click here to Login</Link>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
