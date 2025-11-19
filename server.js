const express = require('express');
const app = express();
const http = require('http').createServer(app);
// Use cors to ensure socket connections work properly
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('public'));
app.use(cors());

// Track connected users and their language preferences
const users = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining with username and language preference
  socket.on('user_join', (userData) => {
    users[socket.id] = {
      id: socket.id,
      username: userData.username,
      preferredLanguage: userData.preferredLanguage || 'en'
    };
    
    // Notify all users about the new user
    io.emit('user_joined', {
      userId: socket.id,
      username: userData.username,
      preferredLanguage: userData.preferredLanguage
    });
    
    // Send current user list to the new user
    socket.emit('user_list', Object.values(users));
    
    console.log(`User ${userData.username} (${socket.id}) joined with language ${userData.preferredLanguage}`);
    console.log(`Current users: ${Object.keys(users).length}`);
  });

  // Update user's language preference when changed
  socket.on('language_change', (data) => {
    if (users[socket.id]) {
      users[socket.id].preferredLanguage = data.language;
      console.log(`User ${users[socket.id].username} changed language to ${data.language}`);
    }
  });

  // Handle message sending with improved reliability
  socket.on('send_message', (data) => {
    try {
      // Get the sender's information
      const sender = users[socket.id];
      if (!sender) {
        console.log("Error: User not found for socket", socket.id);
        return;
      }
      
      console.log(`Received message from ${sender.username} (${socket.id}): "${data.message}"`);
      
      // Broadcast to all clients - using dedicated broadcast method
      const messageData = {
        senderId: socket.id,
        senderName: sender.username,
        originalText: data.message,
        sourceLanguage: data.sourceLanguage || sender.preferredLanguage,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      // IMPORTANT: This emits to ALL connected clients INCLUDING the sender
      io.sockets.emit('receive_message', messageData);
      console.log(`Message broadcasted to all ${Object.keys(users).length} users`);
    } catch (error) {
      console.error('Error handling send_message event:', error);
    }
  });

  // Create a heartbeat to ensure connection stays alive
  const heartbeat = setInterval(() => {
    if (users[socket.id]) {
      socket.emit('ping', { time: new Date().toISOString() });
    }
  }, 25000);

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      console.log(`User ${username} (${socket.id}) disconnected`);
      
      // Notify others about user disconnection
      io.emit('user_left', {
        userId: socket.id,
        username: username
      });
      
      // Remove user from users object
      delete users[socket.id];
      
      // Clear heartbeat
      clearInterval(heartbeat);
    }
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
