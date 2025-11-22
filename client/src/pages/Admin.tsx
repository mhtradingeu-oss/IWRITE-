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
import {
  Loader2,
  Shield,
  Users,
  TrendingUp,
  Activity,
  Zap,
  Brain,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Send,
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
  totalDailyUsage: number;
  avgDailyUsagePerUser: number;
  freeDailyLimit: number;
  usersNearLimit: number;
}

export default function Admin() {
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [newDailyLimit, setNewDailyLimit] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");

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

  // Fetch all users
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

  // Fetch system stats
  const { data: stats = null, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Fetch system health
  const { data: health } = useQuery({
    queryKey: ["/api/admin/health"],
    queryFn: async () => {
      const response = await fetch("/api/admin/health", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch health");
      return response.json();
    },
    enabled: !!currentUser,
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

  // AI Insights mutation
  const aiInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: { stats, usersCount: users.length, usersNearLimit: stats?.usersNearLimit || 0 },
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

  const isAdmin =
    currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL ||
    currentUser?.email === "mhtrading@gmail.com";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter users based on search
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  // Predefined AI prompts
  const aiPrompts = [
    {
      label: "Summarize activity",
      prompt: "Provide a brief summary of today's user activity and AI usage patterns.",
    },
    {
      label: "Suggest upgrades",
      prompt: "Which users should I consider reaching out to for PRO plan upgrades based on their usage patterns?",
    },
    {
      label: "Check anomalies",
      prompt: "Are there any unusual patterns or anomalies in today's usage data that I should be aware of?",
    },
    {
      label: "Optimize limits",
      prompt: "Based on current usage, should I adjust the FREE daily limit? What would be optimal?",
    },
  ];

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

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4" data-testid="admin-tabs">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="limits">Usage & Limits</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsLoading ? (
                <>
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </>
              ) : stats ? (
                <>
                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.freeUsers} free, {stats.proUsers} pro
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                      <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.activeUsers}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalUsers > 0
                          ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                          : 0}
                        % engagement
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.totalDailyUsage}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg {stats.avgDailyUsagePerUser} per user
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Near Limit</CardTitle>
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.usersNearLimit}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Free users at 4+/{stats.freeDailyLimit} usage
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Real-time system status</CardDescription>
                  </div>
                  {health?.status === "healthy" ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Database</p>
                    <p className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Connected
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">API Status</p>
                    <p className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Operational
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>View and manage all users in the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  data-testid="input-search-users"
                />

                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No users found</p>
                ) : (
                  <div className="space-y-3">
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
                              Usage: {user.dailyUsageCount}
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
                                <Label className="mb-2 block">Plan</Label>
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
                                    <SelectItem value="PRO_MONTHLY">PRO_MONTHLY</SelectItem>
                                    <SelectItem value="PRO_YEARLY">PRO_YEARLY</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Daily Usage
                                </p>
                                <p className="text-2xl font-bold mb-3">{user.dailyUsageCount}</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => resetUsageMutation.mutate(user.id)}
                                  disabled={resetUsageMutation.isPending}
                                >
                                  {resetUsageMutation.isPending && (
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                  )}
                                  Reset Usage
                                </Button>
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

          {/* Usage & Limits Tab */}
          <TabsContent value="limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage & Limits Configuration</CardTitle>
                <CardDescription>Manage AI operation limits and view usage breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Limit Settings */}
                <div>
                  <Label className="mb-3 block font-semibold">FREE Daily Limit</Label>
                  <div className="flex gap-2 mb-4">
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
                      disabled={
                        !newDailyLimit || updateDailyLimitMutation.isPending
                      }
                      data-testid="button-update-limit"
                    >
                      {updateDailyLimitMutation.isPending && (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      )}
                      Update
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current limit: {stats?.freeDailyLimit} AI operations per day for FREE users
                  </p>
                </div>

                {/* Usage Breakdown */}
                {stats && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Today's Usage Breakdown</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Operations</p>
                        <p className="text-2xl font-bold">{stats.totalDailyUsage}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">FREE Users</p>
                        <p className="text-2xl font-bold">{stats.freeUsers}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">PRO Users</p>
                        <p className="text-2xl font-bold">{stats.proUsers}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Avg per User</p>
                        <p className="text-2xl font-bold">{stats.avgDailyUsagePerUser}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Admin AI Assistant</CardTitle>
                    <CardDescription>
                      Get AI-powered insights and suggestions based on current usage and user data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Predefined Prompts */}
                <div>
                  <p className="text-sm font-semibold mb-3">Quick Insights</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {aiPrompts.map((item) => (
                      <Button
                        key={item.label}
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          setAiPrompt(item.prompt);
                          setAiResponse("");
                        }}
                        data-testid={`button-ai-${item.label.replace(/\s+/g, "-")}`}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div className="space-y-3 pt-4 border-t">
                  <Label>Custom Question</Label>
                  <Textarea
                    placeholder="Ask me anything about your system, users, or usage patterns..."
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
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
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
