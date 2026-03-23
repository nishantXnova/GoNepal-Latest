import { motion } from 'framer-motion';
import { 
  Users, MapPin, Calendar, 
  MessageSquare, Star, Settings,
  LogOut, Bell, Search, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

const GuideDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Guide Dashboard</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Welcome back, {user?.email} • Verified Guide
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl border-slate-200">
              <Settings className="w-4 h-4 mr-2" /> Profile Settings
            </Button>
            <Button className="rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Add New Tour
            </Button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Active Bookings', value: '12', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Total Earnings', value: '$2,450', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Tour Reviews', value: '48', icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Profile Views', value: '1.2k', icon: Users, color: 'text-slate-900', bg: 'bg-slate-100' },
          ].map((stat) => (
            <motion.div 
              key={stat.label}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
            >
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900">Upcoming Tours</h2>
                <Button variant="ghost" className="text-primary font-bold">See All</Button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Everest Base Camp Trek</p>
                      <p className="text-xs text-slate-500">Scheduled for Oct 24, 2024 • 4 Travellers</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Confirmed</Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
              <h3 className="text-lg font-bold mb-6">Guide Performance</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 text-white/60 uppercase tracking-widest">
                    <span>Profile Completion</span>
                    <span>95%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[95%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 text-white/60 uppercase tracking-widest">
                    <span>Response Rate</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full"></div>
                  </div>
                </div>
              </div>
            </section>

            <Button variant="outline" className="w-full rounded-2xl py-6 border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> Log Out Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Internal components
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${className}`}>
    {children}
  </span>
);

const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export default GuideDashboard;
