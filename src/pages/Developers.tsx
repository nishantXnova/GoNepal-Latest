import { Link } from "react-router-dom";
import { ArrowLeft, Code, Github, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const Developers = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container px-4 h-16 flex items-center justify-between mx-auto max-w-5xl">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">GoNepal Developers</span>
          </div>
        </div>
      </header>

      <main className="container px-4 py-12 md:py-20 mx-auto max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            Developer Resources
          </h1>
          <p className="text-xl text-muted-foreground">
            Documentation and technical resources for the GoNepal platform.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section className="bg-muted/30 border border-border/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <Rocket className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Platform Architecture</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">GoNepal is a PWA built with modern web technologies for seamless travel experiences.</p>
                <div className="space-y-4">
                  <div className="bg-background/50 border border-border/50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Frontend Stack</h3>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                      <li>React 18 with TypeScript</li>
                      <li>Vite, Tailwind CSS, shadcn/ui</li>
                      <li>React Router DOM, Zod validation</li>
                    </ul>
                  </div>
                  <div className="bg-background/50 border border-border/50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Backend & Services</h3>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                      <li>Supabase (PostgreSQL, RLS)</li>
                      <li>Edge Functions, OpenStreetMap</li>
                      <li>Open-Meteo weather, local-first PWA</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-start gap-4">
              <Github className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground border-b border-border/50 pb-2">Repository & Contributing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">GoNepal is open-source. We welcome community contributions.</p>
                <div className="bg-background/50 border border-border/50 rounded-xl p-4">
                  <div className="flex flex-wrap gap-4">
                    <Button asChild><a href="https://github.com/gonepal/gonepal-platform" target="_blank" rel="noreferrer"><Github className="w-4 h-4 mr-2" />GitHub Repository</a></Button>
                    <Button variant="outline" asChild><a href="https://github.com/gonepal/gonepal-platform/issues" target="_blank" rel="noreferrer">Report Issue</a></Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-3"><p><strong>License:</strong> MIT (Frontend), AGPL-3.0 (Backend)</p></div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-start gap-4">
              <Users className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground border-b border-border/50 pb-2">Development Setup</h2>
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Prerequisites</h3>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                      <li>Node.js 18+, Git, Supabase CLI</li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Quick Start</h3>
                    <ol className="list-decimal pl-6 space-y-2 text-muted-foreground text-sm">
                      <li>Clone repo: git clone [repo-url]</li>
                      <li>npm install</li>
                      <li>Configure .env.local</li>
                      <li>npm run dev</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">API Documentation</h2>
            <div className="bg-background/80 border rounded-xl p-4">
              <h3 className="font-semibold mb-2">Key Endpoints</h3>
              <div className="space-y-1 text-sm text-muted-foreground font-mono">
                <p>GET /api/v1/destinations</p>
                <p>GET /api/v1/trails/:id</p>
                <p>POST /api/v1/itinerary/generate</p>
                <p>POST /api/v1/kyc/verify</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-16 flex justify-center">
          <Link to="/"><Button variant="outline" size="lg" className="rounded-full shadow-sm">Return to GoNepal</Button></Link>
        </div>
      </main>
    </div>
  );
};

export default Developers;
