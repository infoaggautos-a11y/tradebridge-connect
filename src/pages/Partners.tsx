import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Handshake } from 'lucide-react';

const partners = [
  { name: 'Build Africa', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/06/Build_Africa.jpg' },
  { name: 'Italian-Nigerian Business Association', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/06/NEW_IMAGE-1024x718.jpg' },
  { name: 'INGITA', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/06/logoingita.jpg' },
  { name: 'Daarhoda', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/06/daarhoda_logo_copy.png' },
  { name: 'NBTI', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/06/NBTI.png' },
  { name: 'Nigeria Customs Service', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/06/CUSTOM.png' },
  { name: 'NEPZA', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/06/5_NEPZA.jpg' },
  { name: 'NAFDAC', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/06/8_NAFDAC.png' },
  { name: 'Nigeria Plant Quarantine Service', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/06/4_QUARANTINE.jpg' },
  { name: 'NACCIMA', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/08/IMG-20230831-WA0042.jpg' },
  { name: 'Confindustria Reggio Calabria', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/08/confindustria-reggio-calabria-logo.png' },
  { name: 'Federal Ministry of Industry, Trade and Investment', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/08/FMITI-logo-1024x286.png' },
  { name: 'European Union', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/08/eu_flag-150x150.jpg' },
  { name: 'Ministry of Foreign Affairs', logo: 'https://www.daunointegrated.com/wp-content/uploads/2023/08/cropped-mfaLogo-min-1-150x150.png' },
];

const categories = [
  { title: 'Government Agencies', description: 'Working with Nigerian and international government bodies to facilitate trade policy and compliance.' },
  { title: 'Trade Associations', description: 'Partnering with leading trade and industry associations across Africa and Europe.' },
  { title: 'International Organizations', description: 'Collaborating with multilateral organizations to drive economic development.' },
];

export default function PartnersPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[hsl(var(--navy))] py-20">
        <div className="container mx-auto px-4 text-center">
          <Handshake className="h-12 w-12 text-[hsl(var(--gold))] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Partners</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">We collaborate with leading institutions, government agencies, and trade organizations across Nigeria, Italy, and the wider international community.</p>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-12 bg-[hsl(var(--navy-light))]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.title} className="text-center p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{cat.title}</h3>
                <p className="text-gray-400 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="bg-white rounded-xl p-6 flex items-center justify-center aspect-square border border-border hover:shadow-lg transition-shadow group"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                  title={partner.name}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[hsl(var(--navy))]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Become a Partner</h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">Join our growing network of trade partners and institutions driving international commerce.</p>
          <Link to="/contact">
            <Button size="lg" className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))] font-semibold">
              Partner With Us
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
