import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const SignupSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const email = searchParams.get('email');
  const role = searchParams.get('role');
  
  useEffect(() => {
    const handleAuthRedirect = async () => {
      setIsConfirming(true);
      
      try {
        // 1. Check Hash Params (Implicit Flow / Old Supabase)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // 2. Check Search Params (PKCE Flow / New Supabase)
        const code = searchParams.get('code');
        const type = searchParams.get('type');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ 
            access_token: accessToken, 
            refresh_token: refreshToken 
          });
          if (error) throw error;
          setConfirmationStatus('success');
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setConfirmationStatus('success');
        } else {
          // Check if session already exists (e.g. user clicked link and is already logged in)
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setConfirmationStatus('success');
          } else if (type === 'signup' || type === 'invite') {
             setConfirmationStatus('pending');
          }
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setConfirmationStatus('error');
        toast({ variant: 'destructive', title: 'Verification failed', description: err.message });
      } finally {
        setIsConfirming(false);
      }
    };

    handleAuthRedirect();
  }, [searchParams, toast]);

  // Once confirmed, redirect based on user role
  useEffect(() => {
    if (confirmationStatus === 'success') {
      const redirect = async () => {
        try {
          await refreshProfile();
          
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
            const userRole = profile?.role?.toLowerCase() || role?.toLowerCase() || 'traveller';
            
            if (userRole === 'guide') {
              // Check if they already have an application
              const { data: app } = await supabase.from('guide_applications').select('status').eq('user_id', user.id).maybeSingle();
              if (!app) navigate('/guide/kyc');
              else if (app.status === 'pending') navigate('/guide/pending');
              else navigate('/guide/dashboard');
            } else if (userRole === 'admin' || user.email === 'paudelnishant15@gmail.com') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          } else {
            navigate('/auth');
          }
        } catch (err) {
          console.error('Redirect error:', err);
          navigate('/');
        }
      };
      
      // Small delay to ensure session is fully propagated
      const timer = setTimeout(redirect, 500);
      return () => clearTimeout(timer);
    }
  }, [confirmationStatus, navigate, refreshProfile, role]);

  const handleContinue = () => navigate('/');

  if (isConfirming) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f7]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0071e3] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold font-serif text-slate-900">Verifying your security...</h2>
          <p className="text-slate-500 mt-2">Establishing a secure connection to GoNepal</p>
        </div>
      </div>
    );
  }

  if (confirmationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f7]">
        <div className="text-center text-[#34c759]">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <CheckCircle className="w-24 h-24 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-4xl font-black font-serif tracking-tight text-slate-900">Identity Confirmed</h2>
          <p className="text-slate-500 mt-3 font-medium">Your account is now secure. Redirecting to your workspace...</p>
        </div>
      </div>
    );
  }

  if (confirmationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f7]">
        <div className="text-center text-red-500 max-w-sm">
          <AlertCircle className="w-20 h-20 mx-auto mb-6" />
          <h2 className="text-3xl font-black font-serif text-slate-900">Verification Link Expired</h2>
          <p className="text-slate-500 mt-3 mb-8">The security token has expired or has already been used.</p>
          <Button onClick={() => navigate('/auth')} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold">Return to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-6">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 text-center border border-white">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-slate-50 text-[#0071e3]`}>
          <Mail className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-bold text-slate-900 mb-4 font-serif leading-tight">Secure Your Account</h2>
        <p className="text-slate-500 mb-10 font-medium leading-relaxed">
          We've sent a high-security verification link to your email. Click the link to activate your GoNepal ID.
        </p>
        
        {email && (
          <div className="bg-slate-50 py-4 px-6 rounded-2xl text-slate-900 font-bold mb-10 text-sm border border-slate-100 tracking-tight">
            {email}
          </div>
        )}

        <div className="space-y-4">
          <Button onClick={handleContinue} className="w-full h-16 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]">
            Wait for Email Link
          </Button>
          <Button variant="ghost" onClick={() => navigate('/auth')} className="w-full h-12 text-slate-400 font-bold hover:text-slate-600 transition-colors">
            Back to Login
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupSuccess;
