import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Home from "./Home";
import Dashboard from "./Dashboard";

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

  if (user) {
    return <Dashboard />;
  }

  return <Home />;
}
