import { useState, useEffect } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('business_registrations').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) setBusiness(data);
    });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in all password fields', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>

        <Card>
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={user?.email || ''} readOnly className="bg-muted" /></div>
            </div>
            <div className="flex items-center gap-3">
              <Label>Role</Label><Badge className="capitalize">{user?.role}</Badge>
              <Label className="ml-4">Plan</Label><Badge className="capitalize bg-[hsl(var(--gold))]/20">{user?.membershipTier}</Badge>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:opacity-90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="relative">
                <Label>New Password</Label>
                <Input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-2 top-7">
                  {showNewPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
              <div className="relative">
                <Label>Confirm New Password</Label>
                <Input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-7">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <Button onClick={handleChangePassword} disabled={changingPassword} className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:opacity-90">
              {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Change Password
            </Button>
          </CardContent>
        </Card>

        {business && (
          <Card>
            <CardHeader><CardTitle>Business Registration</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><Label className="text-muted-foreground">Company</Label><p className="font-medium">{business.company_name}</p></div>
                <div><Label className="text-muted-foreground">Country</Label><p className="font-medium">{business.country}</p></div>
                <div><Label className="text-muted-foreground">Sector</Label><p className="font-medium">{business.sector || 'N/A'}</p></div>
                <div><Label className="text-muted-foreground">Contact</Label><p className="font-medium">{business.contact_person}</p></div>
              </div>
              {business.products_services && (
                <div><Label className="text-muted-foreground">Products/Services</Label><p className="text-sm">{business.products_services}</p></div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MemberLayout>
  );
}
