import { useState } from 'react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Loader2, CheckCircle, Globe, MapPin, Mail, Phone, Briefcase } from 'lucide-react';

const SECTORS = [
  'Agriculture & Food', 'Textiles & Fashion', 'Manufacturing', 'Technology',
  'Energy & Mining', 'Construction & Real Estate', 'Healthcare & Pharma',
  'Financial Services', 'Logistics & Transport', 'Herbs & Spices',
  'Food Processing', 'Plastics & Rubber', 'Environmental Services', 'Other',
];

const COMPANY_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '500+ employees',
];

const COUNTRIES = [
  'Italy', 'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Tanzania',
  'Uganda', 'Senegal', 'Cameroon', 'Ivory Coast', 'Morocco', 'Egypt', 'Guinea-Bissau', 'Other',
];

export default function BusinessRegistration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; temporary_password: string } | null>(null);

  const [form, setForm] = useState({
    company_name: '', contact_person: '', email: '', phone: '',
    country: 'Italy', city: '', address: '', website: '', sector: '',
    products_services: '', export_markets: '', import_interests: '',
    company_size: '', annual_revenue: '', registration_number: '', additional_notes: '',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_person || !form.email) {
      toast({ title: 'Required Fields', description: 'Please fill in company name, contact person, and email.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-business', { body: form });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.existing_account) {
        toast({ title: 'Registration Saved', description: data.message });
      } else {
        setCredentials(data.credentials);
      }
      setSuccess(true);
    } catch (err: any) {
      toast({ title: 'Registration Failed', description: err.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-secondary">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Registration Successful!</CardTitle>
              <CardDescription className="text-base mt-2">
                Your business has been registered on the DIL Trade Bridge platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {credentials && (
                <div className="bg-muted rounded-lg p-6 text-left space-y-3">
                  <p className="font-semibold text-foreground">Your Login Credentials:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="font-mono text-sm font-semibold">{credentials.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">🔑 Password:</span>
                      <span className="font-mono text-sm font-semibold bg-accent/20 px-2 py-1 rounded">{credentials.temporary_password}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    ⚠️ Please save these credentials. You can change your password after logging in.
                  </p>
                </div>
              )}
              <Button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Business Registration</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Register your business on the DIL Trade Bridge platform. We'll create your account automatically so you can start connecting with trade partners immediately.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-accent" /> Company Information</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Company Name <span className="text-destructive">*</span></Label>
                <Input value={form.company_name} onChange={e => update('company_name', e.target.value)} placeholder="e.g. Acme Trading Ltd" required />
              </div>
              <div>
                <Label>Registration / RC Number</Label>
                <Input value={form.registration_number} onChange={e => update('registration_number', e.target.value)} placeholder="e.g. RC-123456" />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://www.example.com" />
              </div>
              <div>
                <Label>Sector / Industry</Label>
                <Select value={form.sector} onValueChange={v => update('sector', v)}>
                  <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                  <SelectContent>
                    {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Company Size</Label>
                <Select value={form.company_size} onValueChange={v => update('company_size', v)}>
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Annual Revenue (USD)</Label>
                <Input value={form.annual_revenue} onChange={e => update('annual_revenue', e.target.value)} placeholder="e.g. $500,000" />
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-accent" /> Contact Details</CardTitle>
              <CardDescription>Your login credentials will be sent to this email</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contact Person <span className="text-destructive">*</span></Label>
                <Input value={form.contact_person} onChange={e => update('contact_person', e.target.value)} placeholder="Full name" required />
              </div>
              <div>
                <Label>Email Address <span className="text-destructive">*</span></Label>
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@company.com" required />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+234 800 000 0000" />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-accent" /> Location</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Select value={form.country} onValueChange={v => update('country', v)}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="e.g. Milan, Lagos" />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Full business address" />
              </div>
            </CardContent>
          </Card>

          {/* Trade Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-accent" /> Trade Information</CardTitle>
              <CardDescription>Help us match you with the right partners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Products & Services</Label>
                <Textarea value={form.products_services} onChange={e => update('products_services', e.target.value)} placeholder="Describe your main products or services (e.g. Cocoa beans, Cashew nuts, Sesame seeds)" rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Export Markets</Label>
                  <Input value={form.export_markets} onChange={e => update('export_markets', e.target.value)} placeholder="e.g. Europe, Asia, North America" />
                </div>
                <div>
                  <Label>Import Interests</Label>
                  <Input value={form.import_interests} onChange={e => update('import_interests', e.target.value)} placeholder="e.g. Machinery, Technology, Raw materials" />
                </div>
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea value={form.additional_notes} onChange={e => update('additional_notes', e.target.value)} placeholder="Anything else you'd like us to know about your business" rows={3} />
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button type="submit" size="lg" className="w-full md:w-auto px-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-lg" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Briefcase className="h-5 w-5 mr-2" />}
              Register Your Business
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              By registering, you agree to our terms and your account will be created automatically.
            </p>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
