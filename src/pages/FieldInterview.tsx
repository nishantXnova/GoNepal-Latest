import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  MapPin, 
  Globe, 
  MessageSquare, 
  Navigation, 
  DollarSign, 
  HelpCircle, 
  Star,
  Play,
  ChevronDown,
  Loader2
} from 'lucide-react';

// Animation components
const RevealOnScroll = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Scroll progress bar
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div 
      className="fixed top-0 left-0 h-[3px] z-50 transition-all duration-75"
      style={{ 
        width: `${progress}%`,
        background: 'linear-gradient(90deg, hsl(220 60% 25%), hsl(38 90% 50%), hsl(25 85% 55%))'
      }}
    />
  );
};

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-[19px] h-[19px] ${star <= rating ? 'fill-nepal-gold text-nepal-gold' : 'text-muted'}`}
        />
      ))}
    </div>
  );
};

// Animated counter
const AnimatedCounter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const duration = 900;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(progress * target));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, target]);
  
  return <span ref={ref}>{count}</span>;
};

// YouTube embed with error handling
const YouTubeEmbed = ({ videoId }: { videoId: string }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden shadow-elevated bg-slate-900 group cursor-pointer">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
          <Play className="w-12 h-12 text-white/50 mb-3" />
          <p className="text-white/70 text-sm">Video unavailable</p>
          <a 
            href={`https://youtube.com/watch?v=${videoId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary text-sm mt-2 hover:underline"
          >
            Watch on YouTube →
          </a>
        </div>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="GoNepal field interview — Stephan, Pokhara"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
};

