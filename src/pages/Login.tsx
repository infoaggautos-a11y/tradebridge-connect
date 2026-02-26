import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import type { UserRole } from '@/data/mockData';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('member');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, role);
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    login(regEmail, regPassword, regRole);
    navigate(regRole === 'admin' ? '/admin' : '/dashboard');
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
            <div className="mb-4 p-3 bg-muted rounded-md text-xs text-muted-foreground">
              <strong>Demo accounts:</strong><br />
              Member: member@dil.com | Admin: admin@dil.com<br />
              Any password works.
            </div>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@dil.com" required /></div>
                  <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></div>
                  <div>
                    <Label>Login as</Label>
                    <Select value={role} onValueChange={v => setRole(v as UserRole)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Business Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-gold text-navy hover:bg-gold-light font-semibold">Sign In</Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div><Label>Email</Label><Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@company.com" required /></div>
                  <div><Label>Password</Label><Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" required /></div>
                  <div>
                    <Label>Account Type</Label>
                    <Select value={regRole} onValueChange={v => setRegRole(v as UserRole)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Business Member</SelectItem>
                        <SelectItem value="admin">Admin (DIL Team)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-gold text-navy hover:bg-gold-light font-semibold">Create Account</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
