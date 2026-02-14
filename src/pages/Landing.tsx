import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/layout';
import { Search, ArrowRight, Star, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import { mockProductGroups, categories } from '@/data/mockData';

const heroImage =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=80';

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
      <section className="container px-4 py-10 md:py-14">
        <div className="overflow-hidden rounded-[2rem] border border-border/70 shadow-xl">
          <div
            className="relative min-h-[560px] bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/10" />
            <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-between px-6 py-10 md:px-12 md:py-14">
              <div className="max-w-2xl text-white">
                <Badge className="mb-4 border-white/40 bg-white/10 text-white">Best Deal Finder</Badge>
                <h1 className="mb-4 text-4xl font-semibold leading-tight md:text-6xl">
                  Explore Top Deals
                  <br />
                  Across Top Stores
                </h1>
                <p className="max-w-xl text-base text-white/85 md:text-lg">
                  Compare Daraz and Telemart offers in one view, track prices, and buy from the most trusted listings.
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="grid gap-3 rounded-2xl border border-white/30 bg-white/15 p-3 backdrop-blur md:grid-cols-[1fr_auto]"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/75" />
                  <Input
                    type="search"
                    placeholder="Search for phones, laptops, headphones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 border-white/25 bg-white/90 pl-11 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button type="submit" className="h-12 rounded-xl bg-primary px-8 text-primary-foreground hover:bg-primary/90">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: TrendingUp, title: 'Live price comparison', text: 'Compare offers instantly from multiple sources.' },
            { icon: ShieldCheck, title: 'Reliable sellers', text: 'Review ratings before placing your order.' },
            { icon: Zap, title: 'Fast discovery', text: 'Search once and find the best value quickly.' },
          ].map((item) => (
            <Card key={item.title} className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="p-6">
                <item.icon className="mb-3 h-6 w-6 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Browse Categories</h2>
          <Button variant="outline" className="rounded-full border-primary/35" asChild>
            <Link to="/compare">Open Compare</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="rounded-full border-border bg-card hover:border-primary/45 hover:bg-primary/10"
              onClick={() => navigate(`/search?category=${encodeURIComponent(category)}`)}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      <section className="container px-4 pb-16">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <Button className="rounded-full bg-primary hover:bg-primary/90" asChild>
            <Link to="/search">View all</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <Card className="group overflow-hidden border-border/80 bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-square overflow-hidden bg-secondary/60">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-medium">{product.name}</h3>
                  <div className="mb-2 flex items-center gap-1 text-sm text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    {product.averageRating}
                  </div>
                  <p className="text-lg font-bold text-primary">Rs. {product.lowestPrice.toLocaleString()}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
