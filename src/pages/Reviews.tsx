import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Play, MapPin, Calendar, ArrowLeft, Sparkles, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import gonepallogo from "@/assets/gonepallogo.png";

// Apple-style animations
const fadeInUp = {
  animation: "fadeInUp 0.6s ease-out forwards",
};

const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    }
    50% {
      box-shadow: 0 0 40px rgba(102, 126, 234, 0.6);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes rotate-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.5s ease-out forwards;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient-shift 5s ease infinite;
  }

  .animate-rotate-slow {
    animation: rotate-slow 20s linear infinite;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  }
  
  .apple-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .text-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hover-lift {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .hover-scale {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hover-scale:hover {
    transform: scale(1.02);
  }

  .hover-glow:hover {
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.4);
  }

  .bg-mesh {
    background-image: 
      radial-gradient(at 40% 20%, rgba(102, 126, 234, 0.1) 0px, transparent 50%),
      radial-gradient(at 80% 0%, rgba(118, 75, 162, 0.1) 0px, transparent 50%),
      radial-gradient(at 0% 50%, rgba(102, 126, 234, 0.05) 0px, transparent 50%),
      radial-gradient(at 80% 50%, rgba(118, 75, 162, 0.05) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(102, 126, 234, 0.1) 0px, transparent 50%);
  }

  .card-shine {
    position: relative;
    overflow: hidden;
  }

  .card-shine::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  .card-shine:hover::before {
    left: 100%;
  }
`;

const interviewData = {
  participant: {
    name: "Stephan",
    country: "Canada",
    location: "Phewa Tal Lakeside, Pokhara",
    avatar: "S",
    rating: 4,
  },
  meta: {
    interviewer: "Nishant",
    location: "Pokhara, Nepal",
    featuresShown: 5,
    suggestions: 1,
  },
  quote: {
    text: "When asked which feature he'd actually reach for — \"Maybe the translation.\" Unprompted. Before anything else. That's the clearest signal from the whole session.",
    context: "Stephan's first answer · Feature preference",
  },
  features: [
    {
      title: "Multilingual Translator",
      description: "22 languages, real-time, Google-backed. No data leaves the device — fully private.",
      status: "His Pick",
      icon: "globe",
    },
    {
      title: "Nepali Phrasebook",
      description: "Preloaded common phrases — greetings, food, navigation — no typing needed.",
      status: "Shown",
      icon: "book",
    },
    {
      title: "Nearby Places Finder",
      description: "Live map of hospitals, hotels, services. Built for emergencies, not just browsing.",
      status: "Shown",
      icon: "map",
    },
    {
      title: "Trip Tracker · Take Me Back",
      description: "Set your base, explore freely. One tap sends you back via Google Maps.",
      status: "Shown",
      icon: "navigation",
    },
    {
      title: "Currency Converter",
      description: "Updates every minute. We brought it up — he wasn't expecting it. Quiet utility.",
      status: "Mentioned",
      icon: "dollar",
    },
  ],
  video: {
    id: "oR0j3gAYcb0",
    title: "GoNepal field interview — Stephan, Pokhara",
    caption: "Recorded at Phewa Tal Lakeside, Pokhara · GoNepal field research",
  },
  highlights: [
    {
      type: "key-moment",
      title: "\"Is it a free app?\"",
      description: "He stopped mid-demo to ask. Not about features, not about UI — about price. Tourists notice free. The answer landed.",
      icon: "question",
    },
    {
      type: "suggestion",
      title: "Add sports venue discovery",
      description: "Cricket grounds, stadiums. His exact point: tourists want to find where to watch a live match. A real gap, not a hypothetical.",
      tag: "Open Opportunity",
      icon: "lightbulb",
    },
  ],
};

const iconMap: Record<string, React.ReactNode> = {
  globe: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/>
    </svg>
  ),
  book: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  map: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  navigation: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  dollar: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  question: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  lightbulb: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
};

export default function Reviews() {
  const navigate = useNavigate();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ features: 0, suggestions: 0 });

  useEffect(() => {
    // Animate stats count up
    const duration = 900;
    const featuresTarget = interviewData.meta.featuresShown;
    const suggestionsTarget = interviewData.meta.suggestions;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      
      setAnimatedStats({
        features: Math.round(progress * featuresTarget),
        suggestions: Math.round(progress * suggestionsTarget),
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, []);

  return (
    <div className="min-h-screen">
      <style>{styles}</style>

      {/* Navigation with Floating Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/20 hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
            <ArrowLeft className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            Go Home
          </span>
        </button>
      </div>

      {/* Floating decorative orbs */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1s' }}></div>

      {/* Hero Section with gradient background */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-20 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 animate-gradient"></div>
        <div className="absolute inset-0 bg-mesh"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Field Interview · Pokhara
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
                What a Canadian<br/>
                traveller said near<br/>
                <span className="text-gradient">Phewa Tal</span>
              </h1>

              <div className="flex flex-col gap-3 text-gray-600 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-gray-500" />
                  </div>
                  <span className="text-sm">
                    Interviewer: {interviewData.meta.interviewer} · <strong>{interviewData.participant.name}, {interviewData.participant.country}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-gray-500" />
                  </div>
                  <span className="text-sm">
                    <strong>{interviewData.participant.location}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full">
                  User Research
                </Badge>
                <Badge variant="secondary" className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full">
                  Feature Feedback
                </Badge>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-scale-in hover-scale" style={{ animationDelay: "0.3s" }}>
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl hover-lift">
                <img
                  src="https://i.ibb.co/93hKfLLP/656191920-1677060123707598-7574505493526533434-n-1.jpg"
                  alt="Nishant interviewing Stephan near Phewa Tal Lakeside, Pokhara"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 right-6 text-white text-right">
                  <p className="text-sm font-medium">Phewa Tal Lakeside</p>
                  <p className="text-xs opacity-75">Pokhara, Nepal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pull Quote */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-start gap-6">
              <div className="w-1 h-24 bg-gradient-to-b from-purple-500 to-orange-500 rounded-full flex-shrink-0"></div>
              <div>
                <blockquote className="text-2xl lg:text-3xl font-medium text-gray-900 leading-relaxed mb-4">
                  {interviewData.quote.text}
                </blockquote>
                <p className="text-sm text-gray-500">{interviewData.quote.context}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Participant Card */}
      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-4">Participant</p>
            
            <Card className="glass-card hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-semibold text-white">{interviewData.participant.avatar}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {interviewData.participant.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Tourist · {interviewData.participant.country} · {interviewData.participant.location}
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= interviewData.participant.rating
                              ? "fill-orange-400 text-orange-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-16 bg-gray-200"></div>

                  <div className="hidden sm:flex gap-6 text-center">
                    <div className="min-w-[60px]">
                      <p className="text-3xl font-bold text-purple-600">{animatedStats.features}</p>
                      <p className="text-xs text-gray-500 mt-1">Features<br/>Shown</p>
                    </div>
                    <div className="w-px h-16 bg-gray-200"></div>
                    <div className="min-w-[60px]">
                      <p className="text-3xl font-bold text-purple-600">{animatedStats.suggestions}</p>
                      <p className="text-xs text-gray-500 mt-1">Suggestion<br/>Made</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Features Covered</p>
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-8">
              What we walked him through
            </h2>

            <div className="space-y-3">
              {interviewData.features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`p-4 rounded-2xl transition-all duration-300 hover:shadow-md ${
                    feature.status === "His Pick"
                      ? "bg-purple-50 border border-purple-200"
                      : "bg-white border border-gray-100"
                  }`}
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      feature.status === "His Pick"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-900 text-white"
                    }`}>
                      {iconMap[feature.icon]}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>

                    <Badge
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        feature.status === "His Pick"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {feature.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Proof</p>
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-8">
              Watch the interview
            </h2>

            <div 
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gray-900 cursor-pointer group"
              onClick={() => setIsVideoPlaying(true)}
            >
              {!isVideoPlaying ? (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${interviewData.video.id}/maxresdefault.jpg`}
                    alt={interviewData.video.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </>
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${interviewData.video.id}?autoplay=1`}
                  title={interviewData.video.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-4 text-center">
              {interviewData.video.caption}
            </p>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {interviewData.highlights.map((highlight, index) => (
              <div
                key={highlight.title}
                className={`p-6 rounded-3xl transition-all duration-300 hover:shadow-lg ${
                  highlight.type === "key-moment"
                    ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-white"
                    : "bg-white border border-gray-100"
                }`}
                style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  highlight.type === "key-moment"
                    ? "bg-white/20"
                    : "bg-green-100"
                }`}>
                  {highlight.type === "key-moment" ? (
                    <span className="text-white">{iconMap[highlight.icon]}</span>
                  ) : (
                    <span className="text-green-600">{iconMap[highlight.icon]}</span>
                  )}
                </div>

                <p className={`text-xs font-semibold mb-2 ${
                  highlight.type === "key-moment" ? "text-orange-300" : "text-green-600"
                }`}>
                  {highlight.type === "key-moment" ? "Key Moment" : "User Suggestion"}
                </p>

                <h3 className={`text-lg font-semibold mb-3 ${
                  highlight.type === "key-moment" ? "text-white" : "text-gray-900"
                }`}>
                  {highlight.title}
                </h3>

                <p className={`text-sm leading-relaxed ${
                  highlight.type === "key-moment" ? "text-white/80" : "text-gray-500"
                }`}>
                  {highlight.description}
                </p>

                {highlight.tag && (
                  <Badge className={`mt-4 px-3 py-1 rounded-full text-xs font-medium ${
                    highlight.type === "key-moment"
                      ? "bg-orange-500 text-white"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {highlight.tag}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src={gonepallogo}
                alt="GoNepal"
                className="h-6 w-auto"
                style={{ filter: "sepia(100%) saturate(300%) brightness(110%) hue-rotate(-10deg)" }}
              />
              <span className="text-sm font-medium text-gray-500">
                Field research · Phewa Tal Lakeside, Pokhara
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                  Home
                </Button>
              </Link>
              <Link to="/field-interview">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                  View Full Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
