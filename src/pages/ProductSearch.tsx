import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, GitCompare, ImagePlus, X, Sparkles } from 'lucide-react';
// import { ProductCard } from '@/components/ProductCard';
import { VariantCard } from '@/components/VariantCard';
import { SearchSuggestInput } from '@/components/SearchSuggestInput';
import { searchProducts, searchProductsByImage } from '@/services/productService';
import { SearchResults } from '@/types/product';
import { MainLayout } from '@/components/layout';
import { toast } from 'sonner';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageResults, setImageResults] = useState<SearchResults | null>(null);
  const [isImageSearching, setIsImageSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const { data: textData, isLoading, error } = useQuery<SearchResults>({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      const result = await searchProducts(searchQuery);
      return result;
    },
    enabled: !!searchQuery,
  });

  const data = imageResults ?? textData;

  const handleSearch = (term?: string) => {
    const next = (term ?? query).trim();
    if (next) {
      setImageResults(null);
      setImageFile(null);
      setSearchQuery(next);
    }
  };

  const handleImagePicked = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }

    setImageFile(file);
    setSearchQuery('');
    setImageResults(null);
    setIsImageSearching(true);
    try {
      const result = await searchProductsByImage(file);
      setImageResults(result);
      if (result?.derivedQuery) {
        setQuery(result.derivedQuery);
        toast.success(`Searched as: ${result.derivedQuery}`);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error)?.message ||
        'Image search failed.';
      toast.error(message);
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

  const clearImage = () => {
    setImageFile(null);
    setImageResults(null);
  };

  const showLoader = isLoading || isImageSearching;

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
              Search by text or upload an image — we'll find matches on Daraz and Telemart
            </p>
          </div>

          <div className="mx-auto flex max-w-4xl flex-col gap-3 md:flex-row">
            <SearchSuggestInput
              value={query}
              onChange={setQuery}
              onSubmit={(term) => handleSearch(term)}
              placeholder="Search for products (e.g., iPhone 13, Samsung TV, Laptop)..."
              showLeftIcon={false}
              className="h-12 text-base md:text-lg"
            />
            <Button
              onClick={() => handleSearch()}
              disabled={showLoader}
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

          {/* Divider */}
          <div className="mx-auto my-5 flex max-w-4xl items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border/70" />
            <span>or search visually</span>
            <div className="h-px flex-1 bg-border/70" />
          </div>

          {/* Image search */}
          <div className="mx-auto max-w-4xl">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileInputChange}
            />
            {!imageFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed border-border/70 bg-gradient-to-br from-background/60 to-primary/5 px-5 py-4 transition hover:border-primary/60 hover:from-primary/5 hover:to-primary/10 hover:shadow-md"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105 group-hover:bg-primary/15">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Search by image</span>
                    <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary sm:inline-flex">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI-powered
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Drag &amp; drop, or click to upload — JPG, PNG, WEBP (max 5MB)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="hidden shrink-0 rounded-xl sm:inline-flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Choose file
                </Button>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-background/80 to-primary/5 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Uploaded preview"
                        className="h-20 w-20 rounded-xl border border-border/60 object-cover shadow-sm"
                      />
                    )}
                    {isImageSearching && (
                      <>
                        <div className="absolute inset-0 rounded-xl bg-primary/20 backdrop-blur-[1px]" />
                        <div className="absolute inset-x-0 top-0 h-full overflow-hidden rounded-xl">
                          <div className="absolute left-0 right-0 h-0.5 animate-scan bg-gradient-to-r from-transparent via-primary to-transparent" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {isImageSearching ? (
                      <>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          Analysing image with AI…
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Identifying brand, model and key specs
                        </p>
                      </>
                    ) : imageResults?.derivedQuery ? (
                      <>
                        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          AI-detected product
                        </div>
                        <div className="mt-1 inline-flex max-w-full items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
                          <span className="truncate font-semibold text-primary">
                            {imageResults.derivedQuery}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          Not quite right? Edit the search box above and hit Search.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="truncate text-sm font-medium text-foreground">
                          {imageFile.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {(imageFile.size / 1024).toFixed(0)} KB
                        </p>
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearImage}
                    disabled={isImageSearching}
                    aria-label="Remove image"
                    className="shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
                  Found <span className="font-semibold text-primary">{data.total}</span> products for "{data.query}"
                </p>
              </div>
            </div>

            {/* Compare Variants */}
            {data.variantGroups && data.variantGroups.length > 0 ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GitCompare className="h-4 w-4" />
                    <span>
                      <span className="font-semibold text-foreground">{data.variantGroups.length}</span> variant{data.variantGroups.length > 1 ? 's' : ''} found — same product, different sellers &amp; prices
                    </span>
                  </div>
                </div>
                <div className="grid gap-5">
                  {data.variantGroups.map((variant) => (
                    <VariantCard
                      key={variant.variantKey}
                      variant={variant}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No variant groups found. Try searching for a specific phone model.
              </p>
            )}

            {/* Side-by-Side tab — commented out
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
            */}

            {/* Best Deals tab — commented out
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
            */}
          </div>
        )}

        {/* Loading State */}
        {showLoader && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {isImageSearching ? 'Analysing image and searching…' : 'Searching across stores…'}
            </h3>
            <p className="text-sm text-muted-foreground">Comparing prices on Daraz and Telemart</p>
          </div>
        )}

        {/* Empty State */}
        {!data && !showLoader && (
          <div className="text-center py-16">
            <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">Start Your Search</h3>
            <p className="text-muted-foreground">Enter a product name or upload an image above to compare prices</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};


