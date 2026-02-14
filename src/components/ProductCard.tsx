import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Star } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="border-border/80 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/5 hover:shadow-lg">
      <CardContent className="p-3">
        <div className="mb-3 overflow-hidden rounded-lg border border-border/70 bg-secondary/40">
          <img
            src={product.image || 'https://via.placeholder.com/300'}
            alt={product.title}
            className="h-36 w-full object-contain p-2"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="mb-2 cursor-help text-sm font-semibold leading-snug line-clamp-2">
                {product.title}
              </h3>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>{product.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="mb-1 text-2xl font-bold text-primary">
          Rs {product.price.toLocaleString()}
        </p>
        <div className="mb-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={`${product.title}-star-${i}`}
              className={i < Math.round(product.rating) ? 'h-4 w-4 fill-warning text-warning' : 'h-4 w-4 fill-muted text-muted'}
            />
          ))}
          <span className="ml-1 text-sm font-medium text-foreground">
            {Number(product.rating || 0).toFixed(1)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Badge variant={product.platform === 'Daraz' ? 'default' : 'secondary'}>
            {product.platform}
          </Badge>
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-full bg-primary px-3 text-primary-foreground hover:bg-primary/90"
            onClick={() => window.open(product.link, '_blank', 'noopener,noreferrer')}
          >
            Buy
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
