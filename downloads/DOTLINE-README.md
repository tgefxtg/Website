# DOTLINE website code

Download `DOTLINE-Netlify-Code.zip` from this folder using GitHub’s download button, then extract it.

Upload the extracted files to a new GitHub repository and import that repository in Netlify. The included `netlify.toml` configures the website and server functions. Full instructions are in the ZIP’s README.

This source package contains no real API keys. Set a replacement Gemini key securely in Netlify Functions settings as `DOTLINE_GEMINI_API_KEY`; never commit it. Netlify Drop alone will not deploy the Gemini server functions.
