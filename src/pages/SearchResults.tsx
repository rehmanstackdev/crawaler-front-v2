import { useEffect, useState, useMemo } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Star, Filter, Grid, List, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductGroup } from '@/types';

type ViewMode = 'grid' | 'list';
type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'offers';
const API_BASE = import.meta.env.VITE_API_URL;

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [activePlatform, setActivePlatform] = useState<'daraz' | 'telemart'>('daraz');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['daraz', 'telemart']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );

  const paginationText = useMemo(() => {
    if (totalResults === 0) return 'Showing 0 results';
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalResults);
    return `Showing ${start} to ${end} of ${totalResults} services`;
  }, [page, pageSize, totalResults]);

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [];
    const items: (number | 'ellipsis')[] = [];
    const pushRange = (from: number, to: number) => {
      for (let i = from; i <= to; i += 1) items.push(i);
    };

    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);

    items.push(1);
    if (start > 2) items.push('ellipsis');
    pushRange(Math.max(2, start), Math.min(end, totalPages - 1));
    if (end < totalPages - 1) items.push('ellipsis');
    if (totalPages > 1) items.push(totalPages);

    return items;
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query, activePlatform, sortBy]);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setPage(1);
      setTotalPages(0);
      setTotalResults(0);
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `${API_BASE}/search/${activePlatform}?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&sortBy=${encodeURIComponent(sortBy)}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        setProducts(json?.data?.products || []);
        setTotalPages(Number(json?.data?.pagination?.totalPages) || 0);
        setTotalResults(Number(json?.data?.pagination?.totalResults) || 0);
        setPageSize(Number(json?.data?.pagination?.pageSize) || pageSize);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Failed to load results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [query, page, pageSize, activePlatform, sortBy]);

  const filteredProducts = useMemo(() => {
    let productList = [...products];

    // Filter by category
    if (selectedCategories.length > 0) {
      productList = productList.filter((p) => selectedCategories.includes(p.category));
    }

    // Filter by price range
    productList = productList.filter(
      (p) => p.lowestPrice >= priceRange[0] && p.lowestPrice <= priceRange[1]
    );


    // Filter by platforms
    if (selectedPlatforms.length > 0 && selectedPlatforms.length < 2) {
      productList = productList.filter((p) =>
        p.offers.some((o) => selectedPlatforms.includes(o.platform))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        productList.sort((a, b) => a.lowestPrice - b.lowestPrice);
        break;
      case 'price-desc':
        productList.sort((a, b) => b.lowestPrice - a.lowestPrice);
        break;
      case 'rating':
        productList = productList.filter((p) => Number(p.averageRating) > 0);
        productList.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'offers':
        productList.sort((a, b) => b.totalOffers - a.totalOffers);
        break;
    }

    const paged =
      pageSize > 0 ? productList.slice(0, pageSize) : productList;
    return paged;
  }, [products, query, selectedCategories, priceRange, selectedPlatforms, sortBy, pageSize]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
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
              id="telemart"
              checked={selectedPlatforms.includes('telemart')}
              onCheckedChange={() => togglePlatform('telemart')}
            />
            <Label htmlFor="telemart" className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-temu" />
              Telemart
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
    </div>
  );

  const SearchSummary = () => (
    <div>
      {query ? (
        <>
          <p className="text-xs sm:text-sm text-muted-foreground">Results for</p>
          <h1 className="mb-2 text-base sm:text-lg font-semibold leading-snug break-words">"{query}"</h1>
        </>
      ) : (
        <h1 className="mb-2 text-base sm:text-lg font-semibold leading-snug">
          {categoryParam ? `${categoryParam}` : 'All Products'}
        </h1>
      )}
      {loading ? (
        <p className="text-xs sm:text-sm text-muted-foreground">
          Searching {activePlatform === 'daraz' ? 'Daraz' : 'Telemart'}...
        </p>
      ) : error ? (
        <p className="text-xs sm:text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs sm:text-sm text-muted-foreground">{paginationText}</p>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="container px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex min-h-0 gap-6 lg:min-h-[calc(100vh-180px)]">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden w-64 shrink-0 overflow-y-auto lg:sticky lg:top-24 lg:block lg:self-start lg:max-h-[calc(100vh-180px)]">
            <Card className="border-border/70 bg-card/90">
              <CardContent className="p-4">
                <SearchSummary />
                <Separator className="my-4" />
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4" />
                  <h2 className="font-semibold">Filters</h2>
                </div>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Toolbar */}
            <div className="sticky top-[72px] sm:top-24 z-30 mb-3 sm:mb-4 mt-4 sm:mt-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 rounded-xl sm:rounded-2xl border border-border/70 bg-card/95 p-2 sm:p-3 backdrop-blur">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden text-xs sm:text-sm h-8 sm:h-9">
                      <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <SearchSummary />
                      <Separator className="my-4" />
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle */}
                <div className="flex gap-0.5 sm:gap-1 rounded-lg border border-border/80 bg-background p-0.5 sm:p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-6 w-6 sm:h-7 sm:w-7 p-0 transition-colors',
                      viewMode === 'grid'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    )}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-6 w-6 sm:h-7 sm:w-7 p-0 transition-colors',
                      viewMode === 'list'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as 'daraz' | 'telemart')} className="flex-1 sm:flex-none">
                  <TabsList className="h-8 sm:h-9">
                    <TabsTrigger value="daraz" className="text-xs sm:text-sm px-2 sm:px-3">Daraz</TabsTrigger>
                    <TabsTrigger value="telemart" className="text-xs sm:text-sm px-2 sm:px-3">Telemart</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-36 sm:w-48 border-border/80 bg-background text-xs sm:text-sm h-8 sm:h-9">
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
            </div>

            <div className="flex-1 pr-1">
            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <Card className="border-border/70 bg-card/90 p-12 text-center">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange([0, 1000000]);
                  setSelectedPlatforms(['daraz', 'telemart']);
                }}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 justify-items-center sm:justify-items-stretch'
                      : 'flex flex-col gap-3 sm:gap-4'
                  )}
                >
                  {filteredProducts.map((product) => {
                    const primaryOffer =
                      product.offers.find((o) => o.platform === activePlatform) || product.offers[0];
                    const externalProductUrl = primaryOffer?.productUrl;
                    const externalPlatformLabel = activePlatform === 'daraz' ? 'Daraz' : 'Telemart';

                    return (
                    <Link key={product.id} to={`/product/${product.id}`} className="w-full max-w-sm sm:max-w-none">
                      <Card
                        className={cn(
                          'group overflow-hidden border-border/70 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/5 hover:shadow-lg w-full',
                          viewMode === 'list' && 'flex'
                        )}
                      >
                        <div
                          className={cn(
                            'overflow-hidden bg-secondary/50',
                            viewMode === 'grid' ? 'aspect-square' : 'w-24 sm:w-40 shrink-0 self-stretch'
                          )}
                        >
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <CardContent className={cn('p-3 sm:p-4', viewMode === 'list' && 'flex-1')}>
                          <div className="mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">
                              {product.offers.some((o) => o.platform === 'daraz')
                                ? product.offers.find((o) => o.platform === 'daraz')?.seller || 'Unknown'
                                : product.brand}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">
                              {product.category}
                            </Badge>
                            <div className="flex gap-1">
                              {product.offers.some((o) => o.platform === 'daraz') && (
                                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-daraz" title="Available on Daraz" />
                              )}
                            {product.offers.some((o) => o.platform === 'telemart') && (
                              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-temu" title="Available on Telemart" />
                            )}
                            </div>
                          </div>
                          <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <div className="mb-1.5 sm:mb-2 flex items-center gap-0.5 sm:gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={`${product.id}-star-${i}`}
                                className={cn(
                                  'h-3 w-3 sm:h-4 sm:w-4',
                                  i < Math.round(product.averageRating)
                                    ? 'fill-warning text-warning'
                                    : 'fill-muted text-muted'
                                )}
                              />
                            ))}
                            <span className="ml-0.5 sm:ml-1 text-xs sm:text-sm font-medium text-foreground">
                              {Number(product.averageRating || 0).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-base sm:text-lg font-bold text-primary">
                              Rs. {product.lowestPrice.toLocaleString()}
                            </span>
                            {product.lowestPrice !== product.highestPrice && (
                              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                Rs. {product.highestPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {externalProductUrl && (
                            <Button
                              type="button"
                              size="sm"
                              className="mt-2 sm:mt-3 w-full sm:w-fit bg-primary px-3 sm:px-4 text-xs sm:text-sm h-8 sm:h-9 text-primary-foreground hover:bg-primary/90"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(externalProductUrl, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              Buy on {externalPlatformLabel}
                              <ExternalLink className="ml-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  )})}
                </div>

                <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                  <div className="text-[8px] sm:text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-none">{paginationText}</div>
                  <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage(1)}
                      className="h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm hidden sm:flex"
                    >
                      {'<<'}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-7 sm:h-9 px-1.5 sm:px-4 text-[10px] sm:text-sm"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>

                    {paginationItems.map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-0.5 sm:px-2 text-muted-foreground text-[10px] sm:text-sm">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={item === page ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => setPage(item)}
                          disabled={loading}
                          className="h-7 w-7 sm:h-9 sm:w-9 text-[10px] sm:text-sm"
                        >
                          {item}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      disabled={(totalPages > 0 && page >= totalPages) || loading}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-7 sm:h-9 px-1.5 sm:px-4 text-[10px] sm:text-sm"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={(totalPages > 0 && page >= totalPages) || loading}
                      onClick={() => totalPages > 0 && setPage(totalPages)}
                      className="h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm hidden sm:flex"
                    >
                      {'>>'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}




