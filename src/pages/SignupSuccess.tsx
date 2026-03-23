import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SignupSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const email = searchParams.get('email');
  const role = searchParams.get('role');
  const isGuideSignup = role === 'guide';

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const emailParam = searchParams.get('email');

    if (accessToken && refreshToken) {
      handleConfirmation(accessToken, refreshToken);
    } else if (token && type) {
      handleOldConfirmation(token, type, emailParam);
    }
  }, [searchParams]);

  const handleConfirmation = async (accessToken: string, refreshToken: string) => {
    setIsConfirming(true);
    try {
      const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error) {
        setConfirmationStatus('error');
        toast({ variant: 'destructive', title: 'Confirmation failed', description: error.message });
      } else {
        setConfirmationStatus('success');
        toast({ title: 'Email confirmed!', description: 'Your account has been successfully verified.' });
        setTimeout(() => navigate(isGuideSignup ? '/guide/kyc' : '/'), 2000);
      }
    } catch (err) {
      setConfirmationStatus('error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOldConfirmation = async (token: string, type: string, emailParam?: string | null) => {
    setIsConfirming(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ token, type: type as any, email: emailParam || undefined });
      if (error) {
        setConfirmationStatus('error');
        toast({ variant: 'destructive', title: 'Confirmation failed', description: error.message });
      } else {
        setConfirmationStatus('success');
        toast({ title: 'Email confirmed!', description: 'Your account has been successfully verified.' });
        setTimeout(() => navigate(isGuideSignup ? '/guide/kyc' : '/'), 2000);
      }
    } catch (err) {
      setConfirmationStatus('error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleContinue = () => navigate(isGuideSignup ? '/guide/kyc' : '/');

  if (isConfirming) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="text-center"><Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" /><h2 className="text-2xl font-bold">Verifying email...</h2></div>
      </div>
    );
  }

  if (confirmationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="text-center text-green-600"><CheckCircle className="w-16 h-16 mx-auto mb-4" /><h2 className="text-3xl font-black">Verified!</h2><p className="text-slate-500 mt-2">Taking you to {(isGuideSignup ? 'Guide KYC' : 'Home')}...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isGuideSignup ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
          <Mail className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">{isGuideSignup ? 'Almost a Guide!' : 'Check Your Email'}</h2>
        <p className="text-slate-500 mb-6 font-medium">
          {isGuideSignup 
            ? "We've sent a verification link to your email. You must verify your account to start your guide KYC process." 
            : "We've sent a verification link to your email address."}
        </p>
        {email && <p className="bg-slate-50 py-2 px-4 rounded-xl text-slate-900 border border-slate-100 font-bold mb-6">{email}</p>}
        <div className="space-y-4">
          <Button onClick={handleContinue} className="w-full py-6 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg"><ArrowRight className="w-5 h-5 mr-2" /> Continue to {(isGuideSignup ? 'Guide KYC' : 'Home')}</Button>
          <Button variant="ghost" onClick={() => navigate('/auth')} className="w-full text-slate-400">Back to Login</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupSuccess;
