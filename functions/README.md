Firebase AI endpoint starter for Concorde PSI.

What it does:
- exposes `generatePsiText`
- accepts task/template/local wording payload from the web app
- calls either OpenAI or Gemini
- returns strict PSI wording JSON
- falls back to local wording if the provider fails

Environment variables:
- `AI_PROVIDER=openai` or `AI_PROVIDER=gemini`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-5.4-mini`
- `GEMINI_API_KEY=...`
- `GEMINI_MODEL=gemini-3.1-flash`

Quick Gemini setup:
1. Copy [.env.example](./.env.example) to `.env`
2. Put your Gemini key into `GEMINI_API_KEY`
3. Deploy again with `firebase.cmd deploy --only functions`

Current app endpoint:
- [config.js](../js/config.js) already points at the deployed Firebase function URL
- once `.env` is populated and functions are redeployed, the live app will start using Gemini automatically

Deploy shape:
1. `firebase init functions`
2. copy these files into the generated `functions` folder
3. set env vars / secrets
4. deploy the function
5. copy the HTTPS URL into `AI_ENDPOINT_URL` in [config.js](../js/config.js)

Client behavior:
- if `AI_ENDPOINT_URL` is blank, app stays on local wording only
- if `AI_ENDPOINT_URL` is set, app tries remote AI first and falls back safely
