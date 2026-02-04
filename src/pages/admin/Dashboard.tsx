import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Package,
  Users,
  Search,
  Bot,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { mockAdminStats, mockCrawlers, mockLogs } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const stats = mockAdminStats;
  const recentLogs = mockLogs.slice(0, 5);
  const activeCrawlers = mockCrawlers.filter((c) => c.status === 'running');

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Package,
      description: 'Products in database',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Total Searches',
      value: stats.totalSearches.toLocaleString(),
      change: '+23.1%',
      trend: 'up',
      icon: Search,
      description: 'All time searches',
    },
    {
      title: 'Active Crawlers',
      value: stats.activeCrawlers.toString(),
      change: `-${5 - stats.activeCrawlers}`,
      trend: stats.activeCrawlers >= 3 ? 'up' : 'down',
      icon: Bot,
      description: 'Currently running',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 text-success" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span
                  className={cn(
                    stat.trend === 'up' ? 'text-success' : 'text-destructive'
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Crawler Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Crawler Status
            </CardTitle>
            <CardDescription>Active crawlers and their performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCrawlers.slice(0, 4).map((crawler) => (
              <div key={crawler.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        crawler.status === 'running' && 'bg-success animate-pulse',
                        crawler.status === 'idle' && 'bg-muted-foreground',
                        crawler.status === 'error' && 'bg-destructive',
                        crawler.status === 'paused' && 'bg-warning'
                      )}
                    />
                    <span className="font-medium text-sm">{crawler.name}</span>
                  </div>
                  <Badge
                    variant={
                      crawler.status === 'running'
                        ? 'default'
                        : crawler.status === 'error'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {crawler.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{crawler.productsProcessed.toLocaleString()} products</span>
                  <span>Success: {crawler.successRate}%</span>
                </div>
                <Progress value={crawler.successRate} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system logs and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 h-2 w-2 rounded-full shrink-0',
                      log.level === 'info' && 'bg-primary',
                      log.level === 'warning' && 'bg-warning',
                      log.level === 'error' && 'bg-destructive'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{log.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{log.source}</span>
                      <span>•</span>
                      <span>{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products Crawled Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              +{stats.productsToday.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              New products added to the database
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Errors Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.errorsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Crawling errors in the last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
