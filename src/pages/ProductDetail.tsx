import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ExternalLink, ArrowLeft, MapPin, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { mockProductGroups } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = mockProductGroups.find((p) => p.id === id);

  if (!product) {
    return (
      <MainLayout>
        <div className="container px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/search">Back to Search</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const darazOffers = product.offers.filter((o) => o.platform === 'daraz');
  const temuOffers = product.offers.filter((o) => o.platform === 'temu');
  const sortedOffers = [...product.offers].sort((a, b) => a.price - b.price);
  const bestOffer = sortedOffers[0];
  const savingsPercent = product.highestPrice > product.lowestPrice
    ? Math.round(((product.highestPrice - product.lowestPrice) / product.highestPrice) * 100)
    : 0;

  return (
    <MainLayout>
      <div className="container px-2 sm:px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <Link
            to="/search"
            className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Back to Search Results
          </Link>
        </div>

        {/* Product Header */}
        <div className="grid gap-4 sm:gap-8 lg:grid-cols-2 mb-6 sm:mb-8">
          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-xl bg-secondary/50">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs sm:text-sm">{product.brand}</Badge>
              <Badge variant="secondary" className="text-xs sm:text-sm">{product.category}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 sm:gap-4 mb-4 text-xs sm:text-base">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-warning text-warning" />
                <span className="font-semibold">{product.averageRating}</span>
                <span className="text-muted-foreground">average rating</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{product.totalOffers} offers available</span>
            </div>

            {/* Price Summary */}
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Best Price</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      Rs. {product.lowestPrice.toLocaleString()}
                    </p>
                  </div>
                  {savingsPercent > 0 && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-success text-xs sm:text-base">
                        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-semibold">Save up to {savingsPercent}%</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground line-through">
                        Rs. {product.highestPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 sm:gap-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-daraz" />
                    <span className="text-xs sm:text-sm">{darazOffers.length} Daraz offers</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-temu" />
                    <span className="text-xs sm:text-sm">{temuOffers.length} Telemart offers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs sm:text-sm text-muted-foreground">{key}</p>
                      <p className="text-sm sm:text-base font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Offers Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Compare All Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Tabs defaultValue="all">
              <TabsList className="mb-4 h-8 sm:h-9">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All ({product.offers.length})</TabsTrigger>
                <TabsTrigger value="daraz" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-daraz" />
                  Daraz ({darazOffers.length})
                </TabsTrigger>
                <TabsTrigger value="temu" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-temu" />
                  Telemart ({temuOffers.length})
                </TabsTrigger>
              </TabsList>

              {['all', 'daraz', 'temu'].map((tab) => {
                const offers = tab === 'all' 
                  ? sortedOffers 
                  : tab === 'daraz' 
                    ? darazOffers 
                    : temuOffers;

                return (
                  <TabsContent key={tab} value={tab}>
                    <div className="rounded-lg border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px] sm:w-[300px] text-xs sm:text-sm">Seller</TableHead>
                            <TableHead className="text-xs sm:text-sm">Platform</TableHead>
                            <TableHead className="text-xs sm:text-sm">Rating</TableHead>
                            <TableHead className="text-xs sm:text-sm">Location</TableHead>
                            <TableHead className="text-xs sm:text-sm">Price</TableHead>
                            <TableHead className="text-right text-xs sm:text-sm">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {offers.map((offer, index) => (
                            <TableRow
                              key={offer.id}
                              className={cn(index === 0 && tab !== 'temu' && 'bg-success/5')}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <img
                                    src={offer.imageUrl}
                                    alt={offer.title}
                                    className="h-8 w-8 sm:h-12 sm:w-12 rounded object-cover"
                                  />
                                  <div>
                                    <p className="text-xs sm:text-sm font-medium line-clamp-1">{offer.seller}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                                      {offer.title}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] sm:text-xs",
                                    offer.platform === 'daraz'
                                      ? 'border-daraz text-daraz'
                                      : 'border-temu text-temu'
                                  )}
                                >
                                  {offer.platform === 'daraz' ? 'Daraz' : 'Telemart'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {offer.rating ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-warning text-warning" />
                                    <span className="text-xs sm:text-sm">{offer.rating}</span>
                                    {offer.reviewCount && (
                                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                                        ({offer.reviewCount})
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs sm:text-sm text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {offer.location ? (
                                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {offer.location}
                                  </div>
                                ) : (
                                  <span className="text-xs sm:text-sm text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm sm:text-base font-bold text-primary">
                                    Rs. {offer.price.toLocaleString()}
                                  </p>
                                  {offer.originalPrice && offer.originalPrice > offer.price && (
                                    <p className="text-[10px] sm:text-xs text-muted-foreground line-through">
                                      Rs. {offer.originalPrice.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm" asChild>
                                  <a
                                    href={offer.productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View
                                    <ExternalLink className="ml-1 h-3 w-3" />
                                  </a>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="mt-4 text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      Last updated: {format(new Date(offers[0]?.crawledAt || new Date()), 'PPp')}
                    </p>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

