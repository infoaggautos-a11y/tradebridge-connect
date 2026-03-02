import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      toast({ title: 'Login Failed', description: result.error, variant: 'destructive' });
    } else {
      navigate('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const result = await signup(regEmail, regPassword, regName);
    setLoading(false);
    if (result.error) {
      toast({ title: 'Registration Failed', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Check Your Email', description: 'We sent you a verification link. Please verify your email to continue.' });
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-secondary">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Globe className="h-10 w-10 text-gold mx-auto mb-2" />
            <CardTitle className="text-2xl">DIL Global Trade Platform</CardTitle>
            <CardDescription>Access the trade ecosystem</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required /></div>
                  <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></div>
                  <Button type="submit" className="w-full bg-gold text-navy hover:bg-gold-light font-semibold" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Sign In
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div><Label>Full Name</Label><Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="John Doe" required /></div>
                  <div><Label>Email</Label><Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@company.com" required /></div>
                  <div><Label>Password</Label><Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min 6 characters" required /></div>
                  <Button type="submit" className="w-full bg-gold text-navy hover:bg-gold-light font-semibold" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
