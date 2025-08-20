import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { ENV_CONFIG } from '@/lib/envConfig';
class FileUploadService {
    constructor() {
        this.initializeCloudinary();
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        this.allowedDocumentTypes = ['application/pdf'];
    }
    initializeCloudinary() {
        const { cloudinary: config } = ENV_CONFIG.server;
        const requiredEnvVars = ['cloudName', 'apiKey', 'apiSecret'];
        const missingVars = requiredEnvVars.filter(varName => !config[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing Cloudinary configuration: ${missingVars.join(', ')}`);
        }
        cloudinary.config({
            cloud_name: config.cloudName,
            api_key: config.apiKey,
            api_secret: config.apiSecret,
            secure: true
        });
    }
    validateFile(file) {
        const errors = [];
        if (!file) {
            errors.push("No file provided");
            return { isValid: false, errors };
        }
        if (file.size > this.maxFileSize) {
            errors.push(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
        }
        const isImage = this.allowedImageTypes.includes(file.type);
        const isDocument = this.allowedDocumentTypes.includes(file.type);
        if (!isImage && !isDocument) {
            errors.push(`Unsupported file type: ${file.type}`);
        }
        return {
            isValid: errors.length === 0,
            errors,
            fileType: isImage ? 'image' : 'document'
        };
    }
    generateUploadOptions(fileType) {
        const baseOptions = {
            folder: fileType === 'image' ? 'profile-pictures' : 'resume-documents',
            resource_type: fileType === 'image' ? 'image' : 'raw',
            use_filename: true,
            unique_filename: true,
        };
        if (fileType === 'image') {
            return {
                ...baseOptions,
                transformation: [
                    { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ]
            };
        }
        return baseOptions;
    }
    async uploadFile(file, fileType) {
        try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadOptions = this.generateUploadOptions(fileType);
            
            console.log('Starting file upload:', {
                name: file.name,
                size: file.size,
                type: file.type,
                folder: uploadOptions.folder
            });
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) {
                            reject(new Error(`Upload failed: ${error.message}`));
                        } else {
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(buffer);
            });
            
            console.log('Upload successful:', {
                publicId: result.public_id,
                secureUrl: result.secure_url,
                format: result.format,
                bytes: result.bytes
            });
            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes,
                width: result.width,
                height: result.height
            };
        } catch (error) {
            throw error;
        }
    }
}
class UploadErrorHandler {
    static createErrorResponse(error, context = {}) {
        console.error('Upload error:', {
            message: error.message,
            context,
            timestamp: new Date().toISOString()
        });
        if (error.message.includes("Missing Cloudinary configuration")) {
            return NextResponse.json({
                error: "Upload service configuration error",
                code: "CONFIG_ERROR"
            }, { status: 500 });
        }
        if (error.message.includes("File size exceeds")) {
            return NextResponse.json({
                error: "File too large",
                code: "FILE_SIZE_ERROR",
                message: error.message
            }, { status: 413 });
        }
        if (error.message.includes("Unsupported file type")) {
            return NextResponse.json({
                error: "Invalid file type",
                code: "FILE_TYPE_ERROR",
                message: error.message
            }, { status: 415 });
        }
        if (error.message.includes("Upload failed")) {
            return NextResponse.json({
                error: "Upload service error",
                code: "UPLOAD_ERROR",
                message: "Failed to store file"
            }, { status: 502 });
        }
        return NextResponse.json({
            error: "Upload failed",
            code: "UNKNOWN_ERROR",
            message: "An unexpected error occurred"
        }, { status: 500 });
    }
}
export async function POST(request) {
    const startTime = Date.now();
    try {
        const formdata = await request.formData();
        const file = formdata.get("file");
        const uploadService = new FileUploadService();
        const validation = uploadService.validateFile(file);
        if (!validation.isValid) {
            return NextResponse.json({
                error: "File validation failed",
                code: "VALIDATION_ERROR",
                details: validation.errors
            }, { status: 400 });
        }
        const result = await uploadService.uploadFile(file, validation.fileType);
        const processingTime = Date.now() - startTime;
        
        console.log('Upload completed successfully:', {
            processingTime: `${processingTime}ms`,
            fileType: validation.fileType
        });
        return NextResponse.json({
            success: true,
            url: result.url,
            public_id: result.publicId,
            format: result.format,
            size: result.size,
            dimensions: result.width && result.height ? {
                width: result.width,
                height: result.height
            } : null,
            processing_time: processingTime
        }, { status: 200 });
    } catch (error) {
        const processingTime = Date.now() - startTime;
        return UploadErrorHandler.createErrorResponse(error, {
            processingTime: `${processingTime}ms`
        });
    }
}
