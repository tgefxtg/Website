# Netlify visitor site

The owner selected Netlify hosting with the current admin and storage retained.
`netlify-publish/` is a ready-to-upload Netlify static deployment directory.
Upload only this directory, or the ZIP containing its contents, to Netlify Drop.
There is no build command, dependency install, or Next.js runtime required for this deployment.

Netlify proxies visitor pages, JavaScript, styles, and images to the public Sites
application. Visitors stay on the Netlify URL. The original host must stay live.
This is a connected visitor mirror, not a standalone migration or database backup.
The small index file is only a fallback; the forced catch-all proxy serves the full site.

`/admin/` and sign-in links redirect to the existing host. Authentication, owner
checks, saved records, uploads, and delete/restore all stay there. Administrative
API requests on Netlify are rejected with 404 and never forwarded to the origin.
Owner edits appear through the proxy without a Netlify redeploy, subject to origin
cache headers. Public HTML must not be given long-lived caching at the origin.
Static versioned images and scripts can retain their existing cache headers.

Canonicals, structured-data IDs and sitemap URLs retain the original domain to
avoid treating this mirror as a second independent SEO property. A primary-domain
change is a separate migration requiring canonical/redirect updates.

The original source ZIP is for VS Code and the current Cloudflare/Sites build.
It must not be used as the Netlify Drop package. Netlify's failed source upload
selected the Next.js adapter while invoking the Vinext build, and its log reported
missing Sites build-plugin imports. This static package avoids that build entirely.

Reference: https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/
