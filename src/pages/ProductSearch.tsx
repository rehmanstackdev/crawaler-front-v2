import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, ShoppingCart } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { searchProducts } from '@/services/productService';
import { SearchResults } from '@/types/product';
import { MainLayout } from '@/components/layout';

export const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useQuery<SearchResults>({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      const result = await searchProducts(searchQuery);
      return result;
    },
    enabled: !!searchQuery,
  });

  const handleSearch = () => {
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {/* Search Section */}
        <div className="mb-8 rounded-3xl border border-border/70 bg-card/95 p-6 shadow-lg md:p-8">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-foreground md:text-4xl">
              Compare Products from Multiple Stores
            </h2>
            <p className="text-sm text-muted-foreground md:text-lg">
              Search across Daraz and Telemart to find the best prices
            </p>
          </div>

          <div className="mx-auto flex max-w-4xl flex-col gap-3 md:flex-row">
            <Input
              placeholder="Search for products (e.g., iPhone 13, Samsung TV, Laptop)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="h-12 text-base md:text-lg"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="h-12 rounded-xl bg-primary px-8 text-primary-foreground hover:bg-primary/90 md:min-w-36"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-destructive">
            Error loading results. Please check your connection and try again.
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="rounded-3xl border border-border/70 bg-card/95 p-4 shadow-lg md:p-6">
            <div className="mb-6 flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <h3 className="text-2xl font-semibold text-foreground">Search Results</h3>
                <p className="mt-1 text-muted-foreground">
                  Found <span className="font-semibold text-primary">{data.total}</span> products for "{searchQuery}"
                </p>
              </div>
            </div>

            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-secondary/70 p-2">
                <TabsTrigger value="comparison" className="w-full rounded-xl border border-transparent px-4 text-base text-muted-foreground transition-colors data-[state=active]:border-primary/25 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                  Side-by-Side
                </TabsTrigger>
                <TabsTrigger value="ranked" className="w-full rounded-xl border border-transparent px-4 text-base text-muted-foreground transition-colors data-[state=active]:border-primary/25 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                  Best Deals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Daraz</h2>
                        <p className="text-sm text-muted-foreground">{data.daraz.length} products</p>
                      </div>
                    </div>
                    <div className="grid max-h-[70vh] gap-3 overflow-auto pr-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {data.daraz.length > 0 ? (
                        data.daraz.map((product, idx) => (
                          <ProductCard key={idx} product={product} />
                        ))
                      ) : (
                        <p className="py-8 text-center text-muted-foreground">No products found</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Telemart</h2>
                        <p className="text-sm text-muted-foreground">{data.telemart.length} products</p>
                      </div>
                    </div>
                    <div className="grid max-h-[70vh] gap-3 overflow-auto pr-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {data.telemart.length > 0 ? (
                        data.telemart.map((product, idx) => (
                          <ProductCard key={idx} product={product} />
                        ))
                      ) : (
                        <p className="py-8 text-center text-muted-foreground">No products found</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ranked" className="mt-6">
                <div className="space-y-3">
                  {data.ranked.map((product, idx) => (
                    <div key={idx} className="relative rounded-xl border border-border/60 bg-card/70 p-2">
                      {idx < 3 && (
                        <div className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-warning text-sm font-bold text-warning-foreground">
                          {idx + 1}
                        </div>
                      )}
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </TabsContent>

            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {!data && !isLoading && (
          <div className="text-center py-16">
            <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">Start Your Search</h3>
            <p className="text-muted-foreground">Enter a product name above to compare prices</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};


