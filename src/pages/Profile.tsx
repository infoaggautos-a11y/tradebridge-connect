import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessById } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const business = user?.businessId ? getBusinessById(user.businessId) : null;

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>

        <Card>
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={user?.name || ''} readOnly /></div>
              <div><Label>Email</Label><Input value={user?.email || ''} readOnly /></div>
            </div>
            <div><Label>Role</Label><Badge className="ml-2 capitalize">{user?.role}</Badge></div>
          </CardContent>
        </Card>

        {business && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Business Profile</CardTitle>
                <Badge className="capitalize bg-gold/20 text-gold-dark">{business.verificationLevel}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Company Name</Label><Input value={business.name} readOnly /></div>
                  <div><Label>Country</Label><Input value={business.country} readOnly /></div>
                  <div><Label>Year Established</Label><Input value={business.yearEstablished.toString()} readOnly /></div>
                  <div><Label>Employees</Label><Input value={business.employees} readOnly /></div>
                </div>
                <div><Label>Description</Label><p className="text-sm text-muted-foreground mt-1">{business.description}</p></div>
                <div><Label>Products</Label><div className="flex flex-wrap gap-2 mt-1">{business.products.map(p => <Badge key={p} variant="outline">{p}</Badge>)}</div></div>
                <div><Label>Sectors</Label><div className="flex flex-wrap gap-2 mt-1">{business.sectors.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Completeness & Readiness</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><div className="flex justify-between text-sm mb-1"><span>Profile Completeness</span><span>{business.profileCompleteness}%</span></div><Progress value={business.profileCompleteness} className="h-3" /></div>
                <div><div className="flex justify-between text-sm mb-1"><span>Trade Readiness Score</span><span>{business.tradeReadinessScore}%</span></div><Progress value={business.tradeReadinessScore} className="h-3" /></div>
              </CardContent>
            </Card>
          </>
        )}

        <Button className="bg-gold text-navy hover:bg-gold-light" onClick={() => toast({ title: 'Coming Soon', description: 'Profile editing will be available soon.' })}>
          Edit Profile
        </Button>
      </div>
    </MemberLayout>
  );
}
