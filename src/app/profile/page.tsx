"use client"; // Enable client-side rendering

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
// console.log(session)
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div>
        <div>You are not logged in</div>
        <Link href="/login">
          <button>Go to Login</button>
        </Link>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut({ redirect: false }).then(() => {
      router.push('/login');
    });
  };

  return (
    <div>
      <h1>Welcome, {session.user?.name}</h1>
      <p>Email: {session.user?.email}</p>
      {!session.user.twoFactorEnabled && (
        <Link href="/profile/setup-2fa">
          <button>Set up Two-Factor Authentication</button>
        </Link>
      )}
      <button onClick={handleSignOut}>Sign out</button>
    </div>
  );
}
