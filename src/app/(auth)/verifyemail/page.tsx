"use client";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const varifyPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const router = useRouter();

  const verifyMail = async () => {
    try {
      const response = await axios.post("/api/auth/verify-email", { token });
      console.log(response);
      if (response?.data?.success) {
        toast({
          title: "Email verified.",
        });
        router.push("/");
      }
    } catch (error: any) {
      console.log(error.response.data);
      toast({
        title: "error while verifying email.",
      });
      router.push("/");
    }
  };
  useEffect(() => {
    verifyMail();
  }, []);
  return <div>varifyPage</div>;
};

export default varifyPage;
