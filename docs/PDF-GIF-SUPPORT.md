# PDF and GIF Support Documentation

## Overview

The admin panel now supports uploading and displaying PDF documents and GIF images in addition to regular images (JPG, PNG, WEBP).

## Features

### Supported File Types

1. **Images** (JPG, JPEG, PNG, WEBP)
   - Max size: 5MB
   - Displayed inline in tweets
   - Supports image preview and modal view

2. **GIFs** (Animated GIFs)
   - Max size: 10MB
   - Displayed inline with GIF badge
   - Supports animation playback
   - Can be viewed in full-screen modal

3. **PDFs** (PDF Documents)
   - Max size: 10MB
   - Displayed as downloadable file card
   - Shows file icon and name
   - Opens in new tab when clicked

## Admin Panel Usage

### Uploading Files

1. **Access Admin Panel**: Navigate to `/npe/admin/login`
2. **Login**: Enter admin password
3. **Create Tweet**: Write your tweet content
4. **Attach File**: Click the "Image/GIF/PDF" button
5. **Select File**: Choose an image, GIF, or PDF file
6. **Preview**: File preview appears below the textarea
7. **Post**: Click "Post" to publish with attachment

### File Validation

The system automatically validates:
- ✅ File type (must be image, GIF, or PDF)
- ✅ File size (within limits)
- ✅ MIME type matches file extension
- ✅ File content (magic number verification)

### Display in Feed

**Images:**
- Displayed inline in tweet
- Click to view in full-screen modal
- Supports multiple images in grid layout

**GIFs:**
- Displayed inline with "GIF" badge
- Click to view in full-screen modal
- Animation plays automatically

**PDFs:**
- Displayed as file card with icon
- Shows filename and file type
- Click to download/open in new tab
- Download icon indicates it's a downloadable file

## Technical Implementation

### File Upload Flow

1. **Client-Side** (`app/npe/admin/login/page.tsx`):
   ```typescript
   const onPickFile = async (file: File | null) => {
     // Validates file type and size
     // Reads file as data URL
     // Sets fileData state with type and name
   }
   ```

2. **API Route** (`app/api/tweets/route.ts`):
   ```typescript
   // Receives file data URL
   // Validates file type
   // Stores in tweet data
   ```

3. **Display** (`components/twitter-post-feed.tsx`):
   ```typescript
   // Renders based on fileType
   // Shows appropriate UI for each type
   ```

### File Storage

Files are stored as base64 data URLs in the tweet data:
- **Images/GIFs**: Stored in `image` field
- **PDFs**: Stored in `image` field (for download)
- **Metadata**: `fileType` and `fileName` fields

### Security

- ✅ File type whitelist validation
- ✅ File size limits enforced
- ✅ MIME type verification
- ✅ Magic number checking (file signature)
- ✅ Secure filename generation
- ✅ Content validation

## File Size Limits

| Type | Max Size | Reason |
|------|----------|--------|
| Images | 5MB | Balance between quality and performance |
| GIFs | 10MB | Animated GIFs can be larger |
| PDFs | 10MB | Documents may contain multiple pages |

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ File API support required
- ✅ Base64 encoding support
- ✅ Data URL support

## Limitations

1. **Base64 Storage**: Files are stored as base64 strings, which increases storage size by ~33%
2. **No Server Storage**: Files are embedded in tweet data (consider cloud storage for production)
3. **No File Compression**: Files are uploaded as-is
4. **Single File**: Only one file per tweet (images can have multiple)

## Future Enhancements

Potential improvements:
- [ ] Cloud storage integration (S3, Cloudinary, etc.)
- [ ] File compression before upload
- [ ] Multiple file uploads
- [ ] File preview for PDFs (first page thumbnail)
- [ ] Video file support
- [ ] File management (delete, replace)

## Troubleshooting

### File Not Uploading
- Check file size (must be under limit)
- Verify file type is supported
- Check browser console for errors
- Ensure admin is logged in

### File Not Displaying
- Verify file data was saved correctly
- Check browser support for file type
- Clear browser cache
- Check network tab for errors

### PDF Not Opening
- Check if browser has PDF viewer
- Try right-click → "Open in new tab"
- Verify PDF file is not corrupted
- Check file size limit
