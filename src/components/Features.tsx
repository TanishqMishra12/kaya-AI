import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Target, 
  FileText, 
  Users, 
  Award, 
  Zap,
  BarChart3,
  BookOpen,
  CheckCircle
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Multi-LLM Analysis",
      description: "Advanced AI ensemble using Gemini, ChatGPT, Grok, and Claude for comprehensive resume evaluation.",
      color: "text-primary"
    },
    {
      icon: Target,
      title: "Role-Specific Optimization",
      description: "Tailored analysis for specific job roles and companies to maximize your application success.",
      color: "text-accent"
    },
    {
      icon: BarChart3,
      title: "Intelligent Scoring",
      description: "Sophisticated 10-point scoring system with outlier detection and adaptive learning capabilities.",
      color: "text-primary"
    },
    {
      icon: FileText,
      title: "Ideal Resume Generation",
      description: "AI-generated sample resumes optimized for your target role as a benchmark for improvement.",
      color: "text-accent"
    },
    {
      icon: BookOpen,
      title: "Personalized Recommendations",
      description: "Actionable suggestions for courses, certifications, and skills to bridge identified gaps.",
      color: "text-primary"
    },
    {
      icon: CheckCircle,
      title: "Gap Analysis",
      description: "Detailed identification of lacking areas with specific improvement pathways.",
      color: "text-accent"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium text-primary">Advanced AI Features</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Intelligent Career
            </span>
            <br />
            <span className="text-foreground font-light">Optimization</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Leverage enterprise-grade AI technology to transform your resume into a powerful 
            career advancement tool with precision analysis and personalized insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="p-8 bg-gradient-card border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-elegant group backdrop-blur-sm"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { number: "4", label: "AI Models", suffix: "+" },
            { number: "14", label: "Step Process", suffix: "" },
            { number: "10", label: "Point Scale", suffix: "" },
            { number: "100", label: "Precision Score", suffix: "%" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                {stat.number}{stat.suffix}
              </div>
              <div className="text-muted-foreground text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;