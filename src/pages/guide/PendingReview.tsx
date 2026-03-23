import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, RefreshCw, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const PendingReview = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100"
      >
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 animate-pulse">
          <Clock className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Application Under Review</h1>
        <p className="text-slate-500 mb-8">
          Thank you for applying, <span className="text-slate-900 font-semibold">{user?.email}</span>! 
          Our team is currently reviewing your documents. This usually takes 24-48 hours.
        </p>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 text-left border border-slate-100">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold text-slate-900">Documents Received</p>
              <p className="text-slate-400">All files have been successfully uploaded to our secure server.</p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 text-left border border-slate-100">
            <RefreshCw className="w-5 h-5 text-blue-500 flex-shrink-0 animate-spin" />
            <div className="text-sm">
              <p className="font-bold text-slate-900">Verification in Progress</p>
              <p className="text-slate-400">Checking NTB license and experience details with local authorities.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <Button variant="outline" className="rounded-2xl w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
          </Button>
          <Button variant="ghost" className="rounded-2xl w-full text-slate-400" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
        
        <Link to="/" className="mt-8 inline-flex items-center text-sm text-primary font-bold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default PendingReview;
