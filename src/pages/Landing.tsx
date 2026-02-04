import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/layout';
import { Search, TrendingUp, Shield, Zap, ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import { mockProductGroups, categories } from '@/data/mockData';

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const featuredProducts = mockProductGroups.slice(0, 4);

  return (
    <MainLayout showSearch={false}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20 py-20 md:py-32">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Compare prices across Daraz & OLX
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Find the Best Deals,{' '}
              <span className="text-primary">Save More</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Search once, compare prices across multiple platforms. Make smart purchasing decisions with real-time price comparisons from Daraz and OLX.
            </p>
            <form onSubmit={handleSearch} className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for products... (e.g., iPhone 13, MacBook Pro)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 pr-32 text-lg rounded-full border-2 border-primary/20 focus:border-primary"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                >
                  Search
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {['iPhone 15', 'Samsung S24', 'MacBook', 'AirPods'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {/* Background decorations */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Choose PriceScout?</h2>
            <p className="text-muted-foreground">Compare, analyze, and save on every purchase</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Price Comparison</h3>
                <p className="text-muted-foreground">
                  Compare prices from multiple sellers across Daraz and OLX in one view. Find the best deals instantly.
                </p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Real-time Updates</h3>
                <p className="text-muted-foreground">
                  Our crawlers continuously scan platforms to bring you the latest prices and newest listings.
                </p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Trusted Sellers</h3>
                <p className="text-muted-foreground">
                  View seller ratings and reviews to make informed decisions. Buy with confidence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="border-y bg-secondary/30 py-16">
        <div className="container px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">Browse Categories</h2>
            <p className="text-muted-foreground">Find products in your favorite categories</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="lg"
                className="rounded-full bg-card hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate(`/search?category=${encodeURIComponent(category)}`)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground">Popular items with the best deals</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/search">View All</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="aspect-square overflow-hidden bg-secondary/50">
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {product.brand}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {product.totalOffers} offers
                      </Badge>
                    </div>
                    <h3 className="mb-2 font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{product.averageRating}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">
                        Rs. {product.lowestPrice.toLocaleString()}
                      </span>
                      {product.lowestPrice !== product.highestPrice && (
                        <span className="text-sm text-muted-foreground">
                          - {product.highestPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Saving?</h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of smart shoppers who use PriceScout to find the best deals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/search">Start Searching</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Search className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">
                Price<span className="text-primary">Scout</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PriceScout. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </MainLayout>
  );
}
