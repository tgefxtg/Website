# DOTLINE — Netlify website source

## Deploy using Netlify’s website

1. Extract this ZIP.
2. Upload all extracted files to a new GitHub repository. Keep `netlify.toml` at the repository root, beside `web/` and `netlify/`.
3. In Netlify, choose Add new project / Import an existing project, connect GitHub, and select that repository.
4. Netlify reads the included configuration: base directory `web`, build command `npm ci --include=dev --include=optional --no-audit --no-fund && npm run build`, publish directory `web/dist` relative to the repository root (`dist` relative to the base), functions directory `netlify/functions`.
5. Deploy. Without a Gemini key, the site runs in clearly labelled mock mode.
6. To enable Gemini, set `DOTLINE_GEMINI_API_KEY` securely in Netlify’s Functions-scoped environment variables, then redeploy. Optional model setting: `DOTLINE_GEMINI_MODEL` (default `gemini-2.5-flash`; verify availability for your account).

Do not put API keys into source code, chat, or a `VITE_*` variable. Rotate any key previously shared in chat. This ZIP contains no real credentials.

## Important

Netlify Drop (drag-and-drop uploads) only publishes static files. It does not build this source or deploy the Gemini server functions. Use the GitHub import workflow above or the Netlify CLI for the complete site.

Conversations are stored in each visitor’s browser, not in a shared database. The current conversation is sent to Gemini through the server function when Gemini is enabled. Clearing website data removes local history.

## Local commands

Requires Node 24. From `web/`, run `npm ci` and `npm run build`. For full local function routing, run Netlify CLI from this archive’s root (`npx netlify-cli@27.16.0 dev`). Deploy through the CLI using `npx netlify-cli@27.16.0 deploy --prod` after logging in and choosing a new site.
