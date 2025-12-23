import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-ai.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-8" />
      
      {/* Professional grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Brain className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Career Intelligence</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-black">
                <span className="text-black">
                  Kaya AI
                </span>
                <br />
                <span className="text-black font-light">Career Navigator</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg font-light">
                Transform your resume with enterprise-grade AI analysis. Get personalized recommendations, 
                identify skill gaps, and create the perfect resume for your dream role.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Smart Analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm font-medium">Instant Results</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="group"
                onClick={() => navigate("/get-started")}
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Multi-LLM Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Industry Optimized</span>
              </div>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elegant border border-primary/10 backdrop-blur-sm">
              <img 
                src={heroImage} 
                alt="AI Career Analytics Dashboard" 
                className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-accent/20 blur-xl animate-pulse delay-1000" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;