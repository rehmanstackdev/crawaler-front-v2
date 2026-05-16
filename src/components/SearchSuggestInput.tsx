import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fetchSuggestions } from '@/services/productService';

interface SearchSuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  className?: string;
  showLeftIcon?: boolean;
}

export function SearchSuggestInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  showLeftIcon = true,
}: SearchSuggestInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const term = value.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const list = await fetchSuggestions(term, controller.signal);
        setSuggestions(list);
        setActiveIndex(-1);
      } catch {
        // ignore aborts and network errors
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handlePick = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setOpen(false);
    onChange(trimmed);
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handlePick(suggestions[activeIndex]);
        return;
      }
      e.preventDefault();
      onSubmit(value);
      setOpen(false);
      return;
    }
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && value.trim().length >= 2 && (loading || suggestions.length > 0);

  return (
    <div className="relative w-full" ref={containerRef}>
      {showLeftIcon && (
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className={`${showLeftIcon ? 'pl-10' : ''} ${className ?? ''}`}
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}

      {showDropdown && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border/70 bg-popover shadow-lg"
        >
          {suggestions.length === 0 && loading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Loading...</div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={`${s}-${i}`}
              type="button"
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                handlePick(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                i === activeIndex
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
