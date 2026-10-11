# VaartaNow YouTube channel: connect it for automatic video uploads

Recorded article videos (Live Studio, AI News Generator, Review Queue) are copied to the VaartaNow
YouTube channel by the "Article Audio & YouTube" workflow every 30 minutes. When a video is live on
YouTube, the article plays it from YouTube and our copy is deleted from the VPS.

## 1. Create the channel
youtube.com → profile picture → **Create a channel** → name **VaartaNow**. Add the logo, a banner and
a Telugu description. Verify the channel with a phone number (needed for long videos and custom thumbnails).

## 2. Google Cloud project (once)
1. console.cloud.google.com → new project **vaartanow-youtube**.
2. APIs & Services → Library → enable **YouTube Data API v3**.
3. OAuth consent screen → External → app name "VaartaNow", support email, logo, privacy policy URL
   (`https://varthanow.pages.dev/privacy`), scopes `youtube.upload` and `youtube.readonly`.
   Add the channel owner's Google account as a **test user**, then **Publish app** (otherwise the sign-in expires after 7 days).
4. Credentials → Create credentials → **OAuth client ID** → type **Desktop app**. Copy the client ID and secret.

## 3. Connect (on this PC)
Add to `.env`: `YOUTUBE_CLIENT_ID=...` and `YOUTUBE_CLIENT_SECRET=...`, then run

    npx tsx scripts/youtube-auth.ts

Open the printed link, sign in with the channel owner's account and allow access. Copy the printed
`YOUTUBE_REFRESH_TOKEN`.

## 4. GitHub secrets
github.com/enirchibs/VarthaNow → Settings → Secrets and variables → Actions → add
`YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`. Uploads start on the next run.

## 5. Google API audit (needed for public uploads)
API projects created after July 2020 can upload only as **Private** until Google audits them. Until then
the videos stay private on YouTube and the site keeps playing its own copy (nothing breaks). Apply via the
"YouTube API Services – Audit and Quota Extension Form". Once approved, new uploads are public and switch
over automatically; for earlier private ones, make them public in YouTube Studio and they switch on the next run.

## Limits
- Default quota 10,000 units/day; one upload ≈ 1,600 units → about 6 uploads a day (the workflow uploads at most 3 per run
  and stops when the quota is used). Ask for more in the audit form.
- `YOUTUBE_PRIVACY=unlisted` uploads unlisted instead of public; `KEEP_LOCAL_VIDEO=true` keeps our copy.
