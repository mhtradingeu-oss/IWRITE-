import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Shield,
  Users,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Brain,
  Send,
  Download,
  Wrench,
  Database,
  Copy,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  role: string;
  plan: string;
  dailyUsageCount: number;
  dailyUsageDate?: string;
  createdAt: string;
  planStartedAt: string;
  planExpiresAt?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;
  proUsers: number;
  adminUsers: number;
  totalDailyUsage: number;
  avgDailyUsagePerUser: number;
  freeDailyLimit: number;
  usersNearLimit: number;
}

export default function Admin() {
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [newDailyLimit, setNewDailyLimit] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");

  // Fetch current user to check if admin
  const { data: currentUser } = useQuery({
    queryKey: ["/auth/me"],
    queryFn: async () => {
      const response = await fetch("/auth/me", { credentials: "include" });
      if (!response.ok) return null;
      return response.json().then((data) => data.user);
    },
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json().then((data) => data.users || []);
    },
    enabled: !!currentUser?.role === "admin",
  });

  // Fetch system stats
  const { data: stats = null, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: !!currentUser?.role === "admin",
  });

  // Fetch maintenance mode status
  const { data: maintenanceStatus, refetch: refetchMaintenance } = useQuery({
    queryKey: ["/api/admin/maintenance"],
    queryFn: async () => {
      const response = await fetch("/api/admin/maintenance", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch maintenance status");
      return response.json();
    },
    enabled: !!currentUser?.role === "admin",
  });

  // Update plan mutation
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
      toast({ title: "Success", description: "User plan updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset usage mutation
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
      toast({ title: "Success", description: "User usage reset" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update daily limit mutation
  const updateDailyLimitMutation = useMutation({
    mutationFn: async (limit: number) => {
      const response = await fetch("/api/admin/settings/daily-limit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update limit");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Daily limit updated" });
      setNewDailyLimit("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle maintenance mode
  const toggleMaintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch("/api/admin/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update maintenance mode");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Maintenance mode updated" });
      refetchMaintenance();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // AI Insights mutation
  const aiInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: { stats, usersCount: users.length },
        }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to get AI insights");
      return response.json();
    },
    onSuccess: (data) => {
      setAiResponse(data.insight);
      setAiPrompt("");
      toast({ title: "Insights generated", description: "AI analysis complete" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isAdmin = currentUser?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Admin access required. Contact system administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchEmail = user.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchPlan = planFilter === "all" || user.plan === planFilter;
    const matchRole = roleFilter === "all" || user.role === roleFilter;
    return matchEmail && matchPlan && matchRole;
  });

  // Get top users by usage
  const topUsers = [...users]
    .sort((a, b) => b.dailyUsageCount - a.dailyUsageCount)
    .slice(0, 3);

  // AI prompt templates
  const aiPrompts = [
    {
      label: "Summarize activity",
      prompt: "Provide a brief summary of today's user activity and AI usage patterns. Include key metrics and trends.",
    },
    {
      label: "Identify heavy users",
      prompt: "Who are the top users consuming AI operations today? Should any of them be offered a PRO plan upgrade?",
    },
    {
      label: "Suggest optimizations",
      prompt: "Based on current usage patterns, what recommendations would you make to improve system performance and user satisfaction?",
    },
    {
      label: "Check anomalies",
      prompt: "Are there any unusual patterns or anomalies in today's usage data that need investigation?",
    },
  ];

  const pgDumpCommand = "pg_dump $DATABASE_URL > backup-$(date +%F).sql";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Admin Console</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage users, plans, usage limits, and monitor the IWRITE workspace
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4" data-testid="admin-tabs">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          </TabsList>

          {/* ============ OVERVIEW TAB ============ */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {statsLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </>
              ) : stats ? (
                <>
                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">FREE Users</CardTitle>
                      <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.freeUsers}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalUsers > 0
                          ? Math.round((stats.freeUsers / stats.totalUsers) * 100)
                          : 0}
                        %
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">PRO Users</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.proUsers}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalUsers > 0
                          ? Math.round((stats.proUsers / stats.totalUsers) * 100)
                          : 0}
                        %
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                      <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.adminUsers}</div>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeUsers}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalUsers > 0
                          ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                          : 0}
                        %
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>

            {/* Usage & Limits Summary */}
            {stats && (
              <div className="grid sm:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today's AI Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-muted-foreground">Total Operations</span>
                      <span className="font-bold text-2xl">{stats.totalDailyUsage}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Avg per User</span>
                      <span className="font-semibold">{stats.avgDailyUsagePerUser}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">FREE Plan Limit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-muted-foreground">Daily Limit</span>
                      <span className="font-bold text-2xl">{stats.freeDailyLimit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Users Near Limit</span>
                      <Badge variant={stats.usersNearLimit > 0 ? "destructive" : "secondary"}>
                        {stats.usersNearLimit}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top Users */}
            {topUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Users Today</CardTitle>
                  <CardDescription>Highest AI operation consumers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topUsers.map((user, idx) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              <Badge variant="outline" className="mt-1">
                                {user.plan}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{user.dailyUsageCount}</p>
                          <p className="text-xs text-muted-foreground">operations</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ============ USERS TAB ============ */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Users Management</CardTitle>
                    <CardDescription>
                      Manage user plans, reset usage, and monitor activity
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = "/api/admin/users/export";
                      link.download = true;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    data-testid="button-export-users"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Search & Filters */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs mb-2 block">Search Email</Label>
                    <Input
                      placeholder="Search..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      data-testid="input-search-users"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Filter by Plan</Label>
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="FREE">FREE</SelectItem>
                        <SelectItem value="PRO_MONTHLY">PRO Monthly</SelectItem>
                        <SelectItem value="PRO_YEARLY">PRO Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Filter by Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Users Table */}
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg hover-elevate"
                        data-testid={`user-row-${user.id}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant={user.plan === "FREE" ? "secondary" : "default"}>
                              {user.plan}
                            </Badge>
                            {user.role === "admin" && (
                              <Badge variant="outline">Admin</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Usage: {user.dailyUsageCount}/{stats?.freeDailyLimit || 5}
                            </span>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" data-testid={`button-manage-${user.id}`}>
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage User</DialogTitle>
                              <DialogDescription>{user.email}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="mb-2 block">Change Plan</Label>
                                <Select
                                  value={user.plan}
                                  onValueChange={(plan) =>
                                    updatePlanMutation.mutate({ userId: user.id, plan })
                                  }
                                  disabled={updatePlanMutation.isPending}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="FREE">FREE</SelectItem>
                                    <SelectItem value="PRO_MONTHLY">PRO Monthly</SelectItem>
                                    <SelectItem value="PRO_YEARLY">PRO Yearly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-3">
                                  Daily Usage: <span className="font-bold">{user.dailyUsageCount}</span>
                                </p>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="w-full">
                                      Reset Usage
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reset Usage?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will reset {user.email}'s daily usage count to 0.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="flex gap-3">
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => resetUsageMutation.mutate(user.id)}
                                        disabled={resetUsageMutation.isPending}
                                      >
                                        {resetUsageMutation.isPending && (
                                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                        )}
                                        Reset
                                      </AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ OPERATIONS TAB ============ */}
          <TabsContent value="operations" className="space-y-6">
            {/* Maintenance Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>Control application availability for users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {maintenanceStatus?.enabled
                        ? "Regular users see maintenance page"
                        : "Application is running normally"}
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceStatus?.enabled || false}
                    onCheckedChange={(enabled) =>
                      toggleMaintenanceMutation.mutate(enabled)
                    }
                    disabled={toggleMaintenanceMutation.isPending}
                    data-testid="switch-maintenance"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Daily Limit Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Limits Configuration</CardTitle>
                <CardDescription>Adjust FREE plan daily operation limit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-3 block">FREE Daily Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={newDailyLimit}
                      onChange={(e) => setNewDailyLimit(e.target.value)}
                      placeholder={stats?.freeDailyLimit.toString() || "5"}
                      data-testid="input-daily-limit"
                    />
                    <Button
                      onClick={() => {
                        if (newDailyLimit) {
                          updateDailyLimitMutation.mutate(parseInt(newDailyLimit));
                        }
                      }}
                      disabled={!newDailyLimit || updateDailyLimitMutation.isPending}
                      data-testid="button-update-limit"
                    >
                      {updateDailyLimitMutation.isPending && (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      )}
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current limit: {stats?.freeDailyLimit} operations/day
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Database Backup */}
            <Card>
              <CardHeader>
                <CardTitle>Database Backup</CardTitle>
                <CardDescription>
                  Backup instructions for production database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Run the following command on your database server to create a backup:
                </p>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm flex items-center justify-between">
                  <code>{pgDumpCommand}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(pgDumpCommand);
                      toast({ title: "Copied", description: "Command copied to clipboard" });
                    }}
                    data-testid="button-copy-backup"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: This command must be run on the server with access to the database.
                  The DATABASE_URL environment variable must be set.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ AI ASSISTANT TAB ============ */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Admin AI Assistant</CardTitle>
                    <CardDescription>
                      Get AI-powered insights and recommendations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Prompts */}
                <div>
                  <p className="text-sm font-semibold mb-3">Quick Insights</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {aiPrompts.map((item) => (
                      <Button
                        key={item.label}
                        variant="outline"
                        className="justify-start h-auto py-3"
                        onClick={() => {
                          setAiPrompt(item.prompt);
                          setAiResponse("");
                        }}
                        data-testid={`button-ai-${item.label.replace(/\s+/g, "-")}`}
                      >
                        <span className="text-left">{item.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div className="space-y-3 pt-4 border-t">
                  <Label>Custom Question</Label>
                  <Textarea
                    placeholder="Ask me anything about user activity, usage patterns, or system optimization..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    data-testid="textarea-ai-prompt"
                    className="min-h-24"
                  />
                  <Button
                    onClick={() => aiInsightsMutation.mutate()}
                    disabled={!aiPrompt || aiInsightsMutation.isPending}
                    className="w-full"
                    data-testid="button-send-ai-prompt"
                  >
                    {aiInsightsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Get Insights
                      </>
                    )}
                  </Button>
                </div>

                {/* AI Response */}
                {aiResponse && (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="text-sm font-semibold">AI Insights</p>
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto">
                      {aiResponse}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAiResponse("")}
                      data-testid="button-clear-response"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
