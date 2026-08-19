import { useEffect, useState } from 'react'

function useMessages({
  socket,
  userId,
}) {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState({})

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      setMessages((currentMessages) => {
        const messageKey =
          message.id ||
          `${message.senderId}-${message.recipientId}-${message.timestamp}`

        const alreadyExists = currentMessages.some(
          (item) =>
            (item.id && message.id && item.id === message.id) ||
            (!item.id &&
              `${item.senderId}-${item.recipientId}-${item.timestamp}` ===
                messageKey)
        )

        if (alreadyExists) {
          return currentMessages
        }

        return [...currentMessages, message]
      })
    }

    const handleConversationHistory = ({
      recipientId,
      messages: history = [],
    }) => {
      setMessages((currentMessages) => {
        const otherMessages = currentMessages.filter(
          (message) => {
            const belongsToConversation =
              (message.senderId === userId &&
                message.recipientId === recipientId) ||
              (message.senderId === recipientId &&
                message.recipientId === userId)

            return !belongsToConversation
          }
        )

        return [...otherMessages, ...history]
      })
    }

    const handleMessageError = (error) => {
      console.error('Message error:', error)
    }

    const handleUserTyping = (data) => {
      setTypingUsers((current) => ({
        ...current,
        [data.userId]: true,
      }))
    }

    const handleUserStoppedTyping = (data) => {
      setTypingUsers((current) => {
        const next = { ...current }
        delete next[data.userId]
        return next
      })
    }

    const handleUserLeft = (data) => {
      setTypingUsers((current) => {
        const next = { ...current }
        delete next[data.userId]
        return next
      })
    }

    socket.on('receive_message', handleReceiveMessage)
    socket.on(
      'conversation_history',
      handleConversationHistory
    )
    socket.on('message_error', handleMessageError)
    socket.on('user_typing', handleUserTyping)
    socket.on(
      'user_stopped_typing',
      handleUserStoppedTyping
    )
    socket.on('user_left', handleUserLeft)

    return () => {
      socket.off('receive_message', handleReceiveMessage)
      socket.off(
        'conversation_history',
        handleConversationHistory
      )
      socket.off('message_error', handleMessageError)
      socket.off('user_typing', handleUserTyping)
      socket.off(
        'user_stopped_typing',
        handleUserStoppedTyping
      )
      socket.off('user_left', handleUserLeft)
    }
  }, [socket, userId])

  const clearTypingForUser = (recipientId) => {
    setTypingUsers((current) => {
      const next = { ...current }
      delete next[recipientId]
      return next
    })
  }

  return {
    messages,
    setMessages,
    typingUsers,
    clearTypingForUser,
  }
}

export default useMessages
