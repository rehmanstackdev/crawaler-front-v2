import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bot,
  Play,
  Pause,
  RefreshCw,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { mockCrawlers } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function AdminCrawlers() {
  const [crawlers, setCrawlers] = useState(mockCrawlers);

  const handleStatusChange = (id: string, newStatus: 'running' | 'paused') => {
    setCrawlers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    toast.success(`Crawler ${newStatus === 'running' ? 'started' : 'paused'}`);
  };

  const handleRestart = (id: string) => {
    setCrawlers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'running', errorCount: 0 } : c))
    );
    toast.success('Crawler restarted');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'idle':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const runningCount = crawlers.filter((c) => c.status === 'running').length;
  const errorCount = crawlers.filter((c) => c.status === 'error').length;
  const totalProducts = crawlers.reduce((sum, c) => sum + c.productsProcessed, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crawlers Monitor</h1>
          <p className="text-muted-foreground">Manage and monitor your web crawlers</p>
        </div>
        <Button>
          <Bot className="mr-2 h-4 w-4" />
          Add Crawler
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">Running</span>
            </div>
            <p className="text-3xl font-bold mt-2">{runningCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground">Errors</span>
            </div>
            <p className="text-3xl font-bold mt-2">{errorCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Crawlers</span>
            </div>
            <p className="text-3xl font-bold mt-2">{crawlers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Products Processed</span>
            </div>
            <p className="text-3xl font-bold mt-2">{totalProducts.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Crawlers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Crawlers</CardTitle>
          <CardDescription>View and manage all configured crawlers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crawler</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crawlers.map((crawler) => (
                <TableRow key={crawler.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{crawler.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        crawler.platform === 'daraz'
                          ? 'border-daraz text-daraz'
                          : 'border-olx text-olx'
                      )}
                    >
                      {crawler.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(crawler.status)}
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
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDistanceToNow(new Date(crawler.lastRun), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(crawler.nextRun), 'HH:mm')}
                  </TableCell>
                  <TableCell>{crawler.productsProcessed.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={crawler.successRate} className="h-2 w-16" />
                      <span className="text-xs text-muted-foreground">
                        {crawler.successRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={crawler.status === 'running'}
                      onCheckedChange={(checked) =>
                        handleStatusChange(crawler.id, checked ? 'running' : 'paused')
                      }
                      disabled={crawler.status === 'error'}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(crawler.id, 'running')}>
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(crawler.id, 'paused')}>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRestart(crawler.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Restart
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
