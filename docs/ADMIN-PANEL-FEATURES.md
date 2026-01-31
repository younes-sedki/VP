# Admin Panel New Features

## Summary

The admin panel (`/npe/admin/login`) has been enhanced with the following new features:

### 1. **PDF Support**
- Upload PDF files (max 10MB)
- PDF files are displayed with a file icon and download link
- PDFs are stored with `fileType: 'application/pdf'` and `fileName` metadata

### 2. **GIF Support**
- Upload GIF files (max 10MB)
- GIFs are displayed as animated images with a "GIF" badge
- GIFs are stored with `fileType: 'image/gif'` and `fileName` metadata

### 3. **File Upload Validation**
- Client-side validation for file type and size
- Supports: JPG, PNG, WEBP (max 5MB), GIF (max 10MB), PDF (max 10MB)
- File preview in admin panel before posting

### 4. **Enhanced File Management**
- File type detection and validation
- File name preservation
- Preview functionality for images and PDFs
- Remove file option before posting

## Bad Words List

The bad words filter contains **203 words** including:
- Spam and scam terms
- Inappropriate content
- Security threats
- Illegal activities
- Some Arabic/Moroccan words (zabi, zbi, zaml, etc.)

The filter is used for content moderation on tweets and comments.
