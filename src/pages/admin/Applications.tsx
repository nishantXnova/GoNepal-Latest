import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, XCircle, 
  ExternalLink, Calendar, Search, 
  Filter, Eye, Loader2, AlertCircle,
  FileText, User, Phone, MapPin, 
  ArrowLeft, CheckCircle2, MoreVertical,
  RefreshCw, Clock, Mail, Award, Globe, Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const AdminApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Cast to any to bypass missing type definitions for guide_applications
      const { data, error } = await (supabase.from('guide_applications' as any) as any)
        .select(`
          *,
          profiles:user_id (id, full_name, email, avatar_url)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching applications", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async () => {
    if (!selectedApp) return;
    setIsReviewing(true);
    try {
      const { error } = await (supabase.from('guide_applications' as any) as any)
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', selectedApp.id);
      
      if (error) throw error;

      // Update the user's role in profiles as well
      await (supabase.from('profiles' as any) as any)
        .update({ role: 'guide' })
        .eq('id', selectedApp.user_id);

      toast({ title: "Application Approved", description: `The guide has been notified and their dashboard is unlocked.`, variant: "default" });
      setIsDetailOpen(false);
      fetchApplications();
    } catch (error: any) {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      toast({ title: "Reason required", description: "Please explain why the application is being rejected.", variant: "destructive" });
      return;
    }
    setIsReviewing(true);
    try {
      const { error } = await (supabase.from('guide_applications' as any) as any)
        .update({ 
          status: 'rejected', 
          reviewed_at: new Date().toISOString(),
          admin_notes: rejectionReason 
        })
        .eq('id', selectedApp.id);
      
      if (error) throw error;

      toast({ title: "Application Rejected", description: "The guide will see your notes and be able to resubmit.", variant: "default" });
      setIsRejectDialogOpen(false);
      setIsDetailOpen(false);
      setRejectionReason('');
      fetchApplications();
    } catch (error: any) {
      toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    } finally {
      setIsReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default: return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
    }
  };

  const filteredApps = applications.filter(app => 
    app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Guide Onboarding</h1>
            <p className="text-slate-500">Review and approve incoming KYC applications from trekking and tour guides.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 w-full md:w-64 rounded-xl border-slate-200" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white" onClick={fetchApplications}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Apps', value: applications.length, icon: Users, color: 'text-slate-900' },
            { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, icon: Clock, color: 'text-amber-500' },
            { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, icon: XCircle, color: 'text-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-slate-400 font-medium tracking-tight">Loading applications...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-xs uppercase tracking-wider pl-8 py-5">Guide Name</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Submitted</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Type</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-slate-400">No applications found.</TableCell>
                  </TableRow>
                ) : (
                  filteredApps.map((app) => (
                    <TableRow key={app.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedApp(app); setIsDetailOpen(true); }}>
                      <TableCell className="pl-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">
                            {app.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{app.full_name}</p>
                            <p className="text-xs text-slate-400">{app.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px] font-bold py-0.5">{app.guide_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(app.status)}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Eye className="w-4 h-4 text-slate-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* DETAIL VIEW MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          {selectedApp && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-8 text-white relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-black">
                      {selectedApp.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">{selectedApp.full_name}</h2>
                      <div className="flex gap-2 items-center text-white/60 text-sm mt-1">
                        <Mail className="w-3 h-3" /> {selectedApp.email} | <Phone className="w-3 h-3 ml-2" /> {selectedApp.phone}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <div className="flex gap-6 border-t border-white/10 pt-6 text-xs text-white/60 font-medium tracking-wider uppercase">
                  <div>Submitted: <span className="text-white ml-1">{new Date(selectedApp.submitted_at).toLocaleString()}</span></div>
                  <div>Experience: <span className="text-white ml-1">{selectedApp.years_experience} Years</span></div>
                </div>
              </div>

              <div className="p-8 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* LEFT COLUMN: Identity & Credentials */}
                  <section className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <User className="w-4 h-4" /> Identity & Verification
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Citizenship Number</p>
                        <p className="text-slate-900 font-bold mt-1">{selectedApp.citizenship_number || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NTB License & Expiry</p>
                        <p className="text-slate-900 font-bold mt-1">
                          {selectedApp.ntb_license_number} 
                          <span className="text-slate-400 font-medium ml-2">
                            (Expires: {selectedApp.license_expiry_date ? new Date(selectedApp.license_expiry_date).toLocaleDateString() : 'N/A'})
                          </span>
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 pt-4">
                       <Briefcase className="w-4 h-4" /> Expertise & Safety
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Group Size</p>
                            <p className="text-slate-900 font-bold mt-1">{selectedApp.max_group_size || '10'} Persons</p>
                          </div>
                          <Badge className={selectedApp.first_aid_certified ? "bg-green-500" : "bg-slate-300"}>
                            {selectedApp.first_aid_certified ? "First Aid Certified" : "No First Aid"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High Altitude Experience</p>
                        <p className="text-sm text-slate-600 mt-1">{selectedApp.high_altitude_exp || 'Regular trekking peaks'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regions & Languages</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedApp.regions?.map((r: string) => <Badge key={r} variant="secondary" className="bg-white border-slate-200">{r}</Badge>)}
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-3">{selectedApp.languages?.join(' • ')}</p>
                      </div>
                    </div>
                  </section>

                  {/* RIGHT COLUMN: Business & Documents */}
                  <section className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <Clock className="w-4 h-4" /> Business & Availability
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Rate</p>
                            <p className="text-slate-900 font-black text-xl mt-1">NPR {selectedApp.daily_rate?.toLocaleString() || '0'}</p>
                          </div>
                          <div className={`p-2 rounded-lg text-[10px] font-bold uppercase ${selectedApp.has_porter_contacts ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                            {selectedApp.has_porter_contacts ? 'Has Porter Contacts' : 'No Porter Network'}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Availability Schedule</p>
                        <p className="text-sm text-slate-600 mt-1">{selectedApp.availability_text || 'Standard availability'}</p>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 pt-4">
                       <FileText className="w-4 h-4" /> Documents Review
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Citizenship', key: 'citizenship_url' },
                        { label: 'License', key: 'trekking_license_url' },
                        { label: 'Training', key: 'training_cert_url' },
                        { label: 'Portrait', key: 'passport_photo_url' },
                      ].map((doc) => (
                        <div key={doc.key} className="group relative rounded-xl border border-slate-100 p-4 transition-all hover:bg-slate-50 bg-white shadow-sm shadow-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{doc.label}</p>
                          {selectedApp[doc.key] ? (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              <a 
                                href={supabase.storage.from('guide-kyc-docs').getPublicUrl(selectedApp[doc.key]).data.publicUrl} 
                                target="_blank" 
                                className="text-[10px] font-black text-slate-900 hover:text-primary transition-colors flex items-center gap-1"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300">Missing</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* SOCIAL PROOF SECTION (Full Width) */}
                <section className="space-y-4 pt-4 border-t border-slate-100">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <CheckCircle className="w-4 h-4" /> Social Proof & References
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Previous Agency</p>
                          <p className="text-sm text-slate-900 font-bold mt-1">{selectedApp.previous_agency || 'Independent / Freelance'}</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">References</p>
                          <p className="text-sm text-slate-600 italic mt-1 leading-relaxed">"{selectedApp.references_text || 'No references provided'}"</p>
                       </div>
                    </div>
                </section>
              </div>

              {selectedApp.status === 'pending' && (
                <div className="bg-slate-50 p-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium italic">Pending manual review against local NTB database.</span>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50" onClick={() => { setIsRejectDialogOpen(true); }}>
                      Reject Application
                    </Button>
                    <Button className="rounded-2xl bg-green-600 hover:bg-green-700 px-8" onClick={handleApprove} disabled={isReviewing}>
                      {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve Guide</>}
                    </Button>
                  </div>
                </div>
              )}

              {selectedApp.status === 'rejected' && selectedApp.admin_notes && (
                <div className="bg-red-50/50 p-6 m-8 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-800 italic">{selectedApp.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* REJECTION DIALOG */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a clear reason for rejection. This will be shown to the applicant so they can fix the issues.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="e.g. Citizenship documents are blurry / License number not found in NTB database..." 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="resize-none rounded-2xl min-h-[120px] focus:ring-red-500"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 rounded-xl" onClick={handleReject} disabled={isReviewing}>
              {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplications;
