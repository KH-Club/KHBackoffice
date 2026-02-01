# Image Migration Guide

This guide explains how to migrate existing camp images from the local `/public/camps/` folder to Supabase Storage.

## Prerequisites

1. Supabase Storage bucket created (run `supabase/storage.sql`)
2. Admin user configured in Supabase
3. Existing images in `KHWebpage/public/camps/` folder

## Option 1: Manual Upload (Recommended for small datasets)

1. Go to **Supabase Dashboard** → **Storage** → **camps** bucket
2. Create folder structure: `main/[camp_id]/`
3. Upload images manually for each camp

## Option 2: Script Migration

### Step 1: Install Supabase CLI (optional)

```bash
npm install -g supabase
```

### Step 2: Create Migration Script

Create a file `migrate-images.js`:

```javascript
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY' // Use service role for migration

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const CAMPS_DIR = '../KHWebpage/public/camps/main'
const BUCKET = 'camps'

async function migrateImages() {
  const campFolders = fs.readdirSync(CAMPS_DIR)

  for (const campId of campFolders) {
    const campPath = path.join(CAMPS_DIR, campId)
    
    if (!fs.statSync(campPath).isDirectory()) continue

    const images = fs.readdirSync(campPath)
    
    for (const image of images) {
      const imagePath = path.join(campPath, image)
      const fileBuffer = fs.readFileSync(imagePath)
      
      const storagePath = `main/${campId}/${image}`
      
      console.log(`Uploading: ${storagePath}`)
      
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: `image/${image.split('.').pop()}`,
          upsert: true
        })
      
      if (error) {
        console.error(`Error uploading ${storagePath}:`, error)
      } else {
        console.log(`✓ Uploaded ${storagePath}`)
      }
    }
  }
}

migrateImages()
```

### Step 3: Run Migration

```bash
node migrate-images.js
```

## Step 4: Update Database URLs

After uploading images, update the `img_src` field in the database:

```sql
-- Update image URLs to use Supabase Storage
UPDATE camps
SET img_src = (
  SELECT array_agg(
    CASE 
      WHEN elem LIKE '/camps/%' 
      THEN 'https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/camps' || substring(elem from 7)
      ELSE elem
    END
  )
  FROM unnest(img_src) AS elem
)
WHERE img_src IS NOT NULL AND array_length(img_src, 1) > 0;
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

## Verification

1. Check Supabase Dashboard → Storage → camps bucket
2. Verify images are accessible via public URL
3. Test KHWebpage displays images correctly

## Image URL Format

| Before (Local) | After (Supabase) |
|----------------|------------------|
| `/camps/main/47/KH47.jpg` | `https://xxx.supabase.co/storage/v1/object/public/camps/main/47/KH47.jpg` |

## Rollback

If needed, you can switch back to local images by:

1. Reverting the `img_src` URLs in the database
2. Updating `KHWebpage` to not transform URLs

## Storage Limits

Supabase Free Tier:
- **1GB** storage
- **2GB** bandwidth/month

Monitor usage in Supabase Dashboard → Settings → Usage.
