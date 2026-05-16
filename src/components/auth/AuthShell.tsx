import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthShell = ({ title, subtitle, children, footer }: Props) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-border/70 bg-card/95 p-7 shadow-2xl backdrop-blur">
            <Link to="/login" className="mb-6 flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/35 bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <span className="font-serif text-2xl tracking-wide">
                Craw<span className="text-primary">aler</span>
              </span>
            </Link>

            <div className="mb-6 space-y-1.5 text-center">
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {children}

            {footer && (
              <>
                <div className="my-6 h-px w-full bg-border/70" />
                <p className="text-center text-sm text-muted-foreground">{footer}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
