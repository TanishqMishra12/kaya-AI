import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Building2, 
  Brain, 
  FileText, 
  Target, 
  Award,
  ArrowRight,
  Loader
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();
  const steps = [
    {
      icon: Building2,
      title: "Select Company & Role",
      description: "Choose your target company and up to 3 desired job roles from our comprehensive database.",
      step: "01"
    },
    {
      icon: Upload,
      title: "Upload Resume",
      description: "Upload your current resume or use our test resume builder to get started immediately.",
      step: "02"
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our multi-LLM ensemble analyzes your resume using advanced AI models for comprehensive evaluation.",
      step: "03"
    },
    {
      icon: FileText,
      title: "Ideal Resume Generation",
      description: "AI creates an optimized sample resume tailored to your target role as a performance benchmark.",
      step: "04"
    },
    {
      icon: Target,
      title: "Gap Analysis",
      description: "Detailed identification of lacking areas with specific improvement recommendations and scoring.",
      step: "05"
    },
    {
      icon: Award,
      title: "Actionable Insights",
      description: "Receive personalized recommendations for courses, certifications, and skills to advance your career.",
      step: "06"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Loader className="w-4 h-4 mr-2 text-accent animate-spin" />
            <span className="text-sm font-medium text-accent">Smart Process</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            <span className="text-foreground font-light">How </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Kaya AI
            </span>
            <span className="text-foreground font-light"> Works</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Our intelligent 14-step process transforms your resume into a career optimization powerhouse 
            using enterprise-grade AI technology and industry expertise.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Process Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-elegant group backdrop-blur-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-xs font-bold text-primary">{step.step}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Visual Flow */}
          <div className="relative">
            <div className="bg-gradient-card rounded-3xl p-8 border border-primary/10 shadow-elegant backdrop-blur-sm">
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent tracking-tight">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-muted-foreground font-light">
                    Multi-stage intelligent processing for optimal results
                  </p>
                </div>

                {/* Flow visualization */}
                <div className="space-y-4">
                  {[
                    { label: "Input Processing", progress: "100%" },
                    { label: "AI Ensemble Analysis", progress: "85%" },
                    { label: "Score Calculation", progress: "70%" },
                    { label: "Recommendation Engine", progress: "45%" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-medium">{item.label}</span>
                        <span className="text-primary">{item.progress}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: item.progress }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-4">
                  <Button variant="ai" className="group">
                    Try Demo Analysis
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-accent/20 blur-xl animate-pulse delay-1000" />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-12 bg-gradient-card border-primary/20 shadow-elegant inline-block rounded-3xl backdrop-blur-sm">
            <h3 className="text-3xl font-bold mb-4 tracking-tight">
              Ready to Transform Your Career?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md font-light text-lg">
              Join thousands of professionals who have optimized their resumes with Kaya AI
            </p>
            <Button variant="hero" size="lg" className="group px-8 py-4" onClick={() => navigate("/get-started")}>
              Start Your Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;