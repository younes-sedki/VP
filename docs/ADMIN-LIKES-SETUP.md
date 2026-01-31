# Admin Likes Feature Setup

## ⚠️ Important: Database Migration Required

The admin likes feature requires a database migration to add the `likedByAdmin` column.

## Quick Setup

### Step 1: Run the Migration

1. Go to your **Supabase Dashboard**
2. Open **SQL Editor**
3. Copy and paste the contents of `supabase-migration-admin-likes.sql`
4. Click **Run**

The migration will:
- Add `likedByAdmin` column to `user_tweets` table
- Create an index for better performance
- Verify the column was added

### Step 2: Verify Migration

Run this query in Supabase SQL Editor to verify:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_tweets'
  AND column_name = 'likedByAdmin';
```

You should see:
- `column_name`: `likedByAdmin`
- `data_type`: `boolean`
- `column_default`: `false`

## What This Feature Does

1. **Tracks Admin Likes**: When admin likes a user tweet, it's marked with `likedByAdmin = true`

2. **Shows Admin Badge**: A small admin avatar badge appears next to the likes count when admin liked a tweet (like social media platforms)

3. **Admin Panel Like Button**: Admin can like/unlike user tweets directly from the admin panel

4. **Visual Highlighting**: User tweets that admin liked are highlighted with an emerald border in the admin panel

## Current Status

The code has been updated to gracefully handle the missing column:
- ✅ Likes will still work (updates like count)
- ⚠️ Admin badge won't show until migration is run
- ⚠️ Admin likes won't be tracked until migration is run

## Troubleshooting

### Error: "Could not find the 'likedByAdmin' column"

**Solution**: Run the migration SQL script in Supabase dashboard.

### Likes work but admin badge doesn't show

**Solution**: 
1. Verify migration was run successfully
2. Check that `likedByAdmin` column exists
3. Like a tweet again after migration (existing likes won't have the flag)

### Migration fails

**Possible causes**:
- Column already exists (safe to ignore)
- Insufficient permissions (use service role key)
- Table doesn't exist (run `supabase-setup.sql` first)

## Files

- `supabase-migration-admin-likes.sql` - Migration script
- `app/api/tweets/[id]/like/route.ts` - Like API with admin tracking
- `components/twitter-post-feed.tsx` - UI with admin badge
- `app/npe/admin/login/page.tsx` - Admin panel with like button
