import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIModelManager {
  callGemini(prompt: string): Promise<string>;
  callOpenAI(prompt: string): Promise<string>;
  callMistral(prompt: string): Promise<string>;
}

class AIModelManager implements AIModelManager {
  private geminiKey: string;
  private openaiKey: string;
  private mistralKey: string;

  constructor(geminiKey: string, openaiKey: string, mistralKey: string) {
    this.geminiKey = geminiKey;
    this.openaiKey = openaiKey;
    this.mistralKey = mistralKey;
  }

  async callGemini(prompt: string): Promise<string> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.candidates[0].content.parts[0].text;
      }
      return `Gemini API Error: ${response.status}`;
    } catch (e) {
      return `Gemini Error: ${e.message}`;
    }
  }

  async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.choices[0].message.content;
      }
      return `OpenAI API Error: ${response.status}`;
    } catch (e) {
      return `OpenAI Error: ${e.message}`;
    }
  }

  async callMistral(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.mistralKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistral-tiny',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.choices[0].message.content;
      }
      return `Mistral API Error: ${response.status}`;
    } catch (e) {
      return `Mistral Error: ${e.message}`;
    }
  }
}

class ResumeAnalyzer {
  private aiManager: AIModelManager;

  constructor(aiManager: AIModelManager) {
    this.aiManager = aiManager;
  }

  async generateIdealResume(company: string, jobRole: string): Promise<string> {
    const prompt = `
    Generate a highly optimized, professional resume for the position of ${jobRole} at ${company}.
    
    This should be a comprehensive, detailed resume that includes:
    1. Professional Summary
    2. Key Skills and Technologies
    3. Work Experience with quantified achievements
    4. Education and Certifications
    5. Projects and Technical Expertise
    6. Industry-specific keywords
    
    Make it specific to ${company}'s requirements and ${jobRole} expectations.
    Format it as a complete, professional resume.
    `;
    
    try {
      return await this.aiManager.callGemini(prompt);
    } catch {
      try {
        return await this.aiManager.callOpenAI(prompt);
      } catch {
        return "Unable to generate ideal resume - API connection failed";
      }
    }
  }

  async evaluateResume(userResume: string, idealResume: string, company: string, jobRole: string) {
    const prompt = `
    You are an expert resume analyst. Compare the user's resume against the ideal resume for ${jobRole} at ${company}.
    
    USER RESUME:
    ${userResume}
    
    IDEAL RESUME (BENCHMARK):
    ${idealResume}
    
    Please provide:
    1. OVERALL SCORE (0-100): Rate the user's resume against the ideal
    2. SPECIFIC GAPS: List 3-5 specific areas where the user's resume is lacking
    3. MISSING KEYWORDS: Important keywords missing from user's resume
    4. RECOMMENDATIONS: 3-4 actionable improvement suggestions
    
    Format your response as:
    SCORE: [number]
    GAPS: [list of gaps]
    MISSING_KEYWORDS: [list of keywords]
    RECOMMENDATIONS: [list of recommendations]
    `;

    const evaluations = [];
    
    try {
      const geminiResult = await this.aiManager.callGemini(prompt);
      evaluations.push(['gemini', geminiResult]);
    } catch (e) {
      console.log('Gemini evaluation failed:', e);
    }
    
    try {
      const openaiResult = await this.aiManager.callOpenAI(prompt);
      evaluations.push(['openai', openaiResult]);
    } catch (e) {
      console.log('OpenAI evaluation failed:', e);
    }
    
    try {
      const mistralResult = await this.aiManager.callMistral(prompt);
      evaluations.push(['mistral', mistralResult]);
    } catch (e) {
      console.log('Mistral evaluation failed:', e);
    }
    
    return evaluations;
  }

