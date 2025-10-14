# OpenAI Agents SDK with Rube MCP - Netlify App

A serverless API built with OpenAI Agents SDK and Rube MCP integration, deployed on Netlify for iPhone and web access.

## 🚀 Features

- **OpenAI Agents SDK**: Leverages GPT-5 with advanced reasoning
- **Rube MCP Integration**: Access to 500+ apps (Slack, GitHub, Gmail, etc.)
- **Serverless**: Deployed as Netlify Functions
- **iPhone Compatible**: RESTful API accessible from any device
- **CORS Enabled**: Works with web and mobile apps

## 📋 Prerequisites

- Node.js 18+
- Netlify account
- OpenAI API key
- Rube API key

## 🛠️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/Kyletho2020/openai-agents-rube-app.git
cd openai-agents-rube-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your keys:
- `OPENAI_API_KEY`: Your OpenAI API key
- `RUBE_API_KEY`: Your Rube authorization key. Supply either the full `Bearer <token>` string from Rube or just the raw key (the server will add the `Bearer` prefix automatically).

> ⚠️ Keep the `.env` file local. It is ignored by Git so that you can safely paste your real keys (for example, the ones you shared) without exposing them in the repository. If you rotate the keys later, update your local `.env` file and your Netlify environment variables.

### 4. Test locally

```bash
npm run dev
```

The function will be available at: `http://localhost:8888/.netlify/functions/agent`

### 5. Deploy to Netlify

#### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
npm run deploy
```

#### Option B: Deploy via GitHub Integration

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select `openai-agents-rube-app`
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Functions directory**: `netlify/functions`
5. Add environment variables in Netlify dashboard:
   - `OPENAI_API_KEY`
   - `RUBE_API_KEY`
6. Deploy!

## 📱 Usage from iPhone

### Using Shortcuts App

1. Open Shortcuts app
2. Create new shortcut
3. Add "Get Contents of URL" action:
   - **URL**: `https://your-app.netlify.app/.netlify/functions/agent`
   - **Method**: POST
   - **Headers**: `Content-Type: application/json`
   - **Body**: 
   ```json
   {
     "input": "Your message here"
   }
   ```
4. Add "Get Dictionary Value" to extract `output`
5. Add "Show Result"

### Using any HTTP client

```bash
curl -X POST https://your-app.netlify.app/.netlify/functions/agent \
  -H "Content-Type: application/json" \
  -d '{"input": "Help me with my tasks"}'
```

## 🔧 API Reference

### Endpoint

```
POST /.netlify/functions/agent
```

### Request Body

```json
{
  "input": "Your task or question"
}
```

### Response

```json
{
  "success": true,
  "output": "Agent's response"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## 📂 Project Structure

```
openai-agents-rube-app/
├── src/
│   └── agent.ts           # Main agent logic
├── netlify/
│   └── functions/         # Compiled functions (auto-generated)
├── public/                # Static assets (optional)
├── package.json
├── tsconfig.json
├── netlify.toml           # Netlify configuration
├── .env.example
└── README.md
```

## 🔐 Security Notes

- Never commit `.env` file
- Store API keys in Netlify environment variables
- Use HTTPS in production
- Consider adding authentication for production use

## 🐛 Troubleshooting

### Build fails
- Check Node.js version (must be 18+)
- Verify all dependencies are installed
- Check TypeScript errors

### Function returns 500
- Check environment variables are set in Netlify
- View function logs in Netlify dashboard
- Verify API keys are valid

### CORS errors
- Ensure `netlify.toml` has correct CORS headers
- Check your request includes proper headers

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📞 Support

- GitHub Issues: [Issues](https://github.com/Kyletho2020/openai-agents-rube-app/issues)
- Rube Docs: [https://rube.app](https://rube.app)
