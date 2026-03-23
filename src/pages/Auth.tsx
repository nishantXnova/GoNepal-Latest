import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getSafeErrorMessage } from '@/utils/errorUtils';

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Valid email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'Full name is required' }),
  email: z.string().trim().email({ message: 'Valid email is required' }),
  password: z.string().min(8, { message: 'Min 8 characters' })
    .regex(/[A-Z]/, { message: 'Uppercase required' })
    .regex(/[0-9]/, { message: 'Number required' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authRole, setAuthRole] = useState<'traveller' | 'guide'>('traveller');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast({ variant: 'destructive', title: 'Sign In Failed', description: getSafeErrorMessage(error) });
      } else {
        setTimeout(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profileCheck } = await (supabase.from('profiles' as any) as any).select('*, guide_applications(status)').eq('id', user.id).single();
            const role = (profileCheck as any)?.role?.toLowerCase();
            if (role === 'guide') {
              const kycStatus = profileCheck?.guide_applications?.[0]?.status;
              if (!kycStatus) navigate('/guide/kyc');
              else if (kycStatus === 'pending') navigate('/guide/pending');
              else if (kycStatus === 'approved') navigate('/guide/dashboard');
              else if (kycStatus === 'rejected') navigate('/guide/kyc?status=rejected');
            } else if (role === 'admin') navigate('/admin');
            else navigate('/');
          }
        }, 500);
      }
    } finally { setIsLoading(false); }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      console.log('Attempting signup for:', data.email, 'Role:', authRole);
      const { error } = await signUp(data.email, data.password, data.fullName, authRole);
      if (error) {
        console.error('Signup Error:', error);
        toast({ 
          variant: 'destructive', 
          title: 'Account Creation Failed', 
          description: error.message || "An unexpected error occurred. Please try again later."
        });
      } else {
        navigate(`/auth/success?email=${encodeURIComponent(data.email)}&role=${authRole}`);
      }
    } catch (e: any) {
      console.error('Catch Error during signup:', e);
      toast({ variant: 'destructive', title: 'Critical Error', description: e.message });
    } finally { setIsLoading(false); }
  };

  const watchPassword = signupForm.watch('password', '');
  const hasMinLength = watchPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(watchPassword);
  const hasNumber = /[0-9]/.test(watchPassword);

  return (
    <div className="min-h-screen flex bg-[#f5f5f7] antialiased">
      {/* Visual Section - The Sweet Spot */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black border-r border-[#d2d2d7]/30">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          src="/loginimg.png" 
          alt="Nepal" 
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        <div className="absolute inset-0 p-16 flex flex-col justify-center items-start">
          <motion.div initial={{ x: -25, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
            <h1 className="text-6xl xl:text-8xl font-black text-white tracking-tighter leading-none mb-6">GoNepal.</h1>
            <div className="h-[2px] w-20 bg-white mb-6" />
            <p className="text-2xl xl:text-3xl text-white font-medium max-w-sm leading-snug tracking-tight opacity-90">
              The mountains don't wait.<br/>Neither should your guide.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Section - Clean & Responsive */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-[#f5f5f7]">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm mx-auto">
          
          <header className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">{isLogin ? 'Sign In' : 'Create Account'}</h2>
            <p className="text-[#86868b] mt-2 text-sm leading-relaxed">
              Use your GoNepal ID to manage journeys as a {authRole}.
            </p>
          </header>

          <div className="bg-[#e8e8ed] p-1 rounded-xl flex mb-10 w-full shadow-inner shadow-slate-200">
            <button onClick={() => setAuthRole('traveller')} className={`flex-1 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all ${authRole === 'traveller' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>Traveller</button>
            <button onClick={() => setAuthRole('guide')} className={`flex-1 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all ${authRole === 'guide' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>Guide</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? 'login' : 'signup'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
              <Form {...(isLogin ? loginForm : signupForm)}>
                <form onSubmit={(isLogin ? loginForm : signupForm).handleSubmit(isLogin ? onLoginSubmit : onSignupSubmit)} className="space-y-4">
                  {!isLogin && (
                    <FormField control={signupForm.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="Full Name" className="bg-white border-[#d2d2d7] rounded-xl py-6 px-4 text-[17px] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors shadow-none" {...field} /></FormControl>
                        <FormMessage className="text-[12px] text-[#ff3b30]" />
                      </FormItem>
                    )} />
                  )}
                  
                  <FormField control={(isLogin ? loginForm : signupForm).control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormControl><Input placeholder="Email" className="bg-white border-[#d2d2d7] rounded-xl py-6 px-4 text-[17px] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors shadow-none" {...field} /></FormControl>
                      <FormMessage className="text-[12px] text-[#ff3b30]" />
                    </FormItem>
                  )} />

                  <FormField control={(isLogin ? loginForm : signupForm).control} name="password" render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl><Input type={showPassword ? "text" : "password"} placeholder="Password" className="bg-white border-[#d2d2d7] rounded-xl py-6 px-4 text-[17px] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors shadow-none" {...field} /></FormControl>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                      </div>
                      <FormMessage className="text-[12px] text-[#ff3b30]" />
                      {!isLogin && (
                        <div className="bg-white rounded-xl p-3.5 mt-2 border border-[#d2d2d7]/40 space-y-1.5 shadow-sm">
                          <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-1.5 opacity-60">Validation Requirements</p>
                          <div className="flex flex-col gap-2">
                             <Requirement label="Min 8 characters" met={hasMinLength} />
                             <Requirement label="One upper-case letter" met={hasUppercase} />
                             <Requirement label="One number" met={hasNumber} />
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )} />

                  {!isLogin && (
                    <FormField control={signupForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input type="password" placeholder="Confirm Password" className="bg-white border-[#d2d2d7] rounded-xl py-6 px-4 text-[17px] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors shadow-none" {...field} /></FormControl>
                        <FormMessage className="text-[12px] text-[#ff3b30]" />
                      </FormItem>
                    )} />
                  )}

                  <div className="pt-6">
                    <Button type="submit" disabled={isLoading} className="w-full h-[52px] rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-[17px] font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#0071e3]/20">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>{isLogin ? 'Sign In' : 'Create Account'}<ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </AnimatePresence>

          <footer className="mt-10 text-center sm:text-left text-sm">
            <p className="text-[#86868b]">
              {isLogin ? "No account?" : "Have one?"}
              <button onClick={() => setIsLogin(!isLogin)} className="ml-1 text-[#0066cc] hover:underline font-medium">{isLogin ? 'Create yours.' : 'Sign in.'}</button>
            </p>
          </footer>
          
          <p className="mt-16 text-[11px] text-[#86868b] text-center max-w-[300px] mx-auto leading-relaxed border-t border-slate-200 pt-6">
            Continue to agree to GoNepal's <Link to="/terms" className="text-[#0066cc]">Terms</Link> and <Link to="/privacy" className="text-[#0066cc]">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Internal components
const Requirement = ({ label, met }: { label: string, met: boolean }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${met ? 'bg-[#34c759]' : 'bg-slate-100 border border-slate-200'}`}>
      {met && <Check className="w-2.5 h-2.5 text-white" />}
    </div>
    <span className={`text-[12px] transition-all ${met ? 'text-[#34c759] font-medium' : 'text-[#86868b]'}`}>{label}</span>
  </div>
);

export default Auth;
