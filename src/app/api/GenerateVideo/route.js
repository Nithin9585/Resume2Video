class VideoGenerationService {
  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY;
    this.baseUrl = process.env.HEYGEN_BASE_URL || 'https://api.heygen.com';
    this.maxRetries = 3;
    this.baseDelay = 2000;
    this.timeout = 30000;
  }
  validateApiKey() {
    if (!this.apiKey) {
      throw new Error("HEYGEN_API_KEY environment variable is not configured");
    }
  }
  validateRequest(data) {
    const { avatarId, voiceId, script } = data;
    const errors = [];
    if (!avatarId) errors.push("avatarId is required");
    if (!voiceId) errors.push("voiceId is required");
    if (!script) errors.push("script is required");
    if (script && script.length < 10) errors.push("script must be at least 10 characters");
    if (script && script.length > 5000) errors.push("script exceeds maximum length of 5000 characters");
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  createVideoPayload(avatarId, voiceId, script) {
    return {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: avatarId,
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: script.trim(),
            voice_id: voiceId,
          },
          background: {
            type: 'color',
            value: '#000000',
          },
        },
      ],
      dimension: {
        width: 1280,
        height: 720,
      },
      aspect_ratio: '16:9',
      callback_id: `resume_video_${Date.now()}`,
    };
  }
  async makeRequestWithRetry(url, options) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HeyGen API error (${response.status}): ${errorData.message || response.statusText}`);
        }
        return response;
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
  async generateVideo(avatarId, voiceId, script) {
    this.validateApiKey();
    const payload = this.createVideoPayload(avatarId, voiceId, script);
    
    const response = await this.makeRequestWithRetry(`${this.baseUrl}/v2/video/generate`, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Resume2Video/1.0'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!data.data?.video_id) {
      throw new Error("No video ID returned from HeyGen API");
    }
    return {
      videoId: data.data.video_id,
      status: 'initiated',
      estimatedTime: '2-3 minutes'
    };
  }
}
class ApiErrorHandler {
  static createErrorResponse(error, context = {}) {
    if (error.message.includes("HEYGEN_API_KEY")) {
      return Response.json({
        error: "Video service configuration error",
        code: "CONFIG_ERROR",
        message: "Service temporarily unavailable"
      }, { status: 500 });
    }
    if (error.message.includes("timeout") || error.message.includes("AbortError")) {
      return Response.json({
        error: "Video generation request timed out",
        code: "TIMEOUT_ERROR",
        message: "Please try again with a shorter script"
      }, { status: 408 });
    }
    if (error.message.includes("HeyGen API error")) {
      return Response.json({
        error: "Video generation service error",
        code: "EXTERNAL_API_ERROR",
        message: error.message
      }, { status: 502 });
    }
    return Response.json({
      error: "Video generation failed",
      code: "GENERATION_ERROR",
      message: "Unable to process video generation request"
    }, { status: 500 });
  }
}
export async function POST(request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    
    console.log('Received video generation request:', {
      hasAvatarId: !!avatarId,
      hasVoiceId: !!voiceId,
      scriptLength: script?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    const { avatarId, voiceId, script } = body;
    const videoService = new VideoGenerationService();
    const validation = videoService.validateRequest({ avatarId, voiceId, script });
    if (!validation.isValid) {
      return Response.json({
        error: "Invalid request parameters",
        code: "VALIDATION_ERROR",
        details: validation.errors
      }, { status: 400 });
    }
    const result = await videoService.generateVideo(avatarId, voiceId, script);
    const processingTime = Date.now() - startTime;
    
    console.log('Video generation completed:', {
      videoId: result.videoId,
      processingTime: `${processingTime}ms`
    });
    
    return Response.json({
      success: true,
      video_id: result.videoId,
      status: result.status,
      estimated_completion: result.estimatedTime,
      processing_time: processingTime
    }, { status: 200 });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    return ApiErrorHandler.createErrorResponse(error, {
      processingTime: `${processingTime}ms`
    });
  }
}
