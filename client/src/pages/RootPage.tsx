import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Home from "./Home";
import Dashboard from "./Dashboard";
import Admin from "./Admin";

export default function RootPage() {
  const [, navigate] = useLocation();
  const { data: user } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    },
  });

  useEffect(() => {
    // Role-based redirection for admin users
    if (user && user.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  if (user) {
    // If admin, show admin dashboard
    if (user.role === "admin") {
      return <Admin />;
    }
    // For all other authenticated users (FREE, PRO), show dashboard
    return <Dashboard />;
  }

  return <Home />;
}