  parseEvaluation(evaluationText: string) {
    try {
      const scoreMatch = evaluationText.match(/SCORE:\s*(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
      
      const gapsMatch = evaluationText.match(/GAPS:\s*(.*?)(?=MISSING_KEYWORDS|$)/s);
      const gaps = gapsMatch ? gapsMatch[1].trim() : "No specific gaps identified";
      
      const keywordsMatch = evaluationText.match(/MISSING_KEYWORDS:\s*(.*?)(?=RECOMMENDATIONS|$)/s);
      const keywords = keywordsMatch ? keywordsMatch[1].trim() : "No missing keywords identified";
      
      const recommendationsMatch = evaluationText.match(/RECOMMENDATIONS:\s*(.*?)$/s);
      const recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : "No recommendations available";
      
      return {
        score,
        gaps,
        keywords,
        recommendations
      };
    } catch (e) {
      return {
        score: 50,
        gaps: "Analysis parsing error",
        keywords: "Error extracting keywords",
        recommendations: "Error generating recommendations"
      };
    }
  }

  aggregateScores(evaluations: Array<[string, string]>) {
    const scores = [];
    const parsedEvaluations = [];
    
    for (const [model, evaluation] of evaluations) {
      const parsed = this.parseEvaluation(evaluation);
      scores.push(parsed.score);
      parsedEvaluations.push([model, parsed]);
    }
    
    if (scores.length === 0) {
      return [50, parsedEvaluations];
    }
    
    const finalScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return [Math.min(100, Math.max(0, finalScore)), parsedEvaluations];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company, jobRole, resumeText, analysisId } = await req.json();

    console.log('Starting analysis for:', { company, jobRole, analysisId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get API keys
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const mistralKey = Deno.env.get('MISTRAL_API_KEY');

    if (!geminiKey || !openaiKey || !mistralKey) {
      throw new Error('Missing required API keys');
    }

    // Initialize AI manager and analyzer
    const aiManager = new AIModelManager(geminiKey, openaiKey, mistralKey);
    const analyzer = new ResumeAnalyzer(aiManager);

    // Update progress - Generating ideal resume
    await supabase.from('analysis_progress').insert({
      analysis_id: analysisId,
      step: 'generating_ideal_resume',
      progress: 25,
      status: 'in_progress',
      message: 'Generating ideal resume benchmark...'
    });

    console.log('Generating ideal resume...');
    const idealResume = await analyzer.generateIdealResume(company, jobRole);

    // Update progress - Evaluating resume
    await supabase.from('analysis_progress').insert({
      analysis_id: analysisId,
      step: 'evaluating_resume',
      progress: 50,
      status: 'in_progress',
      message: 'Multi-AI evaluation in progress...'
    });

    console.log('Evaluating resume...');
    const evaluations = await analyzer.evaluateResume(resumeText, idealResume, company, jobRole);

    // Update progress - Calculating scores
    await supabase.from('analysis_progress').insert({
      analysis_id: analysisId,
      step: 'calculating_scores',
      progress: 75,
      status: 'in_progress',
      message: 'Calculating final scores...'
    });

    console.log('Aggregating scores...');
    const [finalScore, parsedEvaluations] = analyzer.aggregateScores(evaluations);
    const displayScore = Math.round(finalScore / 10 * 10) / 10;

    // Store final results
    const analysisData = {
      final_score: finalScore,
      display_score: displayScore,
      ideal_resume: idealResume,
      evaluations: parsedEvaluations
    };

    await supabase.from('resume_analyses').update({
      ideal_resume: idealResume,
      final_score: finalScore,
      display_score: displayScore,
      analysis_data: analysisData
    }).eq('id', analysisId);

    // Update progress - Complete
    await supabase.from('analysis_progress').insert({
      analysis_id: analysisId,
      step: 'complete',
      progress: 100,
      status: 'completed',
      message: 'Analysis complete!'
    });

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysisId,
      finalScore,
      displayScore,
      idealResume,
      evaluations: parsedEvaluations
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    
    // Update progress with error
    const { analysisId } = await req.json().catch(() => ({}));
    if (analysisId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase.from('analysis_progress').insert({
          analysis_id: analysisId,
          step: 'error',
          progress: 0,
          status: 'error',
          message: error.message
        });
      } catch (e) {
        console.error('Error updating progress:', e);
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});