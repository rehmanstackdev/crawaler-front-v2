import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Star, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { mockProductGroups, categories } from '@/data/mockData';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'offers';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['daraz', 'olx']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [minRating, setMinRating] = useState(0);

  const filteredProducts = useMemo(() => {
    let products = [...mockProductGroups];

    // Filter by search query
    if (query) {
      const searchLower = query.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      products = products.filter((p) => selectedCategories.includes(p.category));
    }

    // Filter by price range
    products = products.filter(
      (p) => p.lowestPrice >= priceRange[0] && p.lowestPrice <= priceRange[1]
    );

    // Filter by rating
    if (minRating > 0) {
      products = products.filter((p) => p.averageRating >= minRating);
    }

    // Filter by platforms
    if (selectedPlatforms.length > 0 && selectedPlatforms.length < 2) {
      products = products.filter((p) =>
        p.offers.some((o) => selectedPlatforms.includes(o.platform))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.lowestPrice - b.lowestPrice);
        break;
      case 'price-desc':
        products.sort((a, b) => b.lowestPrice - a.lowestPrice);
        break;
      case 'rating':
        products.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'offers':
        products.sort((a, b) => b.totalOffers - a.totalOffers);
        break;
    }

    return products;
  }, [query, selectedCategories, priceRange, minRating, selectedPlatforms, sortBy]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Platforms */}
      <div>
        <h3 className="mb-3 font-semibold">Platforms</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="daraz"
              checked={selectedPlatforms.includes('daraz')}
              onCheckedChange={() => togglePlatform('daraz')}
            />
            <Label htmlFor="daraz" className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-daraz" />
              Daraz
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="olx"
              checked={selectedPlatforms.includes('olx')}
              onCheckedChange={() => togglePlatform('olx')}
            />
            <Label htmlFor="olx" className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-olx" />
              OLX
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="mb-3 font-semibold">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={0}
            max={1000000}
            step={10000}
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="h-8"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="h-8"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h3 className="mb-3 font-semibold">Categories</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label htmlFor={category}>{category}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="mb-3 font-semibold">Minimum Rating</h3>
        <div className="flex gap-2">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <Button
              key={rating}
              variant={minRating === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMinRating(rating)}
              className="flex-1"
            >
              {rating === 0 ? 'All' : `${rating}+`}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="container px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {query ? `Results for "${query}"` : categoryParam ? `${categoryParam}` : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            Found {filteredProducts.length} product groups
          </p>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4" />
                  <h2 className="font-semibold">Filters</h2>
                </div>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle */}
                <div className="flex rounded-lg border p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="offers">Most Offers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange([0, 1000000]);
                  setMinRating(0);
                  setSelectedPlatforms(['daraz', 'olx']);
                }}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                    : 'flex flex-col gap-4'
                )}
              >
                {filteredProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <Card
                      className={cn(
                        'group overflow-hidden transition-all hover:shadow-lg',
                        viewMode === 'list' && 'flex'
                      )}
                    >
                      <div
                        className={cn(
                          'overflow-hidden bg-secondary/50',
                          viewMode === 'grid' ? 'aspect-square' : 'h-40 w-40 shrink-0'
                        )}
                      >
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <CardContent className={cn('p-4', viewMode === 'list' && 'flex-1')}>
                        <div className="mb-2 flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {product.brand}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                          <div className="flex gap-1">
                            {product.offers.some((o) => o.platform === 'daraz') && (
                              <span className="h-2 w-2 rounded-full bg-daraz" title="Available on Daraz" />
                            )}
                            {product.offers.some((o) => o.platform === 'olx') && (
                              <span className="h-2 w-2 rounded-full bg-olx" title="Available on OLX" />
                            )}
                          </div>
                        </div>
                        <h3 className="mb-2 font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="text-sm font-medium">{product.averageRating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            • {product.totalOffers} offers
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-primary">
                            Rs. {product.lowestPrice.toLocaleString()}
                          </span>
                          {product.lowestPrice !== product.highestPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              Rs. {product.highestPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
