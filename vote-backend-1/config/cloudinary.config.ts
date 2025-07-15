export const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

    // Upload settings
    upload: {
        folder: 'pax-romana-candidates',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_file_size: 5 * 1024 * 1024, // 5MB
        transformation: [
            {
                width: 400,
                height: 400,
                crop: 'fill',
                gravity: 'face',
                quality: 'auto',
                format: 'webp',
            }
        ],
    },

    // Folders structure
    folders: {
        candidates: 'candidates',
        nominations: 'nominations',
        documents: 'documents',
    },

    // Security settings
    secure: true,
    invalidate: true,
    overwrite: true,
    unique_filename: true,
    use_filename: false,
};