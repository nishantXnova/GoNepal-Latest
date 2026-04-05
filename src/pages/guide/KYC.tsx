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
import { Textarea } from '@/components/ui/textarea';
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
  citizenshipNumber: z.string().min(1, "Citizenship number is required"),
  ntbLicense: z.string().min(1, "License number is required"),
  licenseExpiry: z.string().min(1, "Expiry date is required"),
  guideType: z.enum(['trekking', 'tour', 'both']),
  yearsExperience: z.string().min(1, "Required"),
  regions: z.array(z.string()).min(1, "Select at least one region"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  maxGroupSize: z.string().min(1, "Required"),
  firstAidCertified: z.boolean().default(false),
  highAltitudeExp: z.string().optional(),
  dailyRate: z.string().min(1, "Required"),
  availabilityText: z.string().min(1, "Required"),
  hasPorterContacts: z.boolean().default(false),
  previousAgency: z.string().optional(),
  referencesText: z.string().min(1, "Please provide at least one reference"),
});

const STEPS = [
  { id: 1, name: 'Identity', icon: User },
  { id: 2, name: 'Credentials', icon: Award },
  { id: 3, name: 'Expertise', icon: Briefcase },
  { id: 4, name: 'Business', icon: CheckCircle },
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
      citizenshipNumber: '',
      ntbLicense: '',
      licenseExpiry: '',
      guideType: 'trekking',
      yearsExperience: '0',
      regions: [],
      languages: ['Nepali', 'English'],
      maxGroupSize: '10',
      firstAidCertified: false,
      highAltitudeExp: '',
      dailyRate: '2500',
      availabilityText: '',
      hasPorterContacts: false,
      previousAgency: '',
      referencesText: '',
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
    const requiredFiles = ['citizenship', 'trekkingLicense', 'passportPhoto'];
    const missing = requiredFiles.filter(f => !files[f]);
    if (missing.length > 0) {
      toast({ title: "Missing documents", description: `Please upload Required: ${missing.join(', ')}`, variant: "destructive" });
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
        citizenship_number: values.citizenshipNumber,
        ntb_license_number: values.ntbLicense,
        license_expiry_date: values.licenseExpiry,
        guide_type: values.guideType,
        years_experience: parseInt(values.yearsExperience),
        regions: values.regions,
        languages: values.languages,
        max_group_size: parseInt(values.maxGroupSize),
        first_aid_certified: values.firstAidCertified,
        high_altitude_exp: values.highAltitudeExp,
        daily_rate: parseFloat(values.dailyRate),
        availability_text: values.availabilityText,
        has_porter_contacts: values.hasPorterContacts,
        previous_agency: values.previousAgency,
        references_text: values.referencesText,
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
                      <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Full Legal Name</FormLabel><FormControl><Input placeholder="John Doe" className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="citizenshipNumber" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Citizenship Number (Nepal ID)</FormLabel><FormControl><Input placeholder="12-34-56-789" className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Phone Number</FormLabel><FormControl><Input placeholder="+977 98..." className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dob" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Date of Birth</FormLabel><FormControl><Input type="date" className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div onClick={() => document.getElementById('portrait')?.click()} className={`h-[180px] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all cursor-pointer ${files.passportPhoto ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}>
                        <input type="file" id="portrait" className="hidden" onChange={(e) => handleFileChange(e, 'passportPhoto')} accept="image/*" />
                        {fileUrls.passportPhoto ? <img src={fileUrls.passportPhoto} className="w-24 h-24 rounded-full object-cover" /> : <ImageIcon className="w-10 h-10 text-slate-300" />}
                        <p className="mt-4 text-xs font-black uppercase text-slate-400 tracking-widest">Profile Photo</p>
                      </div>
                      <div onClick={() => document.getElementById('citizenship')?.click()} className={`h-[180px] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center transition-all cursor-pointer ${files.citizenship ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}>
                        <input type="file" id="citizenship" className="hidden" onChange={(e) => handleFileChange(e, 'citizenship')} />
                        {files.citizenship ? <CheckCircle className="w-10 h-10 text-primary" /> : <Upload className="w-10 h-10 text-slate-300" />}
                        <p className="mt-4 text-xs font-black uppercase text-slate-400 tracking-widest">Citizenship Scan</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField control={form.control} name="ntbLicense" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">License Number</FormLabel><FormControl><Input placeholder="G-4455..." className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="licenseExpiry" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">License Expiry Date</FormLabel><FormControl><Input type="date" className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="yearsExperience" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Years of Experience</FormLabel><FormControl><Input type="number" min="0" className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['trekkingLicense', 'trainingCert', 'insuranceCert'].map((doc) => (
                        <div key={doc} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group transition-all hover:border-slate-200">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100">
                              <FileText className={`w-5 h-5 ${files[doc] ? 'text-primary' : 'text-slate-300'}`} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                              {doc.replace(/([A-Z])/g, ' $1')}
                            </span>
                          </div>
                          <input type="file" id={doc} className="hidden" onChange={(e) => handleFileChange(e, doc)} />
                          <Button type="button" variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest" onClick={() => document.getElementById(doc)?.click()}>
                            {files[doc] ? 'Change' : 'Upload'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                    <FormField control={form.control} name="guideType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Specialization</FormLabel>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl mt-2">
                          {['trekking', 'tour', 'both'].map(t => (
                            <button key={t} type="button" onClick={() => field.onChange(t)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${field.value === t ? 'bg-white shadow-sm text-slate-900 border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                          ))}
                        </div>
                      </FormItem>
                    )} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <FormField control={form.control} name="maxGroupSize" render={({ field }) => (
                          <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Max Group Size</FormLabel><FormControl><Input type="number" className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl></FormItem>
                       )} />
                       <div className="flex flex-col gap-4">
                          <FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Safety Certifications</FormLabel>
                          <div className="flex items-center gap-3">
                             <input type="checkbox" id="firstaid" {...form.register('firstAidCertified')} className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary" />
                             <label htmlFor="firstaid" className="text-sm font-bold text-slate-600">Wilderness First Aid Certified</label>
                          </div>
                       </div>
                    </div>

                    <FormField control={form.control} name="highAltitudeExp" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">High Altitude Experience (Optional)</FormLabel><FormControl><Input placeholder="E.g. Island Peak, Mera Peak..." className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl></FormItem>
                    )} />

                    <div className="space-y-4">
                      <label className="text-xs uppercase font-black text-slate-400 tracking-widest">Districts / Regions of Expertise</label>
                      <div className="flex flex-wrap gap-2">
                        {['Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Mustang', 'Pokhara', 'Kathmandu'].map(r => (
                          <button key={r} type="button" onClick={() => {
                            const cur = form.getValues('regions') as string[];
                            form.setValue('regions', cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r]);
                          }} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${((form.watch('regions') || []) as string[]).includes(r) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{r}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="dailyRate" render={({ field }) => (
                          <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Daily Rate (NPR)</FormLabel><FormControl><Input type="number" className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="flex flex-col gap-4">
                           <FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Resource Network</FormLabel>
                           <div className="flex items-center gap-3">
                              <input type="checkbox" id="porter" {...form.register('hasPorterContacts')} className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary" />
                              <label htmlFor="porter" className="text-sm font-bold text-slate-600">I have Porter contacts</label>
                           </div>
                        </div>
                     </div>

                     <FormField control={form.control} name="availabilityText" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Availability</FormLabel><FormControl><Input placeholder="Available Mon-Fri, not available Dec-Feb." className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl><FormMessage /></FormItem>
                     )} />

                     <FormField control={form.control} name="previousAgency" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Previous Travel Agency (Optional)</FormLabel><FormControl><Input className="bg-slate-50 border-none rounded-2xl py-6 px-5" {...field} /></FormControl></FormItem>
                     )} />

                     <FormField control={form.control} name="referencesText" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs uppercase font-black text-slate-400 tracking-widest">Professional References</FormLabel><FormControl><Textarea placeholder="Describe previous work references (Name, Organization, Contact)..." className="bg-slate-50 border-none rounded-3xl py-6 px-8 min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-12 border-t border-slate-50 mt-12">
                <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 1} className="rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600">Back</Button>
                {currentStep < 4 ? (
                  <Button type="button" onClick={() => {
                    const stepFields: any = {
                      1: ['fullName', 'phone', 'dob', 'citizenshipNumber'],
                      2: ['ntbLicense', 'licenseExpiry', 'yearsExperience'],
                      3: ['guideType', 'maxGroupSize', 'regions'],
                    };
                    form.trigger(stepFields[currentStep]).then(valid => {
                      if (valid) nextStep();
                    });
                  }} className="bg-slate-900 text-white rounded-2xl px-12 py-7 font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">Continue</Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="bg-[#0071e3] text-white rounded-2xl px-12 py-7 font-black uppercase text-[10px] tracking-widest hover:bg-[#0077ed] transition-all shadow-xl shadow-[#0071e3]/30">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit for Review'}
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
