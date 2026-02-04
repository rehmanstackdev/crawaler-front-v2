import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Search, Filter, Download, RefreshCw, Info, AlertTriangle, XCircle } from 'lucide-react';
import { mockLogs } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type LogLevel = 'all' | 'info' | 'warning' | 'error';

export default function AdminLogs() {
  const [logs] = useState(mockLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel>('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const sources = Array.from(new Set(logs.map((log) => log.source)));

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter;
    return matchesSearch && matchesLevel && matchesSource;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-primary" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  const infoCount = logs.filter((l) => l.level === 'info').length;
  const warningCount = logs.filter((l) => l.level === 'warning').length;
  const errorCount = logs.filter((l) => l.level === 'error').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">Monitor system activity and errors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className={cn(
            'cursor-pointer transition-colors hover:bg-accent',
            levelFilter === 'info' && 'ring-2 ring-primary'
          )}
          onClick={() => setLevelFilter(levelFilter === 'info' ? 'all' : 'info')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Info Logs</span>
            </div>
            <p className="text-3xl font-bold mt-2">{infoCount}</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-colors hover:bg-accent',
            levelFilter === 'warning' && 'ring-2 ring-warning'
          )}
          onClick={() => setLevelFilter(levelFilter === 'warning' ? 'all' : 'warning')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">Warnings</span>
            </div>
            <p className="text-3xl font-bold mt-2">{warningCount}</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-colors hover:bg-accent',
            levelFilter === 'error' && 'ring-2 ring-destructive'
          )}
          onClick={() => setLevelFilter(levelFilter === 'error' ? 'all' : 'error')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Errors</span>
            </div>
            <p className="text-3xl font-bold mt-2">{errorCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Log Entries
              </CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} of {logs.length} entries
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LogLevel)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[100px]">Level</TableHead>
                  <TableHead className="w-[180px]">Source</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                    <TableCell className="text-sm">{log.source}</TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {getLevelIcon(log.level)}
                        <div>
                          <p className="text-sm">{log.message}</p>
                          {log.metadata && (
                            <pre className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
