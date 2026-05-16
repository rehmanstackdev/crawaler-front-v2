import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
import { Star, Filter, Grid, List, SlidersHorizontal, ExternalLink, Search, ImagePlus, X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchSuggestInput } from '@/components/SearchSuggestInput';
import { searchProductsByImage } from '@/services/productService';
import { api } from '@/lib/apiClient';
import { toast } from 'sonner';
import type { ProductGroup } from '@/types';

type ViewMode = 'grid' | 'list';
type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'offers';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [localQuery, setLocalQuery] = useState(query);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageSearching, setIsImageSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => { setLocalQuery(query); }, [query]);

  useEffect(() => {
    if (!imageFile) { setImagePreview(null); return; }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleTextSearch = (term?: string) => {
    const next = (term ?? localQuery).trim();
    if (next) navigate(`/search?q=${encodeURIComponent(next)}`);
  };

  const handleImagePicked = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file.'); return; }
    if (file.size > MAX_IMAGE_BYTES) { toast.error('Image must be 5MB or smaller.'); return; }
    setImageFile(file);
    setIsImageSearching(true);
    try {
      const result = await searchProductsByImage(file);
      if (result?.derivedQuery) {
        setLocalQuery(result.derivedQuery);
        toast.success(`Searched as: ${result.derivedQuery}`);
        navigate(`/search?q=${encodeURIComponent(result.derivedQuery)}`);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error)?.message ||
        'Image search failed.';
      toast.error(msg);
      setImageFile(null);
    } finally {
      setIsImageSearching(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImagePicked(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImagePicked(file);
  };

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
        const res = await api.get(`/search/${activePlatform}`, {
          params: { q: query, page, pageSize, sortBy },
          signal: controller.signal,
        });
        const json = res.data;
        setProducts(json?.data?.products || []);
        setTotalPages(Number(json?.data?.pagination?.totalPages) || 0);
        setTotalResults(Number(json?.data?.pagination?.totalResults) || 0);
        setPageSize(Number(json?.data?.pagination?.pageSize) || pageSize);
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'CanceledError') return;
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
      <div className="container px-2 sm:px-4 pt-6 pb-2">
        <div className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-lg md:p-6">
          <div className="flex flex-col gap-3 md:flex-row">
            <SearchSuggestInput
              value={localQuery}
              onChange={setLocalQuery}
              onSubmit={(term) => handleTextSearch(term)}
              placeholder="Search products across Daraz & Telemart..."
              className="h-12 text-base"
            />
            <Button
              onClick={() => handleTextSearch()}
              disabled={isImageSearching}
              className="h-12 rounded-xl bg-primary px-8 text-primary-foreground hover:bg-primary/90 md:min-w-36"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>

          <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border/70" />
            <span>or search visually</span>
            <div className="h-px flex-1 bg-border/70" />
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInputChange} />
          {!imageFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-border/70 bg-gradient-to-br from-background/60 to-primary/5 px-5 py-4 transition hover:border-primary/60 hover:from-primary/5 hover:to-primary/10"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105">
                <ImagePlus className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Search by image</span>
                  <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary sm:inline-flex">
                    <Sparkles className="mr-1 h-3 w-3" />AI-powered
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">Drag & drop, or click to upload — JPG, PNG, WEBP (max 5MB)</p>
              </div>
              <Button type="button" variant="outline" className="hidden shrink-0 rounded-xl sm:inline-flex"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <ImagePlus className="mr-2 h-4 w-4" />Choose file
              </Button>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-background/80 to-primary/5 p-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {imagePreview && (
                    <img src={imagePreview} alt="Uploaded preview" className="h-20 w-20 rounded-xl border border-border/60 object-cover shadow-sm" />
                  )}
                  {isImageSearching && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/20 backdrop-blur-[1px]">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {isImageSearching ? (
                    <>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />Analysing image with AI…
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Identifying brand, model and key specs</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />AI-detected product
                      </div>
                      <p className="mt-1 truncate text-sm font-medium">{imageFile.name}</p>
                    </>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setImageFile(null); }} disabled={isImageSearching}
                  aria-label="Remove image" className="shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
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




