import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  plan: string;
  dailyUsageCount: number;
  dailyUsageDate?: string;
  createdAt: string;
}

export default function Admin() {
  const { toast } = useToast();

  // Fetch current user to check if admin
  const { data: currentUser } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    },
  });

  // Fetch all users (admin only)
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      return data.users || [];
    },
    enabled: !!currentUser,
  });

  // Mutation to change user plan
  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, plan }: { userId: string; plan: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update plan");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User plan updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    },
  });

  // Mutation to reset usage
  const resetUsageMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/reset-usage`, {
        method: "PUT",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to reset usage");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User usage reset successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset usage",
        variant: "destructive",
      });
    },
  });

  // Check if user is admin
  const isAdmin = currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL || currentUser?.email === "mhtrading@gmail.com";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access the admin panel.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-lg text-muted-foreground">Manage users and system configuration</p>
      </div>

      {/* Users Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
          <CardDescription>View and manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Daily Usage</th>
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{user.email}</td>
                      <td className="py-3 px-4">
                        <Select
                          value={user.plan}
                          onValueChange={(plan) => updatePlanMutation.mutate({ userId: user.id, plan })}
                          disabled={updatePlanMutation.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FREE">FREE</SelectItem>
                            <SelectItem value="PRO_MONTHLY">PRO_MONTHLY</SelectItem>
                            <SelectItem value="PRO_YEARLY">PRO_YEARLY</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        {user.dailyUsageCount}
                        {user.dailyUsageDate && <span className="text-xs text-muted-foreground"> ({user.dailyUsageDate})</span>}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetUsageMutation.mutate(user.id)}
                          disabled={resetUsageMutation.isPending}
                        >
                          {resetUsageMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          Reset Usage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>Current system settings and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">FREE Daily Limit</p>
                <p className="text-sm text-muted-foreground">Maximum AI generations per day for FREE users</p>
              </div>
              <p className="text-2xl font-bold">{import.meta.env.VITE_FREE_DAILY_LIMIT || 5}</p>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">Environment</p>
                <p className="text-sm text-muted-foreground">Current deployment environment</p>
              </div>
              <p className="text-lg font-semibold capitalize">{import.meta.env.MODE || "development"}</p>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">Stripe Status</p>
                <p className="text-sm text-muted-foreground">Payment processing availability</p>
              </div>
              <p className={`text-lg font-semibold ${import.meta.env.VITE_STRIPE_PUBLIC_KEY ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                {import.meta.env.VITE_STRIPE_PUBLIC_KEY ? "Configured" : "Not Configured"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
