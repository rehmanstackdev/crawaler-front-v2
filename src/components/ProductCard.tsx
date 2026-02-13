import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={product.image || 'https://via.placeholder.com/80'}
            alt={product.title}
            className="w-20 h-20 object-cover rounded-lg bg-gray-100"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-sm line-clamp-2 mb-2">
              {product.title}
            </h3>
            <p className="text-2xl font-bold text-red-500 mb-1">
              Rs {product.price.toLocaleString()}
            </p>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-yellow-600 mb-2">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
            <Badge variant={product.platform === 'Daraz' ? 'default' : 'secondary'}>
              {product.platform}
            </Badge>
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
            >
              View Product <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
