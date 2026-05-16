import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Menu, GitCompareArrows, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SearchSuggestInput } from '@/components/SearchSuggestInput';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
}

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

export function Header({ onMenuClick, showSearch = true }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const submit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-20 items-center gap-4 px-4">
        {onMenuClick && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Link to="/compare" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/35 bg-primary/10">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <span className="hidden font-serif text-xl tracking-wide sm:inline-block">
            Craw<span className="text-primary">aler</span>
          </span>
        </Link>

        {showSearch && (
          <div className="flex-1 max-w-xl mx-4">
            <SearchSuggestInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={submit}
              placeholder="Search products across Daraz & Telemart..."
              className="h-11 rounded-full border-border/80 bg-card shadow-sm focus-visible:ring-primary/30"
            />
          </div>
        )}

        <nav className="hidden items-center gap-2 md:flex ml-auto">
          <Button variant="ghost" className="h-9 rounded-full px-3 text-muted-foreground hover:bg-primary/10 hover:text-primary" asChild>
            <Link to="/search">
              <Search className="mr-1.5 h-4 w-4" />
              Search Products
            </Link>
          </Button>
          <Button variant="ghost" className="h-9 rounded-full px-3 text-muted-foreground hover:bg-primary/10 hover:text-primary" asChild>
            <Link to="/compare">
              <GitCompareArrows className="mr-1.5 h-4 w-4" />
              Compare Products
            </Link>
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              className="h-9 rounded-full px-3 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link to="/admin">
                <Shield className="mr-1.5 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 rounded-full px-2 pr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initialsOf(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:inline">{user.name.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium leading-none">{user.name}</div>
                  <div className="mt-1 text-xs font-normal text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/compare" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    My searches
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