// Main component
const FieldInterview = () => {
  const scrollToContent = () => {
    document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const features = [
    {
      icon: Globe,
      title: "Multilingual Translator",
      description: "22 languages, real-time, Google-backed. No data leaves the device — fully private.",
      badge: "His Pick",
      highlight: true
    },
    {
      icon: MessageSquare,
      title: "Nepali Phrasebook",
      description: "Preloaded common phrases — greetings, food, navigation — no typing needed.",
      badge: "Shown"
    },
    {
      icon: MapPin,
      title: "Nearby Places Finder",
      description: "Live map of hospitals, hotels, services. Built for emergencies, not just browsing.",
      badge: "Shown"
    },
    {
      icon: Navigation,
      title: "Trip Tracker · Take Me Back",
      description: "Set your base, explore freely. One tap sends you back via Google Maps.",
      badge: "Shown"
    },
    {
      icon: DollarSign,
      title: "Currency Converter",
      description: "Updates every minute. We brought it up — he wasn't expecting it. Quiet utility.",
      badge: "Mentioned"
    }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      
      {/* Hero Section - Sticky */}
      <section className="lg:sticky lg:top-0 lg:z-10 min-h-screen lg:min-h-auto lg:h-screen">
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* Left Panel */}
          <div className="bg-primary p-7 lg:p-14 flex flex-col justify-between relative overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(ellipse at 0% 100%, hsl(25 85% 45% / 0.25) 0%, transparent 60%),
                  radial-gradient(ellipse at 100% 0%, hsl(200 70% 55% / 0.1) 0%, transparent 55%)
                `
              }}
            />
            
            {/* Animated orb */}
            <div className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
              style={{
                background: 'hsl(38 90% 50% / 0.07)',
                bottom: '-80px',
                right: '-80px',
                animation: 'orb-float 7s ease-in-out infinite'
              }}
            />
            
            {/* Logo */}
            <div className="relative">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-display text-[0.9rem] font-semibold tracking-[0.22em] uppercase text-primary-foreground/40"
              >
                GoNepal
              </motion.p>
            </div>
            
            {/* Content */}
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="flex items-center gap-2.5 mb-6"
              >
                <span className="w-[26px] h-[1px] bg-nepal-gold/70" />
                <span className="text-[0.67rem] font-bold tracking-[0.14em] uppercase text-nepal-gold">
                  Field Interview · Pokhara
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-4xl lg:text-5xl xl:text-[3.7rem] font-bold leading-[1.08] text-primary-foreground mb-9"
              >
                What a Canadian<br />
                traveller said<br />
                near <em className="text-nepal-gold">Phewa Tal</em>
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.15 }}
                className="flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-2 text-[0.79rem] text-primary-foreground/50">
                  <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Interviewer: Nishant &nbsp;·&nbsp; <b className="font-medium text-primary-foreground/85">Stephan, Canada</b></span>
                </div>
                <div className="flex items-center gap-2 text-[0.79rem] text-primary-foreground/50">
                  <MapPin className="w-3.5 h-3.5 opacity-50" />
                  <span className="font-medium text-primary-foreground/85">Lakeside, Pokhara, Nepal</span>
                </div>
              </motion.div>
            </div>
            
            {/* Bottom section */}
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex gap-2.5 flex-wrap mb-8"
              >
                <span className="text-[0.64rem] font-semibold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full border border-primary-foreground/10 text-primary-foreground/40">
                  User Research
                </span>
                <span className="text-[0.64rem] font-semibold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full border border-primary-foreground/10 text-primary-foreground/40">
                  Feature Feedback
                </span>
              </motion.div>
              
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                onClick={scrollToContent}
                className="flex items-center gap-2.5 text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors cursor-pointer"
              >
                <span className="w-[30px] h-[1px] bg-primary-foreground/20 relative overflow-hidden">
                  <span className="absolute inset-0 bg-nepal-gold animate-[line-sweep_2s_ease-in-out_infinite]" />
                </span>
                Scroll to read
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          
          {/* Right Panel - Photo */}
          <div className="relative overflow-hidden bg-slate-900 lg:h-auto min-h-[260px] lg:min-h-0">
            <img
              src="https://i.ibb.co/93hKfLLP/656191920-1677060123707598-7574505493526533434-n-1.jpg"
              alt="Nishant interviewing Stephan near Phewa Tal Lakeside, Pokhara"
              className="w-full h-full object-cover object-[center_20%]"
            />
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to right, hsl(220 60% 25%) 0%, transparent 32%),
                  linear-gradient(to top, hsl(220 20% 6% / 0.5) 0%, transparent 50%)
                `
              }}
            />
            <div className="absolute bottom-4 right-4 z-10 text-right leading-relaxed">
              <p className="text-[0.67rem] font-medium tracking-[0.05em] text-primary-foreground/50">
                Phewa Tal Lakeside<br />Pokhara, Nepal
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Content that scrolls over sticky hero */}
      <div id="content" className="relative z-20 bg-background rounded-t-3xl -mt-7 shadow-[0_-4px_40px_hsl(220_20%_15%_/_0.08)]">
        <div className="max-w-[880px] mx-auto px-8 lg:px-10 pt-16 lg:pt-18">
          
          {/* Pull Quote */}
          <RevealOnScroll>
            <div className="pb-0">
              <div className="grid grid-cols-[3px_1fr] gap-0 lg:gap-8 items-start">
                <div className="bg-nepal-gold rounded-[3px] self-stretch origin-top scale-y-0 data-[in]:scale-y-100 transition-transform duration-800 ease-[0.16,1,0.3,1]" />
                <div>
                  <p className="font-display text-2xl lg:text-3xl font-normal italic leading-relaxed text-foreground">
                    When asked which feature he'd actually reach for —{" "}
                    <strong className="italic font-bold text-primary">"Maybe the translation."</strong>
                    Unprompted. Before anything else. That's the clearest signal from the whole session.
                  </p>
                  <p className="mt-3.5 text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-muted-foreground">
                    Stephan's first answer · Feature preference
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
          
          {/* Reviewer Card */}
          <RevealOnScroll delay={0.08}>
            <div className="pt-16">
              <div className="flex items-center gap-1.5 text-[0.67rem] font-bold tracking-[0.14em] uppercase text-accent mb-3">
                <span className="w-[22px] h-0.5 bg-accent rounded" />
                Participant
              </div>
              <div className="flex items-center gap-5 p-6 lg:p-7 bg-secondary border border-border rounded-xl shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-250 cursor-default">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold text-foreground mb-0.5">Stephan</p>
                  <p className="text-[0.78rem] text-muted-foreground mb-2">Tourist · Canada &nbsp;·&nbsp; Phewa Tal Lakeside, Pokhara</p>
                  <StarRating rating={4} />
                </div>
                <div className="w-px self-stretch bg-border" />
                <div className="text-center px-1">
                  <p className="font-display text-2xl font-bold text-primary leading-none mb-1">
                    <AnimatedCounter target={5} />
                  </p>
                  <p className="text-[0.63rem] font-semibold tracking-[0.08em] uppercase text-muted-foreground leading-tight">
                    Features<br />Shown
                  </p>
                </div>
                <div className="w-px self-stretch bg-border" />
                <div className="text-center px-1">
                  <p className="font-display text-2xl font-bold text-primary leading-none mb-1">
                    <AnimatedCounter target={1} />
                  </p>
                  <p className="text-[0.63rem] font-semibold tracking-[0.08em] uppercase text-muted-foreground leading-tight">
                    Suggestion<br />Made
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
          
          {/* Features Section */}
          <RevealOnScroll delay={0.16}>
            <div className="pt-16">
              <div className="flex items-center gap-1.5 text-[0.67rem] font-bold tracking-[0.14em] uppercase text-accent mb-3">
                <span className="w-[22px] h-0.5 bg-accent rounded" />
                Features Covered
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-semibold text-foreground mb-6">What we walked him through</h2>
              
              <div className="border border-border rounded-xl overflow-hidden shadow-card">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className={`grid grid-cols-[46px_1fr_auto] lg:grid-cols-[46px_1fr_auto] gap-4 lg:gap-[18px] p-5 lg:p-5 border-b border-border last:border-b-0 hover:bg-secondary transition-colors cursor-default ${feature.highlight ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 ${feature.highlight ? 'bg-accent' : 'bg-primary'}`}>
                      <feature.icon className="w-[19px] h-[19px] text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-foreground mb-0.5">{feature.title}</h3>
                      <p className="text-[0.79rem] text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                    <span className={`text-[0.62rem] font-bold tracking-[0.08em] uppercase px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 self-center transition-transform hover:scale-105 ${feature.highlight ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {feature.badge}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
          
          {/* Video Section */}
          <RevealOnScroll delay={0.24}>
            <div className="pt-16">
              <div className="flex items-center gap-1.5 text-[0.67rem] font-bold tracking-[0.14em] uppercase text-accent mb-3">
                <span className="w-[22px] h-0.5 bg-accent rounded" />
                Proof
              </div>
              <h2 className="font-display text-2xl lg:text-3xl font-semibold text-foreground mb-6">Watch the interview</h2>
              <YouTubeEmbed videoId="oR0j3gAYcb0" />
              <p className="mt-3 text-[0.74rem] text-muted-foreground tracking-[0.03em]">
                Recorded at Phewa Tal Lakeside, Pokhara &nbsp;·&nbsp; GoNepal field research
              </p>
            </div>
          </RevealOnScroll>
          
          {/* Two Cards */}
          <RevealOnScroll delay={0.32}>
            <div className="grid md:grid-cols-2 gap-5 pt-16">
              {/* Card 1 - Dark */}
              <div className="rounded-xl border border-transparent p-7 shadow-card hover:-translate-y-1 hover:shadow-elevated transition-all bg-primary relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-nepal-gold" />
                <div className="w-[38px] h-[38px] rounded-lg bg-white/10 flex items-center justify-center mb-5 hover:scale-110 transition-transform">
                  <MessageSquare className="w-[19px] h-[19px] text-white" />
                </div>
                <p className="text-[0.62rem] font-bold tracking-[0.12em] uppercase text-nepal-gold mb-2">Key Moment</p>
                <p className="font-display text-lg font-bold text-white mb-3 leading-tight">"Is it a free app?"</p>
                <p className="text-[0.84rem] leading-relaxed text-white/70">
                  He stopped mid-demo to ask. Not about features, not about UI — about price. Tourists notice free. The answer landed.
                </p>
              </div>
              
              {/* Card 2 - Light */}
              <div className="rounded-xl border p-7 shadow-card hover:-translate-y-1 hover:shadow-elevated transition-all bg-card relative overflow-hidden"
                style={{ borderColor: 'hsl(160 40% 25% / 0.2)' }}>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-nepal-forest" />
                <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center mb-5 hover:scale-110 transition-transform"
                  style={{ background: 'hsl(160 40% 25% / 0.12)' }}>
                  <HelpCircle className="w-[19px] h-[19px] text-nepal-forest" />
                </div>
                <p className="text-[0.62rem] font-bold tracking-[0.12em] uppercase text-nepal-forest mb-2">User Suggestion</p>
                <p className="font-display text-lg font-bold text-foreground mb-3 leading-tight">Add sports venue discovery</p>
                <p className="text-[0.84rem] leading-relaxed text-muted-foreground">
                  Cricket grounds, stadiums. His exact point: tourists want to find where to watch a live match. A real gap, not a hypothetical.
                </p>
                <span className="inline-block mt-4 text-[0.62rem] font-bold tracking-[0.1em] uppercase px-3 py-1 rounded-full bg-nepal-forest text-white hover:scale-105 transition-transform">
                  Open Opportunity
                </span>
              </div>
            </div>
          </RevealOnScroll>
          
        </div>
        
        {/* Footer */}
        <div className="h-px bg-border mt-20" />
        <footer className="max-w-[880px] mx-auto px-8 lg:px-10 py-9 flex items-center justify-between flex-wrap gap-2.5">
          <span className="font-display text-[0.95rem] font-bold tracking-[0.06em] text-primary">GoNepal</span>
          <span className="text-[0.75rem] text-muted-foreground">Field research · Phewa Tal Lakeside, Pokhara</span>
        </footer>
      </div>
      
      {/* Global styles for keyframes */}
      <style>{`
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -20px) scale(1.08); }
        }
        @keyframes line-sweep {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default FieldInterview;