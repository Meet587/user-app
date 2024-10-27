"use client";
import React, { useEffect, useState } from "react";
import { UserTable } from "@/components/UserTable";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

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
        <UserTable users={users} fetchUsers={fetchUsers} />
      )}
    </div>
  );
};

export default Dashboard;
