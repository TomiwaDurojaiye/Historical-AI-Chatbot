# Malcolm X Historical Chatbot

An advanced web-based chatbot system that simulates historically accurate conversations with Malcolm X using a React frontend, Express backend, and sophisticated JSON-based conversation engine.

![Malcolm X Chatbot](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## 🌟 Features

### Advanced Conversation Engine
- **Context-Aware Responses**: Tracks conversation history and adjusts responses based on previously discussed topics
- **TF-IDF Text Matching**: Uses natural language processing for intelligent keyword and phrase matching
- **LLM Fallback**: Integrates Google Gemini AI to handle complex queries and edge cases when JSON matching has low confidence
- **Sentiment Analysis**: Analyzes user input sentiment to provide appropriate responses
- **Dynamic Branching**: Conversation flows naturally through 15+ interconnected dialogue nodes
- **Topic Tracking**: Monitors and displays discussed topics in real-time

### Premium User Interface
- **1960s Civil Rights Era Design**: Authentic color palette inspired by the historical period
- **Smooth Animations**: Micro-interactions and transitions enhance user engagement
- **Fully Responsive**: Mobile-first design that works beautifully on all devices
- **WCAG AA Compliant**: Accessible to users with disabilities, including screen reader support
- **Dark Mode**: Elegant dark theme with carefully chosen contrast ratios

### Technical Excellence
- **TypeScript**: Full type safety across frontend and backend
- **Monorepo Structure**: Organized workspace with client and server separation
- **RESTful API**: Clean, documented API endpoints
- **Session Management**: Persistent conversation state per user session
- **Error Handling**: Comprehensive error handling and user feedback

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Historical-AI-Chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env` and add your Google AI API key:
   - Get a free API key from [Google AI Studio](https://aistudio.google.com)
   - Set `GOOGLE_AI_API_KEY=your_actual_api_key`
   - Optionally adjust `LLM_CONFIDENCE_THRESHOLD` (default: 3.0)
   - Set `LLM_FALLBACK_ENABLED=false` to disable the LLM fallback

### Running the Application

#### Development Mode (Concurrent)
Run both client and server simultaneously:
```bash
npm run dev
```

#### Individual Services

**Server** (http://localhost:5000):
```bash
cd server
npm run dev
```

**Client** (http://localhost:3000):
```bash
cd client
npm run dev
```

### Building for Production

```bash
npm run build
```

This compiles TypeScript and creates optimized production builds for both client and server.

## 🏗️ Project Structure

```
Historical-AI-Chatbot/
├── client/                         # React frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── ChatInterface.tsx  # Main chat interface
│   │   │   ├── Header.tsx         # App header
│   │   │   ├── MessageBubble.tsx  # Message display
│   │   │   └── TypingIndicator.tsx
│   │   ├── services/              # API integration
│   │   │   └── chatService.ts     # Backend communication
│   │   ├── styles/                # CSS styling
│   │   │   └── styles.css         # Main stylesheet
│   │   ├── types/                 # TypeScript definitions
│   │   │   └── chat.ts
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                        # Express backend
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   │   └── chatController.ts
│   │   ├── engine/                # Conversation engine
│   │   │   └── conversationEngine.ts
│   │   ├── data/                  # Conversation data
│   │   │   └── malcolmx-conversation.json
│   │   ├── routes/                # API routes
│   │   │   └── chatRoutes.ts
│   │   ├── middleware/            # Express middleware
│   │   │   └── errorHandler.ts
│   │   ├── types/                 # TypeScript definitions
│   │   │   └── conversation.ts
│   │   └── server.ts              # Entry point
│   ├── .env.example
│   └── package.json
├── docs/                          # Documentation
├── tests/                         # Test suites
├── package.json                   # Root package config
└── README.md
```

## 🔌 API Endpoints

### Create Session
```http
POST /api/chat/session
```
Creates a new chat session and returns initial greeting.

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "greeting": "As-salamu alaykum, brother. I am Malcolm X..."
}
```

### Send Message
```http
POST /api/chat/message
```

**Request Body:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "message": "Tell me about your life"
}
```

**Response:**
```json
{
  "response": "I was born Malcolm Little in Omaha, Nebraska...",
  "history": [...],
  "topicsDiscussed": ["Malcolm X's Life Story"]
}
```

### Reset Conversation
```http
POST /api/chat/reset
```

**Request Body:**
```json
{
  "sessionId": "session_1234567890_abc123"
}
```

### Get History
```http
GET /api/chat/history/:sessionId
```

See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for complete API reference.

## 🎨 Design Decisions

The chatbot features a carefully crafted design inspired by the 1960s Civil Rights era:

- **Color Palette**: Gold and brown accents (#c9924a, #8b4513) against dark backgrounds
- **Typography**: Combination of modern Inter for readability and Playfair Display for elegance
- **Animations**: Subtle micro-animations enhance engagement without distraction
- **Accessibility**: WCAG AA compliant with proper ARIA labels, keyboard navigation, and color contrast

See [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md) for detailed design rationale.

## 🧠 Conversation Engine

The hybrid conversation engine combines JSON-based pattern matching with AI-powered fallback:

### Primary Matching (JSON-Based)
1. **TF-IDF Matching**: Calculates similarity between user input and conversation nodes
2. **Keyword Matching**: Identifies relevant topics through keyword detection
3. **Context Tracking**: Maintains conversation state and history
4. **Sentiment Analysis**: Adapts responses based on user sentiment
5. **Priority Scoring**: Combines multiple factors to select the most appropriate response

### LLM Fallback (Google Gemini)
When the confidence score falls below the threshold (default: 3.0), the system:
- Sends the query to Google Gemini with Malcolm X's persona
- Includes conversation history for context
- Receives a historically accurate, in-character response
- Falls back to default node if LLM fails or is disabled

This hybrid approach ensures:
- **High accuracy** for common questions (JSON matching)
- **Flexibility** for complex or unexpected queries (LLM fallback)
- **Graceful degradation** if LLM is unavailable

### Conversation Node Structure

```json
{
  "id": "greeting",
  "responses": ["As-salamu alaykum, brother..."],
  "triggers": ["hello", "hi", "greetings"],
  "keywords": ["start", "begin"],
  "context": ["personal_history"],
  "nextNodes": ["about_malcolm", "civil_rights"],
  "priority": 1.5
}
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## 📝 Development Notes

### AI Tools Used

This project was developed with assistance from AI tools for:
- Initial project scaffolding and structure
- Conversation content research and accuracy
- Code generation and TypeScript definitions
- Documentation writing

All AI-generated content was reviewed and refined for accuracy, particularly the Malcolm X historical content.

See [AI_TOOL_USAGE.md](docs/AI_TOOL_USAGE.md) for details.

### Team Process

This project demonstrates strong software engineering practices:
- **Requirements Gathering**: Clear specification of features and technical stack
- **Architecture Design**: Thoughtful separation of concerns and modular structure
- **Version Control**: Git-based workflow with meaningful commits
- **Testing**: Comprehensive test coverage (to be implemented)
- **Documentation**: Detailed technical and user documentation

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes.

## ⚠️ Educational Disclaimer

This chatbot simulates Malcolm X based on historical research and should not be considered as direct quotes or official representation. Responses are generated for educational purposes to facilitate learning about this important historical figure.

## 🙏 Acknowledgments

- Historical content based on "The Autobiography of Malcolm X" and documented speeches
- Inspired by the legacy of Malcolm X and the Civil Rights Movement
- Built with modern web technologies and best practices

## 📧 Support

For questions or issues, please open an issue on GitHub.

---

**Built with React, TypeScript, Express, and Natural NLP**
