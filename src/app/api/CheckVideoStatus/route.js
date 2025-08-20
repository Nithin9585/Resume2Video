class VideoStatusService {
  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY;
    this.baseUrl = process.env.HEYGEN_BASE_URL || 'https://api.heygen.com';
    this.maxRetries = 3;
    this.baseDelay = 1000;
  }
  validateApiKey() {
    if (!this.apiKey) {
      throw new Error("HEYGEN_API_KEY environment variable is not configured");
    }
  }
  validateVideoId(videoId) {
    if (!videoId) {
      return { isValid: false, error: "Video ID is required" };
    }
    if (typeof videoId !== 'string' || videoId.length < 10) {
      return { isValid: false, error: "Invalid video ID format" };
    }
    return { isValid: true };
  }
  async checkStatusWithRetry(videoId) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/v1/video_status.get?video_id=${videoId}`, {
          method: 'GET',
          headers: {
            'X-Api-Key': this.apiKey,
            'Accept': 'application/json',
            'User-Agent': 'Resume2Video/1.0'
          }
        });
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
        }
        if (!response.ok) {
          throw new Error(`HeyGen API error (${response.status}): ${data.message || response.statusText}`);
        }
        if (!data.data) {
          throw new Error("Invalid response structure: missing data field");
        }
        const statusData = data.data;
        return this.normalizeStatusResponse(statusData);
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
  normalizeStatusResponse(statusData) {
    const statusMapping = {
      'pending': 'processing',
      'processing': 'processing',
      'completed': 'completed',
      'failed': 'failed',
      'error': 'failed'
    };
    const normalizedStatus = statusMapping[statusData.status?.toLowerCase()] || 'unknown';
    return {
      status: normalizedStatus,
      videoUrl: statusData.video_url || null, // Make sure we use videoUrl (camelCase)
      video_url: statusData.video_url || null, // Also include snake_case for backward compatibility
      duration: statusData.duration || null,
      progress: this.calculateProgress(normalizedStatus),
      estimatedCompletion: this.getEstimatedCompletion(normalizedStatus),
      metadata: {
        originalStatus: statusData.status,
        createdAt: statusData.created_at,
        updatedAt: statusData.updated_at
      }
    };
  }
  calculateProgress(status) {
    const progressMap = {
      'processing': 50,
      'completed': 100,
      'failed': 0,
      'unknown': 0
    };
    return progressMap[status] || 0;
  }
  getEstimatedCompletion(status) {
    const estimates = {
      'processing': '1-2 minutes remaining',
      'completed': 'Ready for download',
      'failed': 'Generation failed',
      'unknown': 'Status unknown'
    };
    return estimates[status] || 'Processing...';
  }
}
class StatusErrorHandler {
  static createErrorResponse(error, context = {}) {
    if (error.message.includes("HEYGEN_API_KEY")) {
      return Response.json({
        error: "Video service configuration error",
        code: "CONFIG_ERROR"
      }, { status: 500 });
    }
    if (error.message.includes("Video ID is required")) {
      return Response.json({
        error: "Missing video ID",
        code: "VALIDATION_ERROR",
        message: "Video ID parameter is required"
      }, { status: 400 });
    }
    if (error.message.includes("Invalid video ID format")) {
      return Response.json({
        error: "Invalid video ID",
        code: "VALIDATION_ERROR",
        message: "Video ID format is invalid"
      }, { status: 400 });
    }
    if (error.message.includes("HeyGen API error")) {
      return Response.json({
        error: "Video service error",
        code: "EXTERNAL_API_ERROR",
        message: error.message
      }, { status: 502 });
    }
    if (error.message.includes("Invalid JSON response")) {
      return Response.json({
        error: "Service response error",
        code: "RESPONSE_ERROR",
        message: "Unable to parse video status response"
      }, { status: 502 });
    }
    return Response.json({
      error: "Status check failed",
      code: "STATUS_ERROR",
      message: "Unable to retrieve video status"
    }, { status: 500 });
  }
}
export async function GET(req) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');
    const statusService = new VideoStatusService();
    statusService.validateApiKey();
    const validation = statusService.validateVideoId(videoId);
    if (!validation.isValid) {
      return Response.json({
        error: validation.error,
        code: "VALIDATION_ERROR"
      }, { status: 400 });
    }
    const statusData = await statusService.checkStatusWithRetry(videoId);
    const processingTime = Date.now() - startTime;
    return Response.json({
      success: true,
      ...statusData,
      processing_time: processingTime
    }, { status: 200 });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    return StatusErrorHandler.createErrorResponse(error, {
      videoId: new URL(req.url).searchParams.get('videoId'),
      processingTime: `${processingTime}ms`
    });
  }
}
