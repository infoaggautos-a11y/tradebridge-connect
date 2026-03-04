import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast({ title: 'Error', description: 'Invalid verification link', variant: 'destructive' });
      navigate('/login');
      return;
    }

    verifyEmail(token).then((result) => {
      setVerifying(false);
      if (result.error) {
        toast({ title: 'Verification Failed', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Email Verified!', description: 'Please login with your credentials.' });
        navigate('/login?verified=true');
      }
    });
  }, [searchParams, verifyEmail, navigate, toast]);

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verifying Email</CardTitle>
            <CardDescription>
              {verifying ? 'Please wait while we verify your email...' : 'Verification complete!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {verifying && <Loader2 className="h-8 w-8 animate-spin" />}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
