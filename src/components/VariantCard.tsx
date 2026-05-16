import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Star, Tag, Award, Store } from 'lucide-react';
import { VariantGroup } from '@/types/product';

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  blue: '#3B82F6',
  red: '#EF4444',
  green: '#22C55E',
  gold: '#F59E0B',
  silver: '#C0C0C0',
  grey: '#6B7280',
  gray: '#6B7280',
  purple: '#A855F7',
  orange: '#F97316',
  pink: '#EC4899',
  yellow: '#EAB308',
  brown: '#92400E',
  coral: '#FF7F50',
  cream: '#FFFDD0',
  mint: '#98FF98',
  lavender: '#E6E6FA',
  bronze: '#CD7F32',
  titanium: '#878681',
  graphite: '#41424C',
  midnight: '#191970',
  starlight: '#F8F0E3',
  'sierra blue': '#69ABCE',
  'alpine green': '#4A6741',
  'deep purple': '#6A0DAD',
  'space black': '#1C1C1E',
  'space gray': '#535150',
  'space grey': '#535150',
  'phantom black': '#1A1A2E',
  'phantom white': '#F5F5F5',
  'mystic bronze': '#C9A882',
  'cloud blue': '#ACE5EE',
  'cloud white': '#F0F0F0',
  'cloud pink': '#FFB6C1',
  'cloud navy': '#001F3F',
  'cloud lavender': '#D4C4E0',
  'ice blue': '#99DDFF',
  'glacier blue': '#6FAACC',
  'sunset gold': '#E8A317',
  'morning blue': '#8DA399',
  'racing blue': '#0033CC',
  'dynamic black': '#0D0D0D',
  'narzo blue': '#0066CC',
  'glory gold': '#D4AF37',
  'glaze blue': '#4F97D4',
  'glaze green': '#4CAF50',
  'sunny oasis': '#FFD700',
  'mega blue': '#1A73E8',
  'power black': '#0A0A0A',
  'power blue': '#4169E1',
  'speed black': '#111111',
  'sunlight gold': '#FFD700',
  'sunrise blue': '#4FC3F7',
  'twilight blue': '#0C1445',
};

interface VariantCardProps {
  variant: VariantGroup;
}

export const VariantCard = ({ variant }: VariantCardProps) => {
  const priceDiff = variant.highestPrice - variant.lowestPrice;
  const savingsPercent =
    variant.highestPrice > 0
      ? Math.round((priceDiff / variant.highestPrice) * 100)
      : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-secondary/30 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Store className="h-4 w-4 shrink-0 text-primary" />
          <h3 className="truncate text-sm font-bold text-foreground">
            {variant.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Variant Specs inline */}
          {variant.color && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-border/40"
                      style={{ backgroundColor: COLOR_MAP[variant.color] || '#888' }}
                    />
                    <span className="text-[10px] font-medium capitalize text-foreground/70">
                      {variant.color}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="capitalize">Color: {variant.color}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {variant.ram && (
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
              {variant.ram}
            </span>
          )}
          {variant.storage && (
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
              {variant.storage}
            </span>
          )}
          <Badge className="bg-primary/10 text-primary hover:bg-primary/15 text-[10px] font-bold">
            {variant.totalOffers} {variant.totalOffers > 1 ? 'offers' : 'offer'}
          </Badge>
        </div>
      </div>

      {/* Seller Rows */}
      <div>
        {variant.offers.map((offer, idx) => {
          const isCheapest = offer.price === variant.lowestPrice;
          const isMostExpensive =
            variant.offers.length > 1 && offer.price === variant.highestPrice;

          return (
            <div
              key={idx}
              className={`flex items-stretch gap-4 border-b border-border/30 px-4 py-3.5 last:border-b-0 transition-colors hover:bg-secondary/30 ${
                isCheapest
                  ? 'bg-gradient-to-r from-emerald-50/80 to-transparent dark:from-emerald-500/5'
                  : ''
              }`}
            >
              {/* Product Image */}
              <div className="shrink-0 self-center">
                <div className="h-16 w-16 overflow-hidden rounded-xl border border-border/50 bg-white p-1">
                  <img
                    src={offer.image || variant.thumbnail || 'https://via.placeholder.com/64'}
                    alt={offer.title}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Middle: Info */}
              <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
                {/* Product Title */}
                <p className="truncate text-[13px] font-medium text-foreground leading-tight" title={offer.title}>
                  {offer.title}
                </p>

                {/* Seller + Platform */}
                <div className="flex items-center gap-1.5">
                  {isCheapest && variant.offers.length > 1 && (
                    <Award className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  )}
                  <span className={`text-xs font-semibold ${isCheapest ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                    {offer.seller}
                  </span>
                  <span className="text-border">|</span>
                  <Badge
                    className={`h-4 rounded px-1.5 text-[9px] font-bold uppercase tracking-wide ${
                      offer.platform === 'Daraz'
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {offer.platform}
                  </Badge>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {Number(offer.rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Offer Specs */}
                <div className="flex flex-wrap items-center gap-1">
                  {offer.color && (
                    <div className="flex items-center gap-1 rounded-full bg-secondary/70 px-1.5 py-0.5">
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-border/30"
                        style={{ backgroundColor: COLOR_MAP[offer.color] || '#888' }}
                      />
                      <span className="text-[10px] font-medium capitalize text-muted-foreground">
                        {offer.color}
                      </span>
                    </div>
                  )}
                  {offer.ram && (
                    <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                      {offer.ram}
                    </span>
                  )}
                  {offer.storage && (
                    <span className="rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600">
                      {offer.storage}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Price + Buy */}
              <div className="shrink-0 flex flex-col items-end justify-center gap-1">
                <p
                  className={`text-lg font-extrabold tracking-tight ${
                    isCheapest
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isMostExpensive
                        ? 'text-red-500/80'
                        : 'text-foreground'
                  }`}
                >
                  Rs {offer.price.toLocaleString()}
                </p>
                {isCheapest && priceDiff > 0 && (
                  <span className="text-[10px] font-bold text-emerald-500">Lowest Price</span>
                )}
                <Button
                  type="button"
                  size="sm"
                  className={`h-7 rounded-lg px-3 text-[11px] font-semibold shadow-sm transition-all ${
                    isCheapest
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-emerald-500/20'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                  onClick={() =>
                    window.open(offer.link, '_blank', 'noopener,noreferrer')
                  }
                >
                  Buy
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Savings Footer */}
      {priceDiff > 0 && (
        <div className="flex items-center justify-center gap-1.5 border-t border-border/30 bg-emerald-500/5 py-2.5 text-xs">
          <Tag className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-semibold text-emerald-600">
            You save Rs {priceDiff.toLocaleString()} by comparing prices!
          </span>
          {savingsPercent > 0 && (
            <Badge className="ml-1 bg-emerald-500 text-white hover:bg-emerald-600 text-[10px] px-1.5 py-0">
              {savingsPercent}% off
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
