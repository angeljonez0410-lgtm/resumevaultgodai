# Deploy ResumeVaultGodAI on app.resumevaultgod.com

Use `app.resumevaultgod.com` for the new ResumeVaultGodAI app so the current
`resumevaultgod.com` site can stay live until the 2.0 dashboard is fully tested.

## Recommended: Vercel

1. Import `angeljonez0410-lgtm/resumevaultgodai` into Vercel.
2. Use these project settings:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Development Command: `npm run dev`
3. Add the production environment variables from `.env.example`.
4. Set these URL variables to the app subdomain:
   - `APP_URL=https://app.resumevaultgod.com`
   - `NEXT_PUBLIC_APP_URL=https://app.resumevaultgod.com`
5. Add this domain in Vercel Domains:
   - `app.resumevaultgod.com`
6. In Cloudflare or your DNS provider, add:
   - `app.resumevaultgod.com` CNAME to the Vercel-provided target, typically `cname.vercel-dns.com`
7. In Supabase, update allowed redirect URLs to include:
   - `https://app.resumevaultgod.com`
   - `https://app.resumevaultgod.com/auth/callback`
8. In Stripe, update checkout redirect URLs and webhook endpoints to use:
   - `https://app.resumevaultgod.com`

## Keep The Current Site Live

Do not change the existing DNS records for:

- `resumevaultgod.com`
- `www.resumevaultgod.com`

Those currently point at the older live site. Only add the new `app` subdomain
record for the 2.0 app.

## Later Cutover

After testing the app subdomain, you can move the root domain to Vercel by
adding `resumevaultgod.com` and `www.resumevaultgod.com` to Vercel, then
changing the root and `www` DNS records away from the old Render origin.

## Current Build Check

The production build passes with:

```bash
npm run build
```
