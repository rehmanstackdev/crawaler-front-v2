import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Loader2, RefreshCw, Search, Shield, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

import { MainLayout } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/contexts/AuthContext';
import type { AuthUser } from '@/types/auth';

const PAGE_SIZE = 20;

interface PendingToggle {
  user: AuthUser;
  nextValue: boolean;
}

export const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingToggle | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.listUsers({
        page: 1,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to load users'
        : 'Failed to load users';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.isActive).length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { active, inactive: users.length - active, admins };
  }, [users]);

  const requestToggle = (user: AuthUser, nextValue: boolean) => {
    setPending({ user, nextValue });
  };

  const confirmToggle = async () => {
    if (!pending) return;
    const { user, nextValue } = pending;
    setUpdatingId(user._id);
    setPending(null);
    try {
      const updated = await adminService.setUserStatus(user._id, nextValue);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      toast.success(`${updated.name} has been ${nextValue ? 'activated' : 'deactivated'}`);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Update failed'
        : 'Update failed';
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <MainLayout showSearch={false}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Admin
            </div>
            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage user accounts and access
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatPill label="Users on page" value={users.length} />
            <StatPill label="Active" value={stats.active} tone="success" />
            <StatPill label="Inactive" value={stats.inactive} tone="muted" />
            <StatPill label="Total" value={total} tone="primary" />
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">
              <UsersIcon className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void load()}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                        No users match this search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => {
                      const isSelf = currentUser?._id === u._id;
                      return (
                        <TableRow key={u._id}>
                          <TableCell className="font-medium">
                            {u.name}
                            {isSelf && (
                              <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.isActive ? 'outline' : 'destructive'}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              {updatingId === u._id && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                              )}
                              <Switch
                                checked={u.isActive}
                                disabled={isSelf || updatingId === u._id}
                                onCheckedChange={(value) => requestToggle(u, value)}
                                aria-label={`Toggle active for ${u.name}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {total > users.length && (
              <p className="text-center text-xs text-muted-foreground">
                Showing {users.length} of {total} users. (Pagination coming soon.)
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.nextValue ? 'Activate user?' : 'Deactivate user?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.nextValue ? (
                <>Activating <strong>{pending.user.name}</strong> will allow them to log in again.</>
              ) : (
                <>Deactivating <strong>{pending?.user.name}</strong> will immediately block them from logging in or using the app.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {pending?.nextValue ? 'Activate' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

const StatPill = ({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number | string;
  tone?: 'default' | 'success' | 'muted' | 'primary';
}) => {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
      : tone === 'muted'
        ? 'border-border bg-muted/40 text-muted-foreground'
        : tone === 'primary'
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-border bg-card text-foreground';
  return (
    <div className={`rounded-full border px-3 py-1.5 text-xs font-medium ${toneClass}`}>
      <span className="opacity-70">{label}: </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

export default AdminDashboard;
