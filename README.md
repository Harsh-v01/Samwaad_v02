# Samvad

> **Real-time multilingual communication web app**

Samvad is a real-time chat application designed to help people communicate across language barriers through live messaging, translation, and speech interaction.

## ✨ Features

-  Real-time one-to-one messaging with Socket.IO
-  Online presence and typing indicators
-  Multilingual message translation
-  Speech-to-text and text-to-speech
-  User language preferences
-  Conversation history during active sessions
-  Responsive chat interface
-  Live communication without page refreshes

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS
- Lucide React

**Backend**
- Node.js
- Express.js
- Socket.IO

**APIs & Browser Technologies**
- Translation API
- Web Speech API
- Speech Synthesis API

## 🏗️ Architecture

```text
        React + Vite
             │
        Socket.IO
             │
             ▼
     Node.js + Express
             │
      ┌──────┴──────┐
      │             │
   Users       Conversations
   Presence      Messages
   Typing       Session Data
```

The frontend is organized into reusable components, React hooks, services, and utility modules, while the Node.js server manages real-time communication and active conversations.

## 🚀 Run Locally

```bash
git clone https://github.com/Harsh-v01/Samwaad_v02.git
cd Samwaad_v02

npm install

cd frontend
npm install
npm run build

cd ..
node server.js
```

Open **http://localhost:3000** in your browser.

To test real-time communication, open Samvad in two separate browser sessions and join with different usernames.

## 📌 Project Status

**Working Prototype**

The core real-time messaging, presence, typing indicators, multilingual translation, and speech interaction features are implemented.

## 👨‍💻 Author

**Harsh Kumar**

B.Tech Information Technology  
MIT ADT University, Pune

[GitHub](https://github.com/Harsh-v01)