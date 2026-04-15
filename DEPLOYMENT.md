# Replace resumevaultgod.com

This repo is a deployable Next.js app. To replace the current live site at
`https://resumevaultgod.com`, deploy this project as the production service and
point the domain at that deployment.

## Recommended: Vercel

1. Import `angeljonez0410-lgtm/resumevaultgodai` into Vercel.
2. Use these project settings:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Development Command: `npm run dev`
3. Add the production environment variables from `.env.example`.
4. Set these URL variables to the production domain:
   - `APP_URL=https://resumevaultgod.com`
   - `NEXT_PUBLIC_APP_URL=https://resumevaultgod.com`
5. Add `resumevaultgod.com` and `www.resumevaultgod.com` in Vercel Domains.
6. Update DNS wherever the domain is managed, likely Cloudflare:
   - Root/apex `resumevaultgod.com`: use the Vercel-provided `A` record.
   - `www.resumevaultgod.com`: use the Vercel-provided `CNAME`.
7. In Stripe, update webhook endpoints and redirect URLs to use
   `https://resumevaultgod.com`.
8. In Supabase, update allowed redirect URLs to include:
   - `https://resumevaultgod.com`
   - `https://resumevaultgod.com/auth/callback`

## Current Build Check

The production build passes with:

```bash
npm run build
```

## Notes

The current live domain responds through Cloudflare with a Render/Uvicorn origin.
Replacing it means the DNS records for `resumevaultgod.com` should stop pointing
at the old Render service and start pointing at the new Next.js deployment.
