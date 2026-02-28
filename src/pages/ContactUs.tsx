import { useState } from 'react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactUs() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: 'Message Sent', description: 'Thank you! We will get back to you shortly.' });
  };

  const contactInfo = [
    { icon: MapPin, title: 'Visit Us', lines: ['Plot 2626 Mohammed Isma St', 'Asokoro, Abuja FCT', 'Nigeria 900231'] },
    { icon: Mail, title: 'Email Us', lines: ['daunointegrated@gmail.com', 'infodauno@gmail.com'] },
    { icon: Phone, title: 'Call Us', lines: ['+234 911 741 3918', '+234 816 696 3176', '+234 909 478 3662'] },
    { icon: Clock, title: 'Working Hours', lines: ['Monday – Friday', '9:00 AM – 6:00 PM WAT'] },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[hsl(var(--navy))] py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">Send us a message and we will be happy to get you the information you need.</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-[hsl(var(--navy-light))]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => (
              <div key={info.title} className="text-center p-6">
                <info.icon className="h-8 w-8 text-[hsl(var(--gold))] mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">{info.title}</h3>
                {info.lines.map((line, i) => (
                  <p key={i} className="text-gray-400 text-sm">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
                  <p className="text-muted-foreground mb-6">We've received your message and will respond within 24-48 hours.</p>
                  <Button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} variant="outline">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Title of your request" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help..." />
                  </div>
                  <Button type="submit" className="w-full bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))] font-semibold gap-2">
                    <Send className="h-4 w-4" /> Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="h-[300px] bg-muted flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Plot 2626 Mohammed Isma St, Asokoro, Abuja FCT, Nigeria</p>
          <p className="text-sm text-muted-foreground mt-1">Map integration coming soon</p>
        </div>
      </section>
    </PublicLayout>
  );
}
