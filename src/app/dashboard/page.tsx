"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
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
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/formatDate";

export type UserTableType = {
  _id: string;
  name: string;
  email: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
};

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: ColumnDef<UserTableType>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "twoFactorEnabled",
      header: "GA Status",
      cell: ({ row }) => (
        <Switch
          id={row.original._id}
          checked={row.getValue("twoFactorEnabled") as boolean}
          onCheckedChange={() => {
            toggleGAStatus({ user: row.original });
          }}
        />
      ),
    },
    {
      accessorKey: "",
      header: "Country",
      cell: () => <div>India</div>,
    },
    {
      accessorKey: "createdAt",
      header: "Date of Register",
      cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
    },
    {
      accessorKey: "_id",
      header: "Delete",
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger className="text-center" role="button">
            🗑️
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                user account and remove data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(row.original._id)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  const toggleGAStatus = async ({ user }: { user: UserTableType }) => {
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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/user/get-all-user");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <DataTable columns={columns} data={users} />
          {/* <UserTable users={users} fetchUsers={fetchUsers} /> */}
        </>
      )}
    </div>
  );
};

export default Dashboard;
