import { PublicLayout } from '@/layouts/PublicLayout';
import { Globe, Target, Eye, Users, Award, TrendingUp, Building2, Handshake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Year Founded', value: '2022', icon: Building2 },
  { label: 'Countries Served', value: '15+', icon: Globe },
  { label: 'Trade Partners', value: '200+', icon: Handshake },
  { label: 'Successful Deals', value: '500+', icon: TrendingUp },
];

const gallery = [
  { src: '/images/gallery/delegation-1.jpg', alt: 'DIL trade delegation event' },
  { src: '/images/gallery/keynote-treviso.jpg', alt: 'Keynote at Nigeria-Italy Agricultural Programme, Treviso Chamber of Commerce 2019' },
  { src: '/images/gallery/delegation-2.jpg', alt: 'DIL business delegation meeting' },
  { src: '/images/gallery/treviso-visit.jpg', alt: 'Nigerian delegation visit to the President of Treviso Province' },
  { src: '/images/gallery/group-photo.jpg', alt: 'Delegate group photograph at Nigeria-Italy Agricultural Promotion Programme' },
  { src: '/images/gallery/minister-meeting.jpg', alt: 'Nigeria and Italy strengthen ties in Innovation, Science, and Technology' },
];

export default function AboutUs() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative h-[420px] overflow-hidden">
        <img src="/images/about-hero.jpg" alt="DIL team at trade summit" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--navy))]/90 to-[hsl(var(--navy))]/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <p className="text-[hsl(var(--gold))] font-semibold tracking-wider uppercase text-sm mb-3">About Us</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white max-w-2xl leading-tight">About Dauno Integrated Ltd (DIL)</h1>
            <p className="mt-4 text-lg text-gray-300 max-w-xl">A transnational company driving Business Re-engineering, Trade Promotion, and international commerce facilitation across Africa and Europe.</p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[hsl(var(--navy-light))] py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-[hsl(var(--gold))] mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Who We Are</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Dauno Integrated Ltd (DIL) is a transnational company incorporated in <strong className="text-foreground">Abuja, Nigeria</strong> with Registration Number <strong className="text-foreground">1963419</strong>. Registered on 16th August 2022 with a special focus on Business Re-engineering, our forte and capability are in Business and Trade Promotion.
                </p>
                <p>
                  DIL amongst other services, provides relevant trade support and consistent business facilitation for its retinue of ever-growing clientele both in Nigeria and abroad. Our array of impacts resonates reflectively in our client services and partnerships.
                </p>
                <p>
                  We connect our clients with the best quality products that the market has to offer and we strive to ensure satisfaction through a well-detailed and curated customer delivery service.
                </p>
              </div>
              <div className="mt-8">
                <Link to="/contact">
                  <Button className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))] font-semibold">
                    Get In Touch
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-8">
              <Card className="border-l-4 border-l-[hsl(var(--gold))]">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Eye className="h-8 w-8 text-[hsl(var(--gold))] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Our Vision</h3>
                      <p className="text-muted-foreground">To constantly seek new ways of effervescent growth for our clientele in order to build on the varying layers we have earmarked for perpetual and mutual benefits, and as a way to further share our dreams and goals.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-[hsl(var(--gold))]">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Target className="h-8 w-8 text-[hsl(var(--gold))] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Our Mission</h3>
                      <p className="text-muted-foreground">To diligently and constantly introduce high quality and reliable products and services to the international markets with specific thrust on re-engineering the export market with our diverse range of customer base.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 bg-[hsl(var(--navy))]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[hsl(var(--gold))] font-semibold tracking-wider uppercase text-sm mb-4">Our Philosophy</p>
          <blockquote className="text-2xl md:text-3xl font-light text-white max-w-3xl mx-auto italic leading-relaxed">
            "We connect our clients with the best quality products that the market has to offer and we strive to make sure they are satisfied through a well-detailed and curated customer delivery service."
          </blockquote>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[hsl(var(--gold))] font-semibold tracking-wider uppercase text-sm mb-2">Gallery</p>
            <h2 className="text-3xl font-bold text-foreground">Our Impact In Action</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Highlights from our trade delegations, business missions, and international partnerships.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((img, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl aspect-[4/3]">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">{img.alt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--navy-light))]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Expand Your Global Footprint?</h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">Join hundreds of businesses leveraging DIL's network to access international markets.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/contact">
              <Button size="lg" className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))] font-semibold">
                Contact Us
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-[hsl(var(--gold))] text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--navy))]">
                Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
