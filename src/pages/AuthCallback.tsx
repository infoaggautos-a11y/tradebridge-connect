import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        navigate('/dashboard', { replace: true });
      }
    });
    
    // Fallback redirect after 5s
    const timeout = setTimeout(() => navigate('/login', { replace: true }), 5000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[hsl(var(--gold))]" />
        <p className="text-muted-foreground">Verifying your account...</p>
      </div>
    </div>
  );
}
