import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { searchProducts } from '@/services/productService';
import { SearchResults } from '@/types/product';

export const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useQuery<SearchResults>({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      console.log('Frontend: Searching for:', searchQuery);
      const result = await searchProducts(searchQuery);
      console.log('Frontend: Results:', result);
      return result;
    },
    enabled: !!searchQuery,
  });

  const handleSearch = () => {
    if (query.trim()) {
      console.log('Frontend: Starting search for:', query.trim());
      setSearchQuery(query.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">🔍 Product Search & Compare</h1>
          <p className="text-lg">Find the best deals from Daraz and Telemart in one place</p>
        </div>

        <div className="flex gap-2 max-w-2xl mx-auto mb-8">
          <Input
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-white"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
            Error loading results. Make sure the backend is running.
          </div>
        )}

        {data && (
          <div className="bg-white rounded-2xl p-6">
            <div className="text-center text-gray-600 font-semibold mb-6">
              {data.total} results found
            </div>

            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
                <TabsTrigger value="ranked">Best Deals</TabsTrigger>
                <TabsTrigger value="all">All Results</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      🛒 Daraz ({data.daraz.length})
                    </h2>
                    <div className="space-y-3">
                      {data.daraz.map((product, idx) => (
                        <ProductCard key={idx} product={product} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      📱 Telemart ({data.telemart.length})
                    </h2>
                    <div className="space-y-3">
                      {data.telemart.map((product, idx) => (
                        <ProductCard key={idx} product={product} />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ranked" className="mt-6">
                <h2 className="text-xl font-bold mb-4">🏆 Best Deals (Ranked)</h2>
                <div className="space-y-3">
                  {data.ranked.map((product, idx) => (
                    <ProductCard key={idx} product={product} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-3">
                  {[...data.daraz, ...data.telemart].map((product, idx) => (
                    <ProductCard key={idx} product={product} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};
