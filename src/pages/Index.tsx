import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import PlanTrip from "@/components/PlanTrip";
import Categories from "@/components/Categories";
import Destinations from "@/components/Destinations";
import SeasonalHighlights from "@/components/SeasonalHighlights";
import FlightBooking from "@/components/FlightBooking";
import Partners from "@/components/Partners";
import TravelInfo from "@/components/TravelInfo";
import CurrencyConverter from "@/components/CurrencyConverter";
import LanguageTranslator from "@/components/LanguageTranslator";
import Footer from "@/components/Footer";
import NearbyPlaces from "@/components/NearbyPlaces";
import { Loader2, MapPin, User, Download, Check, X, Sparkles, Globe, Shield, Cloud, Languages } from "lucide-react";

// Lazy load heavy components
const AIChatbot = lazy(() => import("@/components/AIChatbot"));

// Skeleton for chatbot loading
const ChatbotSkeleton = () => (
  <div className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary/10 animate-pulse" />
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <StatsBar />
      
      {/* How It Works - Simple 3 step section */}
      <section className="section-padding bg-secondary/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-section text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Get started with GoNepal in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">1. Download the PWA</h3>
              <p className="text-sm text-muted-foreground">Install as an app for offline access</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">2. Create your Tourist ID</h3>
              <p className="text-sm text-muted-foreground">Digital ID that works without internet</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">3. Explore with offline maps</h3>
              <p className="text-sm text-muted-foreground">Navigate even on the most remote trails</p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />
      <PlanTrip />
      <div className="section-divider" />

      {/* Why GoNepal vs The Competition */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-section text-foreground mb-4">Why GoNepal?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every tourist in Nepal carries 4–6 apps and still falls through the gaps. 
              GoNepal replaces all of them with one platform built specifically for Nepal.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-orange-600 bg-orange-50/50 rounded-t-lg">GoNepal</th>
                  <th className="text-center py-4 px-4 text-muted-foreground">Maps.me</th>
                  <th className="text-center py-4 px-4 text-muted-foreground">HoneyGuide</th>
                  <th className="text-center py-4 px-4 text-muted-foreground">Google</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground font-medium">Full offline functionality</td>
                  <td className="py-3 px-4 text-center bg-orange-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-500"><X className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground font-medium">Entire app in your language</td>
                  <td className="py-3 px-4 text-center bg-orange-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /><span className="text-xs block">22 languages</span></td>
                  <td className="py-3 px-4 text-center text-red-500"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-500"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground font-medium">AI trip planning</td>
                  <td className="py-3 px-4 text-center bg-orange-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-600"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-600"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-600"><X className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">Weather-aware planning</td>
                  <td className="py-3 px-4 text-center bg-orange-50/30"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-400"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-400"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">Digital Tourist ID</td>
                  <td className="py-3 px-4 text-center bg-orange-50/30"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-400"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-400"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-400"><X className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">Emergency SOS toolkit</td>
                  <td className="py-3 px-4 text-center bg-orange-50/30"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-400"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-400"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-400"><X className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">Flight + hotel booking</td>
                  <td className="py-3 px-4 text-center bg-orange-50/30"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-red-400"><X className="w-5 h-5 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">All Nepal in one app</td>
                  <td className="py-3 px-4 text-center bg-orange-50/30"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-orange-600 font-medium">Partial</td>
                  <td className="py-3 px-4 text-center text-red-600 font-medium">Paid</td>
                  <td className="py-3 px-4 text-center text-amber-500">Partial</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-foreground font-medium">Free access</td>
                  <td className="py-3 px-4 text-center bg-orange-50/30 font-semibold text-green-600">Free</td>
                  <td className="py-3 px-4 text-center">Free</td>
                  <td className="py-3 px-4 text-center text-red-400">Paid</td>
                  <td className="py-3 px-4 text-center">Free</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Other apps were built for the world and happen to work in Nepal. <span className="text-orange-600 font-medium">GoNepal was built for Nepal.</span>
          </p>
        </div>
      </section>

      <div className="section-divider" />
      <Categories />
      <Destinations />
      <SeasonalHighlights />
      <div className="section-divider" />
      <FlightBooking />
      <CurrencyConverter />
      <LanguageTranslator />
      <div className="section-divider" />
      <Partners />
      <TravelInfo />
      <NearbyPlaces />
      <Footer />
      <Suspense fallback={<ChatbotSkeleton />}>
        <AIChatbot />
      </Suspense>
    </div>
  );
};

export default Index;
