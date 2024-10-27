"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/formatDate";
import { useState } from "react";
import { Switch } from "./ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function UserTable({ users, fetchUsers }: any) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const handleDelete = async (userId: string) => {
    try {
      //   setLoading(true);
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      const data = await response.json();
      console.log(data.message);
      toast({
        title: "User Deleted.",
      });
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "error while deleting user.",
      });
    } finally {
      //   setLoading(false);
    }
  };

  const toggleGAStatus = async ({ user }: { user: any }) => {
    try {
      //   setLoading(true);
      const response = await fetch("/api/user/toggle-two-factor", {
        method: "POST",
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle two-factor status");
      }

      const data = await response.json();
      toast({
        title: "Status Updated.",
      });
      await fetchUsers();
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
    <Table>
      <TableCaption>A list of users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Name</TableHead>
          <TableHead className="text-center">Email</TableHead>
          <TableHead>GA Status</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Date of Register</TableHead>
          <TableHead>Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && <div className="loading-indicator">Loading...</div>}
        {!loading &&
          users.map((user: any) => {
            return (
              <TableRow key={user._id}>
                <TableCell className="font-medium text-center">
                  {user.name}
                </TableCell>
                <TableCell className="text-center">{user.email}</TableCell>
                <TableCell>
                  <Switch
                    id={user._id}
                    checked={user.twoFactorEnabled as boolean}
                    onCheckedChange={(e) => {
                      toggleGAStatus({ user });
                    }}
                  />
                </TableCell>
                <TableCell>India</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger className="text-center" role="button">
                      🗑️
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this user account and remove data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(user._id)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
