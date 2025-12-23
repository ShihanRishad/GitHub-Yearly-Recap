import { v2 as cloudinary } from 'cloudinary';
import { config } from './config.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
});

export interface UploadResult {
    url: string;
    secureUrl: string;
    publicId: string;
}

export async function uploadImage(
    imageBuffer: Buffer,
    folder: string,
    publicId: string
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: `github-recap/${folder}`,
                public_id: publicId,
                format: 'png',
                resource_type: 'image',
                overwrite: true,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.url,
                        secureUrl: result.secure_url,
                        publicId: result.public_id,
                    });
                } else {
                    reject(new Error('Upload failed with no result'));
                }
            }
        ).end(imageBuffer);
    });
}

export async function deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}
