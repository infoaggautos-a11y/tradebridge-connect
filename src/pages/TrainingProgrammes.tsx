import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Globe, Wrench, Cpu, Tractor, Scissors, Flame, Droplets, CheckCircle, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

const programmes = [
  { title: 'Builders / Bricking Layers', description: 'Build your future in the construction industry with our specialized bricking programs and hands-on masonry training.', icon: Wrench },
  { title: 'Software Development & Engineering (ICT)', description: 'Unlock your potential in software development and engineering with modern tech stack training.', icon: Cpu },
  { title: 'Mechanized Farming', description: 'Learn modern mechanized farming techniques for efficient and sustainable agriculture.', icon: Tractor },
  { title: 'Tailoring', description: 'Master the art of tailoring from industry experts with internationally recognized techniques.', icon: Scissors },
  { title: 'Industrial Welding', description: 'Gain the skills needed to excel in industrial welding techniques with certified training.', icon: Flame },
  { title: 'Plumbing & Electrical Systems', description: 'Learn the essentials of plumbing and electrical systems in our hands-on laboratory environment.', icon: Droplets },
];

const whyUs = [
  { title: 'International Standards', description: 'High-quality training programs designed with global standards in mind.' },
  { title: 'Modern Training Resources', description: 'Access to modern equipment and learning environments for practical training.' },
  { title: 'Inclusive Community', description: 'Join a supportive community of learners, including women, youth, and professionals.' },
  { title: 'Empowerment for Success', description: 'Programs focused on long-term socio-economic development and community empowerment.' },
  { title: 'Commitment to Sustainability', description: 'Programs designed to foster long-term sustainability and community development.' },
  { title: 'Support for Self-Reliance', description: 'Our programs foster independence and provide guidance for successful reintegration.' },
];

export default function TrainingProgrammes() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[hsl(var(--navy))] to-[hsl(var(--navy-dark))] py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30 mb-4">
            <GraduationCap className="h-3 w-3 mr-1" /> DIL Professional Training
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">DIL Professional Training Programmes</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg mb-8">
            Discover your perfect route to studying at a top International Training Center (ITC) overseas. Building pathways from displacement to empowerment through global partnerships and certified skill acquisition.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://dilptp.com/index.php/how-to-apply/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))] font-semibold gap-2">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-[hsl(var(--gold))]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[hsl(var(--gold))]">01</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">Easy Application Process</h3>
                <p className="text-sm text-muted-foreground">Our streamlined application process makes it simple to start your journey abroad. We handle the paperwork, so you can focus on your future.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-[hsl(var(--gold))]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[hsl(var(--gold))]">02</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">Admission Support & Consultancy</h3>
                <p className="text-sm text-muted-foreground">We provide expert guidance and consultancy services for admission processes, ensuring a smooth transition to your new learning environment.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-[hsl(var(--gold))]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[hsl(var(--gold))]">03</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">Global Career Opportunities</h3>
                <p className="text-sm text-muted-foreground">Our programs open doors to exciting career opportunities around the world, giving you a competitive edge in today's global market.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[hsl(var(--gold))] font-semibold tracking-wider uppercase text-sm mb-2">Our Programmes</p>
            <h2 className="text-3xl font-bold text-foreground mb-3">Diverse Programs for a Successful Future</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From building trades to cutting-edge technology and modern farming, we offer diverse opportunities for growth and success.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map((prog) => (
              <Card key={prog.title} className="group hover:shadow-lg transition-shadow hover:border-[hsl(var(--gold))]/50">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 bg-[hsl(var(--gold))]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--gold))]/20 transition-colors">
                    <prog.icon className="h-6 w-6 text-[hsl(var(--gold))]" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{prog.title}</h3>
                  <p className="text-sm text-muted-foreground">{prog.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[hsl(var(--gold))] font-semibold tracking-wider uppercase text-sm mb-2">Why Choose Us</p>
            <h2 className="text-3xl font-bold text-foreground">Your Gateway to Success</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4">
                <CheckCircle className="h-5 w-5 text-[hsl(var(--gold))] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[hsl(var(--navy))]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Launch Your Global Career with Hands-On Training Abroad!</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Gain hands-on experience, acquire valuable skills, and receive internationally recognized certifications that open doors worldwide.</p>
          <div className="flex gap-4 justify-center flex-wrap mb-10">
            <a href="https://dilptp.com/index.php/how-to-apply/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))] font-semibold gap-2">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href="https://dilptp.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-[hsl(var(--gold))] text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--navy))]">
                Visit DILPTP Website
              </Button>
            </a>
          </div>
          <div className="flex flex-wrap gap-8 justify-center text-gray-400 text-sm">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[hsl(var(--gold))]" /> Comune di Attigliano, Provincia di Terni, Italy</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[hsl(var(--gold))]" /> +234 909 478 3662</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[hsl(var(--gold))]" /> nibanigeria@gmail.com</div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
