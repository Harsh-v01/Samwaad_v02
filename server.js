const express = require('express')
const cors = require('cors')
const http = require('http')
const { randomUUID } = require('crypto')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// --------------------------------------------------
// USERS
// --------------------------------------------------

const users = new Map()

// --------------------------------------------------
// CONVERSATION HISTORY
// --------------------------------------------------

const conversations = new Map()

function getConversationKey(userA, userB) {
  return [userA, userB].sort().join(':')
}

// --------------------------------------------------
// CONNECTION
// --------------------------------------------------

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  // ------------------------------------------------
  // USER JOIN
  // ------------------------------------------------

  socket.on('user_join', (userData) => {
    const userId = String(
      userData?.userId || ''
    ).trim()

    const username = String(
      userData?.username || ''
    ).trim()

    const preferredLanguage =
      userData?.preferredLanguage || 'en'

    if (!userId || !username) {
      socket.emit('join_error', {
        message: 'User information is incomplete.',
      })

      return
    }

    const user = {
      id: userId,
      socketId: socket.id,
      username,
      preferredLanguage,
    }

    users.set(userId, user)

    // Private room for this user.
    socket.join(userId)

    // Send current users to the newly connected user.
    socket.emit(
      'user_list',
      Array.from(users.values()).map((item) => ({
        id: item.id,
        username: item.username,
        preferredLanguage:
          item.preferredLanguage,
      }))
    )

    // Notify everyone else.
    socket.broadcast.emit('user_joined', {
      userId: user.id,
      username: user.username,
      preferredLanguage:
        user.preferredLanguage,
    })

    console.log(
      `${username} joined`
    )

    console.log(
      `Connected users: ${users.size}`
    )
  })

  // ------------------------------------------------
  // LANGUAGE CHANGE
  // ------------------------------------------------

  socket.on(
    'language_change',
    (data) => {
      const userId = data?.userId
      const user = users.get(userId)

      if (!user) return

      if (user.socketId !== socket.id) {
        return
      }

      const language = data?.language

      if (!language) return

      user.preferredLanguage = language

      users.set(userId, user)

      socket.broadcast.emit(
        'user_updated',
        {
          userId: user.id,
          preferredLanguage: language,
        }
      )

      console.log(
        `${user.username} changed language to ${language}`
      )
    }
  )

  // ------------------------------------------------
  // TYPING START
  // ------------------------------------------------

  socket.on(
    'typing_start',
    (data) => {
      const senderId = data?.senderId
      const recipientId = data?.recipientId

      const sender = users.get(senderId)

      if (!sender) return

      if (sender.socketId !== socket.id) {
        return
      }

      if (!recipientId) return

      const recipient =
        users.get(recipientId)

      if (!recipient) return

      io.to(recipientId).emit(
        'user_typing',
        {
          userId: senderId,
          username: sender.username,
        }
      )
    }
  )

  // ------------------------------------------------
  // TYPING STOP
  // ------------------------------------------------

  socket.on(
    'typing_stop',
    (data) => {
      const senderId = data?.senderId
      const recipientId = data?.recipientId

      const sender = users.get(senderId)

      if (!sender) return

      if (sender.socketId !== socket.id) {
        return
      }

      if (!recipientId) return

      io.to(recipientId).emit(
        'user_stopped_typing',
        {
          userId: senderId,
        }
      )
    }
  )

  // ------------------------------------------------
  // SEND MESSAGE
  // ------------------------------------------------

  socket.on(
    'send_message',
    (data) => {
      try {
        const senderId = data?.senderId
        const recipientId = data?.recipientId

        const sender = users.get(senderId)
        const recipient =
          users.get(recipientId)

        if (!sender) {
          socket.emit('message_error', {
            message:
              'You are not connected to Samvad.',
          })

          return
        }

        if (sender.socketId !== socket.id) {
          socket.emit('message_error', {
            message:
              'Invalid user session.',
          })

          return
        }

        if (!recipient) {
          socket.emit('message_error', {
            message:
              'This person is not currently online.',
          })

          return
        }

        const text = String(
          data?.message || ''
        ).trim()

        if (!text) return

        // Stop typing when message is sent.
        io.to(recipientId).emit(
          'user_stopped_typing',
          {
            userId: senderId,
          }
        )

        const message = {
          id: randomUUID(),

          senderId: sender.id,
          senderName: sender.username,

          recipientId: recipient.id,
          recipientName: recipient.username,

          originalText: text,

          sourceLanguage:
            sender.preferredLanguage || 'en',

          targetLanguage:
            recipient.preferredLanguage || 'en',

          timestamp:
            data?.timestamp ||
            new Date().toISOString(),
        }

        // Save message.
        const conversationKey =
          getConversationKey(
            sender.id,
            recipient.id
          )

        if (
          !conversations.has(
            conversationKey
          )
        ) {
          conversations.set(
            conversationKey,
            []
          )
        }

        const conversation =
          conversations.get(
            conversationKey
          )

        conversation.push(message)

        // Keep last 500 messages.
        if (conversation.length > 500) {
          conversation.splice(
            0,
            conversation.length - 500
          )
        }

        // Send to sender.
        socket.emit(
          'receive_message',
          message
        )

        // Send only to recipient.
        io.to(recipient.id).emit(
          'receive_message',
          message
        )

        console.log(
          `${sender.username} -> ${recipient.username}: ${text}`
        )
      } catch (error) {
        console.error(
          'Message error:',
          error
        )

        socket.emit(
          'message_error',
          {
            message:
              'Unable to send message.',
          }
        )
      }
    }
  )

  // ------------------------------------------------
  // GET CONVERSATION HISTORY
  // ------------------------------------------------

  socket.on(
    'get_conversation',
    (data) => {
      const userId = data?.userId
      const recipientId =
        data?.recipientId

      const currentUser =
        users.get(userId)

      if (!currentUser) {
        socket.emit(
          'conversation_error',
          {
            message:
              'User session not found.',
          }
        )

        return
      }

      if (
        currentUser.socketId !==
        socket.id
      ) {
        return
      }

      if (!recipientId) {
        socket.emit(
          'conversation_error',
          {
            message:
              'No conversation selected.',
          }
        )

        return
      }

      const conversationKey =
        getConversationKey(
          userId,
          recipientId
        )

      const history =
        conversations.get(
          conversationKey
        ) || []

      socket.emit(
        'conversation_history',
        {
          recipientId,
          messages: history,
        }
      )
    }
  )

  // ------------------------------------------------
  // HEARTBEAT
  // ------------------------------------------------

  const heartbeat =
    setInterval(() => {
      socket.emit('ping', {
        time: new Date().toISOString(),
      })
    }, 25000)

  // ------------------------------------------------
  // DISCONNECT
  // ------------------------------------------------

  socket.on(
    'disconnect',
    () => {
      let disconnectedUser = null

      for (
        const [
          userId,
          user,
        ] of users.entries()
      ) {
        if (
          user.socketId ===
          socket.id
        ) {
          disconnectedUser = {
            userId,
            ...user,
          }

          break
        }
      }

      if (disconnectedUser) {
        users.delete(
          disconnectedUser.userId
        )

        socket.broadcast.emit(
          'user_left',
          {
            userId:
              disconnectedUser.userId,
            username:
              disconnectedUser.username,
          }
        )

        socket.broadcast.emit(
          'user_stopped_typing',
          {
            userId:
              disconnectedUser.userId,
          }
        )

        console.log(
          `${disconnectedUser.username} disconnected`
        )
      }

      clearInterval(heartbeat)

      console.log(
        `Connected users: ${users.size}`
      )
    }
  )
})

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT =
  process.env.PORT || 3000

server.listen(
  PORT,
  () => {
    console.log(
      `Samvad server running on port ${PORT}`
    )
  }
)