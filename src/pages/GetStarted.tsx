import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, BriefcaseIcon, Upload, FileText, Brain, Loader, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { saveAs } from 'file-saver';

const formSchema = z.object({
  company: z.string().min(1, "Please select a company"),
  jobRole: z.string().min(1, "Please select a job role"),
});

type FormValues = z.infer<typeof formSchema>;

interface AnalysisResult {
  id: string;
  final_score: number;
  display_score: number;
  ideal_resume: string;
  analysis_data: any;
}

interface ProgressStep {
  step: string;
  progress: number;
  status: string;
  message: string;
}

const GetStarted = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [testResumeData, setTestResumeData] = useState({
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-0123",
    summary: "Experienced software engineer with 3+ years in full-stack development",
    experience: "Software Engineer at ABC Corp (2021-2024)\n- Developed web applications using React and Node.js\n- Improved system performance by 25%",
    education: "BS Computer Science, University of Technology (2017-2021)",
    skills: "JavaScript, Python, React, Node.js, SQL, Git"
  });
  const [showTestResume, setShowTestResume] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      jobRole: "",
    },
  });

  const companies = [
    "Google", "Microsoft", "Amazon", "Apple", "Meta", "Tesla", "Netflix", "Spotify",
    "Uber", "Airbnb", "Stripe", "Salesforce", "Adobe", "NVIDIA", "OpenAI", "Anthropic",
    "Custom Company"
  ];

  const jobRoles = [
    "Software Engineer", "Senior Software Engineer", "Staff Software Engineer",
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Data Analyst", "Data Engineer", "ML Engineer",
    "AI Research Scientist", "DevOps Engineer", "Cloud Architect", "Security Engineer",
    "Product Manager", "Technical Product Manager", "Program Manager",
    "UX Designer", "UI Designer", "Product Designer"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // For demo purposes, return placeholder text
    // In production, you'd use a PDF parsing library
    return `Resume content from ${file.name}. This would contain the actual extracted text from the PDF file.`;
  };

  const generateTestResume = () => {
    return `${testResumeData.name}
Email: ${testResumeData.email} | Phone: ${testResumeData.phone}

PROFESSIONAL SUMMARY
${testResumeData.summary}

WORK EXPERIENCE
${testResumeData.experience}

EDUCATION
${testResumeData.education}

SKILLS
${testResumeData.skills}`;
  };

  const pollProgress = (analysisId: string) => {
    const interval = setInterval(async () => {
      const { data: progressData } = await supabase
        .from('analysis_progress')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (progressData && progressData.length > 0) {
        const latest = progressData[0];
        setCurrentProgress(latest.progress);
        setProgressMessage(latest.message);

        if (latest.status === 'completed' || latest.status === 'error') {
          clearInterval(interval);
          
          if (latest.status === 'completed') {
            // Fetch the final result
            const { data: resultData } = await supabase
              .from('resume_analyses')
              .select('*')
              .eq('id', analysisId)
              .single();

            if (resultData) {
              setAnalysisResult(resultData);
              setIsAnalyzing(false);
              toast({
                title: "Analysis Complete!",
                description: "Your resume has been analyzed successfully.",
              });
            }
          } else {
            setIsAnalyzing(false);
            toast({
              title: "Analysis Failed",
              description: latest.message,
              variant: "destructive",
            });
          }
        }
      }
    }, 2000);

    return interval;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsAnalyzing(true);
      setCurrentProgress(0);
      setProgressMessage("Preparing analysis...");

      let resumeText = "";
      let filename = "";

      if (uploadedFile) {
        resumeText = await extractTextFromPDF(uploadedFile);
        filename = uploadedFile.name;
      } else if (showTestResume) {
        resumeText = generateTestResume();
        filename = "Test Resume";
      } else {
        toast({
          title: "No Resume",
          description: "Please upload a resume or create a test resume.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Create analysis record
      const { data: analysisData, error: insertError } = await supabase
        .from('resume_analyses')
        .insert({
          company: values.company,
          job_role: values.jobRole,
          filename,
          resume_text: resumeText,
        })
        .select()
        .single();

      if (insertError || !analysisData) {
        throw new Error(insertError?.message || "Failed to create analysis record");
      }

      // Start progress polling
      const progressInterval = pollProgress(analysisData.id);

      // Call the edge function
      const { data: result, error: functionError } = await supabase.functions.invoke('analyze-resume', {
        body: {
          company: values.company,
          jobRole: values.jobRole,
          resumeText,
          analysisId: analysisData.id
        }
      });

      if (functionError) {
        clearInterval(progressInterval);
        throw new Error(functionError.message);
      }

    } catch (error: any) {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadReport = () => {
    if (!analysisResult) return;

    const report = `KAYA AI RESUME ANALYSIS REPORT
====================================

Analysis Date: ${new Date().toLocaleString()}
Position: ${form.getValues().jobRole} at ${form.getValues().company}
Resume File: ${analysisResult.id}

OVERALL SCORE: ${analysisResult.display_score}/10 (${analysisResult.final_score}/100)

DETAILED ANALYSIS:
${analysisResult.analysis_data.evaluations.map(([model, evaluation]) => `${model}: ${evaluation.score}/100`).join('\n')}

IDEAL RESUME BENCHMARK:
${analysisResult.ideal_resume}

Generated by Kaya AI - Career Navigator`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `kaya_ai_analysis_${form.getValues().company}_${form.getValues().jobRole}.txt`);
  };

  if (analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => {
              setAnalysisResult(null);
              setUploadedFile(null);
              setShowTestResume(false);
              form.reset();
            }}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Analyze Another Resume
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🎯 Analysis Results</h1>
            <p className="text-xl text-muted-foreground">
              Resume analyzed for <strong>{form.getValues().jobRole}</strong> at <strong>{form.getValues().company}</strong>
            </p>
          </div>

          {/* Score Display */}
          <Card className="mb-8 bg-gradient-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <div className="text-lg mb-4">Overall Resume Score</div>
              <div className="text-6xl font-bold mb-4">{analysisResult.display_score}/10</div>
              <div className="text-sm opacity-90">
                Based on {analysisResult.analysis_data.evaluations.length} AI model analysis
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="grid gap-6 mb-8">
            {analysisResult.analysis_data.evaluations.map(([model, evaluation], index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {model.charAt(0).toUpperCase() + model.slice(1)} Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Score:</span>
                    <span className="text-2xl font-bold">{evaluation.score}/100</span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Areas for Improvement:</h4>
                    <p className="text-muted-foreground">{evaluation.gaps}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Missing Keywords:</h4>
                    <p className="text-muted-foreground">{evaluation.keywords}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <p className="text-muted-foreground">{evaluation.recommendations}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ideal Resume */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🎯 AI-Generated Ideal Resume</CardTitle>
              <CardDescription>
                This is an optimized resume benchmark for {form.getValues().jobRole} at {form.getValues().company}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {analysisResult.ideal_resume}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={downloadReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button onClick={() => navigate("/")} variant="hero">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
              <Loader className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
            <CardTitle className="text-2xl">AI Analysis in Progress</CardTitle>
            <CardDescription>Our multi-AI ensemble is analyzing your resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progressMessage}</span>
                <span>{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
            </div>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Input Processing Complete
              </div>
              <div className="flex items-center gap-2">
                {currentProgress >= 25 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                Generating Ideal Resume
              </div>
              <div className="flex items-center gap-2">
                {currentProgress >= 50 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                Multi-AI Evaluation
              </div>
              <div className="flex items-center gap-2">
                {currentProgress >= 75 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                Score Calculation
              </div>
              <div className="flex items-center gap-2">
                {currentProgress >= 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                Generating Recommendations
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border border-primary/10 shadow-elegant backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <BriefcaseIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Get Started with Kaya AI
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Tell us about your target role and upload your resume for AI-powered analysis
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">🔑 API Keys are pre-configured and ready to use!</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-base font-medium">
                          <Building2 className="w-5 h-5 mr-2 text-primary" />
                          Target Company
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 border-border/50 bg-background/50 backdrop-blur-sm">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border-border/50 backdrop-blur-md">
                            {companies.map((company) => (
                              <SelectItem key={company} value={company}>
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-base font-medium">
                          <BriefcaseIcon className="w-5 h-5 mr-2 text-primary" />
                          Job Role
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 border-border/50 bg-background/50 backdrop-blur-sm">
                              <SelectValue placeholder="Select job role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border-border/50 backdrop-blur-md">
                            {jobRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center text-base font-medium">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Upload Resume (PDF)
                  </Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <Label
                      htmlFor="pdf-upload"
                      className="flex items-center justify-center h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-background/30 backdrop-blur-sm"
                    >
                      <div className="text-center space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <div className="text-sm">
                          {uploadedFile ? (
                            <span className="text-primary font-medium">{uploadedFile.name}</span>
                          ) : (
                            <>
                              <span className="text-foreground font-medium">Click to upload</span>
                              <span className="text-muted-foreground"> or drag and drop</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          PDF files only (Max 10MB)
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>

                {/* Test Resume Builder */}
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTestResume(!showTestResume)}
                    className="w-full"
                  >
                    📝 Alternative: Create Test Resume
                  </Button>
                  
                  {showTestResume && (
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Resume Builder</CardTitle>
                        <CardDescription>Don't have a resume? Build one quickly!</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Full Name"
                            value={testResumeData.name}
                            onChange={(e) => setTestResumeData({...testResumeData, name: e.target.value})}
                          />
                          <Input
                            placeholder="Email"
                            value={testResumeData.email}
                            onChange={(e) => setTestResumeData({...testResumeData, email: e.target.value})}
                          />
                        </div>
                        <Input
                          placeholder="Phone"
                          value={testResumeData.phone}
                          onChange={(e) => setTestResumeData({...testResumeData, phone: e.target.value})}
                        />
                        <Textarea
                          placeholder="Professional Summary"
                          value={testResumeData.summary}
                          onChange={(e) => setTestResumeData({...testResumeData, summary: e.target.value})}
                          rows={3}
                        />
                        <Textarea
                          placeholder="Work Experience"
                          value={testResumeData.experience}
                          onChange={(e) => setTestResumeData({...testResumeData, experience: e.target.value})}
                          rows={4}
                        />
                        <Textarea
                          placeholder="Education"
                          value={testResumeData.education}
                          onChange={(e) => setTestResumeData({...testResumeData, education: e.target.value})}
                          rows={2}
                        />
                        <Textarea
                          placeholder="Skills"
                          value={testResumeData.skills}
                          onChange={(e) => setTestResumeData({...testResumeData, skills: e.target.value})}
                          rows={2}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={!uploadedFile && !showTestResume}
                >
                  🔍 Analyze My Resume
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GetStarted;