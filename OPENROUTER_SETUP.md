# OpenRouter AI Integration Setup

This chatbot now uses **OpenRouter API** to provide intelligent, real-time AI responses!

## 🚀 Quick Setup

### 1. Get Your OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up or log in
3. Create a new API key
4. Copy your API key

### 2. Configure Environment Variables

1. Open the `.env` file in the root directory
2. Replace `YOUR_NEW_KEY` with your actual API key:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Test the Chatbot

1. Navigate to the chatbot page
2. Start chatting! The AI will respond intelligently to your medical queries

## 🔧 How It Works

- **Frontend**: React + TypeScript chatbot interface (`src/pages/Chatbot.tsx`)
- **API Service**: OpenRouter integration (`src/services/openRouterService.ts`)
- **AI Model**: Uses `openrouter/auto` (free tier) by default
- **Context**: Medical assistant with empathetic, helpful responses

## 🎯 Features

✅ Real-time AI responses  
✅ Conversation history maintained  
✅ Medical context awareness  
✅ Error handling with user-friendly messages  
✅ Secure API key management  

## 🔒 Security Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- The API key is stored in environment variables
- Share `.env.example` with your team, not `.env`

## 🛠️ Customization

### Change AI Model

Edit `src/services/openRouterService.ts`:

```typescript
// Use a specific model instead of auto
await sendMessageToOpenRouter(messages, "anthropic/claude-3-sonnet");
```

### Modify System Prompt

Edit the `createMedicalSystemMessage()` function in `src/services/openRouterService.ts` to change how the AI behaves.

## 📝 Available Models

OpenRouter supports many models:
- `openrouter/auto` - Free tier (automatically selects best available)
- `anthropic/claude-3-sonnet` - Claude 3 Sonnet
- `openai/gpt-4` - GPT-4
- `google/gemini-pro` - Gemini Pro
- And many more!

Check [OpenRouter Models](https://openrouter.ai/models) for the full list.

## 🐛 Troubleshooting

### "API key not configured" error
- Make sure you've added your API key to `.env`
- Restart the dev server after adding the key

### "OpenRouter API error: 401"
- Your API key is invalid or expired
- Generate a new key from OpenRouter

### No response from AI
- Check your internet connection
- Verify your API key has credits (if using paid models)
- Check browser console for detailed error messages

## 💡 Tips

- The chatbot maintains conversation history, so it remembers context
- You can ask follow-up questions naturally
- The AI is configured as a medical assistant but won't diagnose or prescribe

---

**Happy Chatting! 🤖💬**
