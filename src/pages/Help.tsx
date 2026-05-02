import { Link } from "react-router-dom";
import { ArrowLeft, LifeBuoy, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Help = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container px-4 h-16 flex items-center justify-between mx-auto max-w-5xl">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">GoNepal Help Center</span>
          </div>
        </div>
      </header>

      <main className="container px-4 py-12 md:py-20 mx-auto max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions and get support for your journey.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section className="bg-muted/30 border border-border/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <HelpCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Frequently Asked Questions</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p><strong>How do I use the Offline Toolkit?</strong> The Trekker's Offline Toolkit allows you to cache essential travel information including weather forecasts, emergency phrases, and maps for use without internet connectivity.</p>
                  <p><strong>What is the Digital Tourist ID?</strong> The Digital Tourist ID is a secure, blockchain-verified identity document for international travelers in Nepal.</p>
                  <p><strong>How accurate are the AI travel recommendations?</strong> Our AI Trip Planner uses current data, but travel conditions can change rapidly in the Himalayas.</p>
                  <p><strong>Can I access GoNepal without creating an account?</strong> Yes, many features are available without an account.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-start gap-4">
              <MessageCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground border-b border-border/50 pb-2">Contact Support</h2>
                <p className="text-muted-foreground leading-relaxed">Need further assistance? Our support team is here to help.</p>
                <div className="bg-background/50 border border-border/50 rounded-xl p-4 mt-4 space-y-3">
                  <p className="text-muted-foreground"><strong className="text-foreground">Email:</strong> support@gonepal.app</p>
                  <p className="text-muted-foreground"><strong className="text-foreground">Emergency Hotline:</strong> +977-1-4242424</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Emergency Resources</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Police:</strong> 100</li>
              <li><strong>Ambulance:</strong> 102</li>
              <li><strong>Tourist Police:</strong> +977-1-4247041</li>
            </ul>
          </section>
        </div>

        <div className="mt-16 flex justify-center">
          <Link to="/"><Button variant="outline" size="lg" className="rounded-full shadow-sm">Return to GoNepal</Button></Link>
        </div>
      </main>
    </div>
  );
};

export default Help;
