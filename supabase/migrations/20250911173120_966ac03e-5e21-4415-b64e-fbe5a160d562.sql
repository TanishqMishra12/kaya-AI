-- Create tables for resume analysis
CREATE TABLE public.resume_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  company TEXT NOT NULL,
  job_role TEXT NOT NULL,
  filename TEXT,
  resume_text TEXT NOT NULL,
  ideal_resume TEXT,
  final_score DECIMAL,
  display_score DECIMAL,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for resume analyses
CREATE POLICY "Anyone can create resume analyses" 
ON public.resume_analyses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view resume analyses" 
ON public.resume_analyses 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_resume_analyses_updated_at
BEFORE UPDATE ON public.resume_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for storing analysis progress
CREATE TABLE public.analysis_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for analysis_progress
ALTER TABLE public.analysis_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for analysis progress
CREATE POLICY "Anyone can view analysis progress" 
ON public.analysis_progress 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create analysis progress" 
ON public.analysis_progress 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update analysis progress" 
ON public.analysis_progress 
FOR UPDATE 
USING (true);