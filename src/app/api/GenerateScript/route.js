import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { ENV_CONFIG } from "@/lib/envConfig";
const GenerateScriptRequest = z.object({
  parsedResume: z.string().min(10, "Resume content must be at least 10 characters").max(50000, "Resume content too large")
});
const ScriptResponse = z.object({
  script: z.string().min(50, "Script too short").max(1000, "Script too long"),
  source: z.enum(["ai_generated", "fallback"]),
  analysis: z.object({
    hasPlaceholders: z.boolean(),
    severity: z.enum(["low", "medium", "high"]),
    count: z.number()
  }).optional()
});
const initializeAI = () => {
  const apiKey = ENV_CONFIG.server.gemini.apiKey;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
};
class ContentCleaner {
  static cleanScript(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    let cleaned = text
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links
      .replace(/---+/g, '') // Remove horizontal rules
      .replace(/\*\*\*+/g, '') // Remove asterisk separators
      .replace(/####+/g, '') // Remove hash separators
    cleaned = cleaned
      .replace(/[*#`_~\[\](){}]/g, '') // Remove special markdown chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\.{3,}/g, '...') // Normalize ellipsis
      .replace(/!{2,}/g, '!') // Normalize exclamation marks
      .replace(/\?{2,}/g, '?') // Normalize question marks
    cleaned = cleaned
      .replace(/[jk]+[b]+[jk]*/gi, '') // Remove placeholder patterns
      .replace(/bkjb|kjbkjb|jbkb|bjkb/gi, '') // Remove specific corrupted text
      .replace(/lorem\s+ipsum/gi, '') // Remove lorem ipsum
      .replace(/placeholder/gi, '') // Remove placeholder text
      .replace(/\b[a-z]{20,}\b/gi, '') // Remove very long nonsensical words
    cleaned = cleaned
      .replace(/\s+([.!?])/g, '$1') // Fix spacing before punctuation
      .replace(/([.!?])\s*([a-z])/g, '$1 $2') // Fix spacing after punctuation
      .replace(/\s+/g, ' ') // Final whitespace cleanup
      .trim();
    return cleaned;
  }
  static validateScriptContent(text) {
    if (!text || text.length < 50) {
      return { isValid: false, reason: "Script too short" };
    }
    if (text.length > 1000) {
      return { isValid: false, reason: "Script too long" };
    }
    const corruptedPatterns = [
      /[*#`_~]{3,}/g, // Multiple special characters
      /\b[jk]{3,}b[jk]*\b/gi, // Placeholder patterns
      /\b[a-z]{15,}\b/gi, // Very long nonsensical words
      /[.!?]{3,}/g // Multiple punctuation
    ];
    for (const pattern of corruptedPatterns) {
      if (pattern.test(text)) {
        return { isValid: false, reason: "Script contains corrupted content" };
      }
    }
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 30) {
      return { isValid: false, reason: "Script has too few words" };
    }
    return { isValid: true };
  }
}
class ResumeValidator {
  static validateResumeData(parsedResume) {
    try {
      GenerateScriptRequest.parse({ parsedResume });
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error.errors?.[0]?.message || "Invalid resume data format"
      };
    }
  }
  static detectPlaceholderContent(text) {
    const placeholderPatterns = [
      /[jk]+[b]+[jk]*/gi,
      /bkjb|kjbkjb|jbkb|bjkb/gi,
      /lorem\s+ipsum/gi,
      /placeholder/gi,
      /\b[a-z]{20,}\b/gi // Very long nonsensical words
    ];
    let placeholderCount = 0;
    placeholderPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      placeholderCount += matches.length;
    });
    return {
      hasPlaceholders: placeholderCount > 0,
      severity: placeholderCount > 5 ? 'high' : placeholderCount > 2 ? 'medium' : 'low',
      count: placeholderCount
    };
  }
  static extractValidInformation(text) {
    const extractors = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
      name: /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/m,
      skills: /(?:skills?|technologies?|tools?)[\s:]*([^\n]+)/gi,
      experience: /(?:experience|work|employment)[\s:]*([^\n]+)/gi
    };
    const extracted = {};
    Object.entries(extractors).forEach(([key, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        extracted[key] = key === 'name' ? matches[0] : matches;
      }
    });
    return extracted;
  }
}
class ScriptGenerator {
  constructor(model) {
    this.model = model;
    this.maxRetries = 3;
    this.baseDelay = 1000;
  }
  async generateWithRetry(prompt) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        const rawText = this.extractTextFromResponse(response);
        const cleanedText = ContentCleaner.cleanScript(rawText);
        const validation = ContentCleaner.validateScriptContent(cleanedText);
        if (!validation.isValid) {
          throw new Error(`Generated script validation failed: ${validation.reason}`);
        }
        return cleanedText;
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
  extractTextFromResponse(response) {
    const extractionStrategies = [
      () => response.response?.text?.(),
      () => response.response?.candidates?.[0]?.content?.parts?.[0]?.text,
      () => response.text?.(),
      () => response.candidates?.[0]?.content?.parts?.[0]?.text
    ];
    for (const strategy of extractionStrategies) {
      try {
        const text = strategy();
        if (text && typeof text === 'string' && text.trim().length > 0) {
          return text.trim();
        }
      } catch (error) {
        continue;
      }
    }
    throw new Error("Failed to extract text from AI response");
  }
  createProfessionalPrompt(resumeData, extractedInfo) {
    return `You are a professional video script writer. Create a clean, professional 30-40 second video resume script.
IMPORTANT RULES:
1. Write ONLY clean, natural speech - no markdown, asterisks, or special formatting
2. No stage directions, camera instructions, or technical notes
3. Just write what the person should say directly
4. Keep it conversational and professional
5. 30-40 seconds when spoken (approximately 75-100 words)
RESUME DATA:
${resumeData}
EXTRACTED INFO:
Name: ${extractedInfo.name?.[0] || 'Professional'}
Skills: ${extractedInfo.skills?.join(', ') || 'Various technologies'}
Email: ${extractedInfo.email?.[0] || ''}
Write a clean script that sounds natural when spoken. Start with a greeting and name, mention key skills, and end with a call to action. NO FORMATTING, just the words to speak:`;
  }
  createFallbackScript(extractedInfo) {
    const name = extractedInfo.name?.[0] || "I";
    const email = extractedInfo.email?.[0] || "";
    const skills = extractedInfo.skills?.slice(0, 2).join(" and ") || "various technologies";
    return `Hi, ${name === "I" ? "I'm a dedicated software professional" : `I'm ${name}`} with expertise in ${skills}. I have a proven track record of delivering high-quality solutions and I'm passionate about creating innovative applications. I bring strong technical skills and collaborative leadership to every project. ${email ? `You can reach me at ${email}. ` : ""}I'm excited to discuss how I can contribute to your team and help drive meaningful results.`;
  }
}
export async function POST(req) {
  try {
    const body = await req.json();
    const validation = ResumeValidator.validateResumeData(body.parsedResume);
    if (!validation.isValid) {
      return Response.json({
        error: validation.error,
        code: "INVALID_INPUT"
      }, { status: 400 });
    }
    const { parsedResume } = body;

    const placeholderAnalysis = ResumeValidator.detectPlaceholderContent(parsedResume);
    const extractedInfo = ResumeValidator.extractValidInformation(parsedResume);
    if (placeholderAnalysis.severity === 'high') {
      const generator = new ScriptGenerator();
      const fallbackScript = generator.createFallbackScript(extractedInfo);
      try {
        const validatedResponse = ScriptResponse.parse({
          script: fallbackScript,
          source: "fallback",
          analysis: placeholderAnalysis
        });
        return Response.json(validatedResponse);
      } catch (validationError) {
        return Response.json({
          error: "Script generation failed validation",
          code: "VALIDATION_ERROR"
        }, { status: 500 });
      }
    }
    const genAI = initializeAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const generator = new ScriptGenerator(model);
    const prompt = generator.createProfessionalPrompt(parsedResume, extractedInfo);
    const script = await generator.generateWithRetry(prompt);

    try {
      const validatedResponse = ScriptResponse.parse({
        script,
        source: "ai_generated",
        analysis: placeholderAnalysis
      });
      return Response.json(validatedResponse);
    } catch (validationError) {
      const generator2 = new ScriptGenerator();
      const fallbackScript = generator2.createFallbackScript(extractedInfo);
      const validatedFallback = ScriptResponse.parse({
        script: fallbackScript,
        source: "fallback",
        analysis: placeholderAnalysis
      });
      return Response.json(validatedFallback);
    }
  } catch (error) {
    if (error.message.includes("GEMINI_API_KEY")) {
      return Response.json({
        error: "AI service configuration error",
        code: "CONFIG_ERROR"
      }, { status: 500 });
    }
    if (error.message.includes("Failed to extract text")) {
      return Response.json({
        error: "AI response processing error",
        code: "PROCESSING_ERROR"
      }, { status: 502 });
    }
    if (error.name === "ZodError") {
      return Response.json({
        error: "Data validation error",
        code: "VALIDATION_ERROR",
        details: error.errors
      }, { status: 400 });
    }
    return Response.json({
      error: "Script generation service temporarily unavailable",
      code: "SERVICE_ERROR",
      message: error.message
    }, { status: 503 });
  }
}
