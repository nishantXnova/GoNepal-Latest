import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, Mail, Phone, MapPin, 
  Award, Briefcase, 
  CheckCircle, ChevronRight, 
  ChevronLeft, Upload, FileText, 
  Image as ImageIcon, Loader2, AlertCircle, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const kycSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  dob: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address is required"),
  ntbLicense: z.string().min(1, "License number is required"),
  guideType: z.enum(['trekking', 'tour', 'both']),
  yearsExperience: z.string(),
  regions: z.array(z.string()).min(1, "Select at least one region"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
});

const STEPS = [
  { id: 1, name: 'Personal', icon: User },
  { id: 2, name: 'Identity', icon: Award },
  { id: 3, name: 'Documents', icon: FileText },
  { id: 4, name: 'Experience', icon: Briefcase },
];

const KYC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>({});
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // DevTools Tamper Protection
  useEffect(() => {
    const target = document.body;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const removedValid = Array.from(mutation.removedNodes).some(
            (node) => (node as HTMLElement).id === 'kyc-root-container'
          );
          if (removedValid) {
            toast({ title: "UI Error", description: "The KYC interface was tampered with. Reloading...", variant: "destructive" });
            setTimeout(() => window.location.reload(), 1000);
          }
        }
      }
    });

    observer.observe(target, { childList: true, subtree: true });

    // Detect if element is hidden via styles
    const checkVisibility = setInterval(() => {
      const el = document.getElementById('kyc-root-container');
      if (el && (window.getComputedStyle(el).display === 'none' || window.getComputedStyle(el).visibility === 'hidden')) {
        window.location.reload();
      }
    }, 2000);

    return () => {
      observer.disconnect();
      clearInterval(checkVisibility);
    };
  }, [toast]);

  const form = useForm({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: user?.email || '',
      dob: '',
      address: '',
      ntbLicense: '',
      guideType: 'trekking',
      yearsExperience: '0',
      regions: [],
      languages: [],
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum size is 5MB", variant: "destructive" });
        return;
      }
      setFiles(prev => ({ ...prev, [key]: file }));
      if (file.type.startsWith('image/')) {
        setFileUrls(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
      }
    }
  };

  const uploadFiles = async () => {
    const uploadedPaths: { [key: string]: string } = {};
    for (const [key, file] of Object.entries(files)) {
      if (!file) continue;
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${key}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('guide-kyc-docs').upload(filePath, file);
      if (error) throw error;
      uploadedPaths[key] = data.path;
    }
    return uploadedPaths;
  };

  const onSubmit = async (values: any) => {
    const requiredFiles = ['citizenship', 'trekkingLicense', 'trainingCert', 'insuranceCert', 'passportPhoto'];
    const missing = requiredFiles.filter(f => !files[f]);
    if (missing.length > 0) {
      toast({ title: "Missing documents", description: `Please upload all required documents.`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedPaths = await uploadFiles();
      const { error } = await (supabase.from('guide_applications' as any) as any).insert({
        user_id: user?.id,
        full_name: values.fullName,
        phone: values.phone,
        email: values.email,
        dob: values.dob,
        address: values.address,
        ntb_license_number: values.ntbLicense,
        guide_type: values.guideType,
        years_experience: parseInt(values.yearsExperience),
        regions: values.regions,
        languages: values.languages,
        citizenship_url: uploadedPaths.citizenship,
        passport_photo_url: uploadedPaths.passportPhoto,
        trekking_license_url: uploadedPaths.trekkingLicense,
        training_cert_url: uploadedPaths.trainingCert,
        insurance_cert_url: uploadedPaths.insuranceCert,
        status: 'pending'
      });

      if (error) throw error;
      toast({ title: "Application Submitted!", description: "Review in progress." });
      await refreshProfile();
      navigate('/guide/pending');
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div id="kyc-root-container" className="min-h-screen bg-slate-50 pt-16 pb-24 select-none">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[40px] font-bold text-slate-900 tracking-tight mb-2">Guide Verification</h1>
          <p className="text-slate-500 font-medium">Verify your identity to start leading tours in Nepal.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 relative flex justify-between items-center px-4">
          {STEPS.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  currentStep >= step.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-300 border border-slate-200'
                }`}
              >
                {currentStep > step.id ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
              </div>
              <span className={`mt-3 text-[11px] font-bold uppercase tracking-widest ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-300'}`}>
                {step.name}
              </span>
            </div>
          ))}
          <div className="absolute top-[28px] left-[60px] right-[60px] h-[2px] bg-slate-200 -z-0">
            <motion.div 
              className="h-full bg-slate-900" 
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/40 p-10 lg:p-16 border border-white/40 backdrop-blur-sm min-h-[500px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Full Name</FormLabel><FormControl><Input placeholder="John Doe" className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Email Address</FormLabel><FormControl><Input {...field} readOnly className="bg-slate-100 border-none rounded-2xl py-6 px-5 opacity-60" /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Phone Number</FormLabel><FormControl><Input placeholder="+977 98..." className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="dob" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Date of Birth</FormLabel><FormControl><Input type="date" className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl></FormItem>
                    )} />
                    <div className="md:col-span-2">
                       <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Residential Address</FormLabel><FormControl><Input placeholder="Kathmandu, Nepal..." className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl></FormItem>
                      )} />
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-xs uppercase font-black text-slate-400 tracking-widest">Citizenship Document</label>
                        <div onClick={() => document.getElementById('citizenship')?.click()} className={`h-[200px] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all cursor-pointer ${files.citizenship ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}>
                          <input type="file" id="citizenship" className="hidden" onChange={(e) => handleFileChange(e, 'citizenship')} />
                          {files.citizenship ? <CheckCircle className="w-12 h-12 text-primary" /> : <Upload className="w-12 h-12 text-slate-300" />}
                          <p className="mt-4 text-sm font-bold text-slate-600">{files.citizenship ? files.citizenship.name : 'Select PDF or Map'}</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-xs uppercase font-black text-slate-400 tracking-widest">Self Portrait (Passport Size)</label>
                        <div onClick={() => document.getElementById('portrait')?.click()} className={`h-[200px] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all cursor-pointer ${files.passportPhoto ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}>
                          <input type="file" id="portrait" className="hidden" onChange={(e) => handleFileChange(e, 'passportPhoto')} accept="image/*" />
                          {fileUrls.passportPhoto ? <img src={fileUrls.passportPhoto} className="w-24 h-24 rounded-full object-cover" /> : <ImageIcon className="w-12 h-12 text-slate-300" />}
                          <p className="mt-4 text-sm font-bold text-slate-600">Upload Portrait</p>
                        </div>
                     </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                   <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                      <FormField control={form.control} name="ntbLicense" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">License Number</FormLabel><FormControl><Input placeholder="G-4455..." className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl></FormItem>
                      )} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {['trekkingLicense', 'trainingCert', 'insuranceCert', 'cv'].map((doc) => (
                           <div key={doc} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                             <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-slate-400" /><span className="text-xs font-bold text-slate-600">{files[doc] ? 'Documented' : doc.replace(/([A-Z])/g, ' $1').toUpperCase()}</span></div>
                             <input type="file" id={doc} className="hidden" onChange={(e) => handleFileChange(e, doc)} />
                             <Button type="button" variant="ghost" className="text-primary font-bold" onClick={() => document.getElementById(doc)?.click()}>{files[doc] ? 'Edit' : 'Add'}</Button>
                           </div>
                         ))}
                      </div>
                   </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                     <FormField control={form.control} name="guideType" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Professional Sector</FormLabel>
                          <div className="flex bg-slate-100 p-1.5 rounded-2xl mt-2">
                             {['trekking', 'tour', 'both'].map(t => (
                               <button key={t} type="button" onClick={() => field.onChange(t)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${field.value === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>{t}</button>
                             ))}
                          </div>
                        </FormItem>
                     )} />
                     <div className="space-y-4">
                        <label className="text-xs uppercase font-black text-slate-400 tracking-widest">Regions of Expertise</label>
                        <div className="flex flex-wrap gap-2">
                            {['Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Upper Mustang', 'Pokhara'].map(r => (
                              <button key={r} type="button" onClick={() => {
                                const cur = form.getValues('regions') as string[];
                                form.setValue('regions', cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r]);
                              }} className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${((form.watch('regions') || []) as string[]).includes(r) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{r}</button>
                            ))}
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-12 border-t border-slate-50 mt-12">
                <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 1} className="rounded-2xl px-8 font-black uppercase text-xs tracking-widest text-slate-400">Back</Button>
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep} className="bg-slate-900 text-white rounded-2xl px-12 py-7 font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">Continue</Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="bg-[#0071e3] text-white rounded-2xl px-12 py-7 font-black uppercase text-xs tracking-widest hover:bg-[#0077ed] transition-all shadow-xl shadow-[#0071e3]/30">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalize Profile'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default KYC;
