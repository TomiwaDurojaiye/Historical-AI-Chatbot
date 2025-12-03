# API Documentation

Complete reference for the Malcolm X Chatbot REST API.

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### Health Check

Check server status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "message": "Malcolm X Chatbot Server Running"
}
```

---

### Create Session

Create a new chat session and receive an initial greeting from Malcolm X.

**Endpoint:** `POST /chat/session`

**Request:** No body required

**Response:**
```json
{
  "sessionId": "session_1733151234567_xyz789",
  "greeting": "As-salamu alaykum, brother. I am Malcolm X. What brings you to speak with me today?"
}
```

**Status Codes:**
- `200 OK`: Session created successfully
- `500 Internal Server Error`: Server error

**Example:**
```javascript
const response = await fetch('http://localhost:5000/api/chat/session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data.sessionId);
```

---

### Send Message

Send a message to Malcolm X and receive a response.

**Endpoint:** `POST /chat/message`

**Request Body:**
```json
{
  "sessionId": "session_1733151234567_xyz789",
  "message": "Tell me about your life"
}
```

**Parameters:**
- `sessionId` (string, required): Session identifier from `/chat/session`
- `message` (string, required): User's message/question

**Response:**
```json
{
  "response": "I was born Malcolm Little in Omaha, Nebraska, in 1925. My father was a Baptist minister and follower of Marcus Garvey...",
  "history": [
    {
      "role": "user",
      "content": "Tell me about your life",
      "timestamp": "2025-12-02T15:30:00.000Z"
    },
    {
      "role": "bot",
      "content": "I was born Malcolm Little...",
      "timestamp": "2025-12-02T15:30:01.000Z",
      "nodeId": "about_malcolm"
    }
  ],
  "topicsDiscussed": ["Malcolm X's Life Story"]
}
```

**Response Fields:**
- `response` (string): Malcolm X's response to the user's message
- `history` (array): Last 10 messages in the conversation
- `topicsDiscussed` (array): List of topics covered in this session

**Status Codes:**
- `200 OK`: Message processed successfully
- `400 Bad Request`: Missing sessionId or message
- `500 Internal Server Error`: Server error

**Example:**
```javascript
const response = await fetch('http://localhost:5000/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: 'session_1733151234567_xyz789',
    message: 'What did you think about civil rights?'
  })
});
const data = await response.json();
console.log(data.response);
```

---

### Reset Conversation

Reset a conversation session to start fresh.

**Endpoint:** `POST /chat/reset`

**Request Body:**
```json
{
  "sessionId": "session_1733151234567_xyz789"
}
```

**Parameters:**
- `sessionId` (string, required): Session identifier to reset

**Response:**
```json
{
  "message": "Conversation reset successfully",
  "sessionId": "session_1733151234567_xyz789"
}
```

**Status Codes:**
- `200 OK`: Session reset successfully
- `400 Bad Request`: Missing sessionId
- `500 Internal Server Error`: Server error

**Example:**
```javascript
const response = await fetch('http://localhost:5000/api/chat/reset', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: 'session_1733151234567_xyz789'
  })
});
```

---

### Get History

Retrieve full conversation history for a session.

**Endpoint:** `GET /chat/history/:sessionId`

**Parameters:**
- `sessionId` (string, required): Session identifier (URL parameter)

**Response:**
```json
{
  "history": [
    {
      "role": "bot",
      "content": "As-salamu alaykum, brother...",
      "timestamp": "2025-12-02T15:30:00.000Z",
      "nodeId": "greeting"
    },
    {
      "role": "user",
      "content": "Tell me about your life",
      "timestamp": "2025-12-02T15:30:05.000Z"
    }
  ],
  "topicsDiscussed": [
    {
      "id": "personal_history",
      "name": "Malcolm X's Life Story",
      "description": "His childhood, family, criminal past, imprisonment, and personal transformation",
      "keywords": ["childhood", "family", "prison", "detroit", "hustler", "transformation"],
      "nodes": ["about_malcolm", "childhood", "prison", "transformation"]
    }
  ]
}
```

**Status Codes:**
- `200 OK`: History retrieved successfully
- `400 Bad Request`: Missing sessionId
- `500 Internal Server Error`: Server error

**Example:**
```javascript
const sessionId = 'session_1733151234567_xyz789';
const response = await fetch(`http://localhost:5000/api/chat/history/${sessionId}`);
const data = await response.json();
console.log(data.history);
```

---

## Error Responses

All endpoints may return error responses with the following format:

```json
{
  "error": "Error message description"
}
```

In development mode, additional error details may be included:

```json
{
  "error": "Error message description",
  "message": "Detailed error message (development only)"
}
```

## Data Models

### Message Object

```typescript
{
  role: 'user' | 'bot',
  content: string,
  timestamp: Date,
  nodeId?: string  // Only present for bot messages
}
```

### Topic Object

```typescript
{
  id: string,
  name: string,
  description: string,
  keywords: string[],
  nodes: string[]
}
```

## Rate Limiting

Currently, there is no rate limiting implemented. In production environments, consider implementing:
- Per-session rate limits
- IP-based rate limits
- Request throttling

## CORS

The server is configured to accept requests from:
- Development: `http://localhost:3000`
- Configure `CORS_ORIGIN` in `.env` for other environments

## Session Management

- Sessions are stored in-memory on the server
- Sessions persist until server restart or manual reset
- Each session maintains:
  - Unique session ID
  - Conversation history
  - Current conversation node
  - Visited nodes
  - Context map
  - Topics discussed

## Best Practices

1. **Always create a session first** using `/chat/session`
2. **Store the sessionId** on the client for subsequent requests
3. **Handle errors gracefully** and provide user feedback
4. **Implement retry logic** for network failures
5. **Validate user input** before sending to the API

## Example Integration

```typescript
import axios from 'axios';

class ChatAPI {
  private baseURL = 'http://localhost:5000/api';
  private sessionId: string | null = null;

  async createSession() {
    const response = await axios.post(`${this.baseURL}/chat/session`);
    this.sessionId = response.data.sessionId;
    return response.data.greeting;
  }

  async sendMessage(message: string) {
    if (!this.sessionId) {
      throw new Error('No active session');
    }
    const response = await axios.post(`${this.baseURL}/chat/message`, {
      sessionId: this.sessionId,
      message
    });
    return response.data;
  }

  async reset() {
    if (!this.sessionId) return;
    await axios.post(`${this.baseURL}/chat/reset`, {
      sessionId: this.sessionId
    });
    this.sessionId = null;
  }
}
```
