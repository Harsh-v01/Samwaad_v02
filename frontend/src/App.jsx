import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Menu,
  Moon,
  Sun,
} from 'lucide-react'

import { io } from 'socket.io-client'

import Sidebar from './components/Sidebar'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'
import ProfilePanel from './components/ProfilePanel'

import './App.css'

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  'http://localhost:3000'

const USERNAME_KEY =
  'samvad_username'

const LANGUAGE_KEY =
  'samvad_language'

const USER_ID_KEY =
  'samvad_user_id'

const socket = io(
  SERVER_URL,
  {
    autoConnect: true,
  }
)

function createUserId() {
  return (
    crypto.randomUUID?.() ||
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
  )
}

function App() {
  // --------------------------------------------------
  // USER ID
  // --------------------------------------------------

  const [userId] = useState(() => {
    const existing =
      sessionStorage.getItem(
        USER_ID_KEY
      )

    if (existing) {
      return existing
    }

    const newId =
      createUserId()

    sessionStorage.setItem(
      USER_ID_KEY,
      newId
    )

    return newId
  })

  const [username, setUsername] =
    useState(
      () =>
        sessionStorage.getItem(
          USERNAME_KEY
        ) || ''
    )

  const [preferredLanguage, setPreferredLanguage] =
    useState(
      () =>
        sessionStorage.getItem(
          LANGUAGE_KEY
        ) || 'en'
    )

  const [nameInput, setNameInput] =
    useState('')

  const [joined, setJoined] =
    useState(
      () =>
        Boolean(
          sessionStorage.getItem(
            USERNAME_KEY
          )
        )
    )

  const [connected, setConnected] =
    useState(
      socket.connected
    )

  const [users, setUsers] =
    useState([])

  const [selectedUserId, setSelectedUserId] =
    useState(null)

  const [messages, setMessages] =
    useState([])

  const [search, setSearch] =
    useState('')

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [typingUsers, setTypingUsers] =
    useState({})

  const [darkMode, setDarkMode] =
    useState(
      () =>
        localStorage.getItem(
          'samvad_dark'
        ) === 'true'
    )

  // --------------------------------------------------
  // SOCKET CONNECTION
  // --------------------------------------------------

  useEffect(() => {
    const handleConnect = () => {
      console.log(
        'Connected:',
        socket.id
      )

      setConnected(true)

      if (username) {
        socket.emit(
          'user_join',
          {
            userId,
            username,
            preferredLanguage,
          }
        )
      }
    }

    const handleDisconnect = () => {
      console.log(
        'Disconnected'
      )

      setConnected(false)
    }

    socket.on(
      'connect',
      handleConnect
    )

    socket.on(
      'disconnect',
      handleDisconnect
    )

    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.off(
        'connect',
        handleConnect
      )

      socket.off(
        'disconnect',
        handleDisconnect
      )
    }
  }, [
    userId,
    username,
    preferredLanguage,
  ])

  // --------------------------------------------------
  // USER LIST
  // --------------------------------------------------

  useEffect(() => {
    const handleUserList =
      (serverUsers) => {
        setUsers(
          serverUsers.filter(
            (user) =>
              user.id !== userId
          )
        )
      }

    const handleUserJoined =
      (user) => {
        if (
          user.userId ===
          userId
        ) {
          return
        }

        setUsers(
          (currentUsers) => {
            const exists =
              currentUsers.some(
                (existing) =>
                  existing.id ===
                  user.userId
              )

            if (exists) {
              return currentUsers.map(
                (existing) =>
                  existing.id ===
                  user.userId
                    ? {
                        ...existing,
                        username:
                          user.username,
                        preferredLanguage:
                          user.preferredLanguage,
                      }
                    : existing
              )
            }

            return [
              ...currentUsers,
              {
                id: user.userId,
                username:
                  user.username,
                preferredLanguage:
                  user.preferredLanguage ||
                  'en',
              },
            ]
          }
        )
      }

    const handleUserUpdated =
      (data) => {
        setUsers(
          (currentUsers) =>
            currentUsers.map(
              (user) =>
                user.id ===
                data.userId
                  ? {
                      ...user,
                      preferredLanguage:
                        data.preferredLanguage,
                    }
                  : user
            )
        )
      }

    const handleUserLeft =
      (data) => {
        setUsers(
          (currentUsers) =>
            currentUsers.filter(
              (user) =>
                user.id !==
                data.userId
            )
        )

        setTypingUsers(
          (current) => {
            const next = {
              ...current,
            }

            delete next[
              data.userId
            ]

            return next
          }
        )

        setSelectedUserId(
          (current) =>
            current ===
            data.userId
              ? null
              : current
        )
      }

    socket.on(
      'user_list',
      handleUserList
    )

    socket.on(
      'user_joined',
      handleUserJoined
    )

    socket.on(
      'user_updated',
      handleUserUpdated
    )

    socket.on(
      'user_left',
      handleUserLeft
    )

    return () => {
      socket.off(
        'user_list',
        handleUserList
      )

      socket.off(
        'user_joined',
        handleUserJoined
      )

      socket.off(
        'user_updated',
        handleUserUpdated
      )

      socket.off(
        'user_left',
        handleUserLeft
      )
    }
  }, [userId])

  // --------------------------------------------------
  // MESSAGES + TYPING
  // --------------------------------------------------

  useEffect(() => {
    const handleReceiveMessage =
      (message) => {
        setMessages(
          (currentMessages) => {
            const alreadyExists =
              currentMessages.some(
                (item) =>
                  item.id ===
                  message.id
              )

            if (alreadyExists) {
              return currentMessages
            }

            return [
              ...currentMessages,
              message,
            ]
          }
        )
      }

    const handleConversationHistory =
      ({
        recipientId,
        messages:
          history,
      }) => {
        setMessages(
          (currentMessages) => {
            const otherMessages =
              currentMessages.filter(
                (message) => {
                  const belongsToConversation =
                    (
                      message.senderId ===
                        userId &&
                      message.recipientId ===
                        recipientId
                    ) ||
                    (
                      message.senderId ===
                        recipientId &&
                      message.recipientId ===
                        userId
                    )

                  return (
                    !belongsToConversation
                  )
                }
              )

            return [
              ...otherMessages,
              ...history,
            ]
          }
        )
      }

    const handleMessageError =
      (error) => {
        console.error(
          'Message error:',
          error
        )
      }

    const handleUserTyping =
      (data) => {
        setTypingUsers(
          (current) => ({
            ...current,
            [data.userId]: true,
          })
        )
      }

    const handleUserStoppedTyping =
      (data) => {
        setTypingUsers(
          (current) => {
            const next = {
              ...current,
            }

            delete next[
              data.userId
            ]

            return next
          }
        )
      }

    socket.on(
      'receive_message',
      handleReceiveMessage
    )

    socket.on(
      'conversation_history',
      handleConversationHistory
    )

    socket.on(
      'message_error',
      handleMessageError
    )

    socket.on(
      'user_typing',
      handleUserTyping
    )

    socket.on(
      'user_stopped_typing',
      handleUserStoppedTyping
    )

    return () => {
      socket.off(
        'receive_message',
        handleReceiveMessage
      )

      socket.off(
        'conversation_history',
        handleConversationHistory
      )

      socket.off(
        'message_error',
        handleMessageError
      )

      socket.off(
        'user_typing',
        handleUserTyping
      )

      socket.off(
        'user_stopped_typing',
        handleUserStoppedTyping
      )
    }
  }, [userId])

  // --------------------------------------------------
  // DARK MODE
  // --------------------------------------------------

  useEffect(() => {
    localStorage.setItem(
      'samvad_dark',
      String(darkMode)
    )
  }, [darkMode])

  // --------------------------------------------------
  // USERS
  // --------------------------------------------------

  const visibleUsers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      if (!query) {
        return users
      }

      return users.filter(
        (user) =>
          user.username
            .toLowerCase()
            .includes(query)
      )
    }, [users, search])

  // --------------------------------------------------
  // SELECTED USER
  // --------------------------------------------------

  const selectedUser =
    useMemo(
      () =>
        users.find(
          (user) =>
            user.id ===
            selectedUserId
        ) || null,
      [
        users,
        selectedUserId,
      ]
    )

  // --------------------------------------------------
  // VISIBLE MESSAGES
  // --------------------------------------------------

  const visibleMessages =
    useMemo(() => {
      if (!selectedUser) {
        return []
      }

      return messages.filter(
        (message) => {
          const sentByMe =
            message.senderId ===
              userId &&
            message.recipientId ===
              selectedUser.id

          const receivedFromUser =
            message.senderId ===
              selectedUser.id &&
            message.recipientId ===
              userId

          return (
            sentByMe ||
            receivedFromUser
          )
        }
      )
    }, [
      messages,
      selectedUser,
      userId,
    ])

  // --------------------------------------------------
  // SELECT CONVERSATION
  // --------------------------------------------------

  const selectUser =
    (recipientId) => {
      setSelectedUserId(
        recipientId
      )

      // Clear typing indicator when switching chats.
      setTypingUsers(
        (current) => {
          const next = {
            ...current,
          }

          delete next[
            recipientId
          ]

          return next
        }
      )

      if (socket.connected) {
        socket.emit(
          'get_conversation',
          {
            userId,
            recipientId,
          }
        )
      }
    }

  // --------------------------------------------------
  // TYPING
  // --------------------------------------------------

  const handleTyping =
    (isTyping) => {
      if (
        !selectedUser ||
        !socket.connected
      ) {
        return
      }

      socket.emit(
        isTyping
          ? 'typing_start'
          : 'typing_stop',
        {
          senderId: userId,
          recipientId:
            selectedUser.id,
        }
      )
    }

  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

  const sendMessage =
    (text) => {
      if (
        !text?.trim() ||
        !selectedUser ||
        !socket.connected
      ) {
        return
      }

      socket.emit(
        'send_message',
        {
          senderId: userId,
          recipientId:
            selectedUser.id,
          message:
            text.trim(),
          timestamp:
            new Date().toISOString(),
        }
      )
    }

  // --------------------------------------------------
  // LANGUAGE
  // --------------------------------------------------

  const changeLanguage =
    (language) => {
      setPreferredLanguage(
        language
      )

      sessionStorage.setItem(
        LANGUAGE_KEY,
        language
      )

      if (socket.connected) {
        socket.emit(
          'language_change',
          {
            userId,
            language,
          }
        )
      }
    }

  // --------------------------------------------------
  // JOIN
  // --------------------------------------------------

  const joinChat =
    (event) => {
      event.preventDefault()

      const cleanName =
        nameInput.trim()

      if (!cleanName) {
        return
      }

      sessionStorage.setItem(
        USERNAME_KEY,
        cleanName
      )

      sessionStorage.setItem(
        LANGUAGE_KEY,
        preferredLanguage
      )

      setUsername(
        cleanName
      )

      setJoined(true)

      if (socket.connected) {
        socket.emit(
          'user_join',
          {
            userId,
            username:
              cleanName,
            preferredLanguage,
          }
        )
      }
    }

  // --------------------------------------------------
  // LEAVE
  // --------------------------------------------------

  const leaveChat =
    () => {
      sessionStorage.removeItem(
        USERNAME_KEY
      )

      sessionStorage.removeItem(
        LANGUAGE_KEY
      )

      sessionStorage.removeItem(
        USER_ID_KEY
      )

      socket.disconnect()

      setUsername('')
      setJoined(false)
      setUsers([])
      setMessages([])
      setSelectedUserId(null)
      setProfileOpen(false)
      setTypingUsers({})
    }

  // --------------------------------------------------
  // WELCOME
  // --------------------------------------------------

  if (!joined || !username) {
    return (
      <div
        className={`welcome-screen ${
          darkMode
            ? 'dark'
            : ''
        }`}
      >
        <div className="welcome-card">
          <div className="welcome-logo">
            <span>स</span>
          </div>

          <span className="welcome-label">
            SAMVAD
          </span>

          <h1>
            Talk naturally.
            <br />
            Understand each other.
          </h1>

          <p>
            A real-time communication
            space designed to make
            conversations easier across
            languages.
          </p>

          <form
            onSubmit={joinChat}
          >
            <label>
              Your name

              <input
                value={nameInput}
                onChange={(event) =>
                  setNameInput(
                    event.target
                      .value
                  )
                }
                placeholder="Enter your name"
                maxLength={30}
                autoFocus
              />
            </label>

            <label>
              Your language

              <select
                value={
                  preferredLanguage
                }
                onChange={(event) =>
                  setPreferredLanguage(
                    event.target
                      .value
                  )
                }
              >
                <option value="en">
                  English
                </option>

                <option value="hi">
                  Hindi
                </option>

                <option value="mr">
                  Marathi
                </option>

                <option value="bn">
                  Bengali
                </option>

                <option value="gu">
                  Gujarati
                </option>

                <option value="kn">
                  Kannada
                </option>

                <option value="ml">
                  Malayalam
                </option>

                <option value="ta">
                  Tamil
                </option>

                <option value="te">
                  Telugu
                </option>

                <option value="ur">
                  Urdu
                </option>
              </select>
            </label>

            <button
              type="submit"
              disabled={
                !nameInput.trim()
              }
            >
              Enter Samvad
            </button>
          </form>

          <small>
            Your language preference can
            be changed later.
          </small>
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // MAIN APP
  // --------------------------------------------------

  return (
    <div
      className={`app-shell ${
        darkMode
          ? 'dark'
          : ''
      }`}
    >
      <div className="app-frame">
        <div className="sidebar-wrap">
          <Sidebar
            username={username}
            users={visibleUsers}
            selectedUserId={
              selectedUserId
            }
            search={search}
            preferredLanguage={
              preferredLanguage
            }
            connected={connected}
            onSearchChange={
              setSearch
            }
            onSelectUser={
              selectUser
            }
            onProfile={() =>
              setProfileOpen(
                true
              )
            }
          />
        </div>

        <main className="chat-area">
          <div className="mobile-topbar">
            <button
              className="icon-button"
              type="button"
            >
              <Menu size={20} />
            </button>

            <strong>
              Samvad
            </strong>

            <button
              className="icon-button"
              type="button"
              onClick={() =>
                setDarkMode(
                  (current) =>
                    !current
                )
              }
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </div>

          <ChatHeader
            user={selectedUser}
            connected={connected}
            isTyping={
              selectedUser
                ? Boolean(
                    typingUsers[
                      selectedUser.id
                    ]
                  )
                : false
            }
            onProfile={() =>
              setProfileOpen(
                true
              )
            }
          />

          <MessageList
            messages={
              visibleMessages
            }
            currentSocketId={
              userId
            }
            selectedUser={
              selectedUser
            }
          />

          <MessageInput
            onSend={
              sendMessage
            }
            onTyping={
              handleTyping
            }
            disabled={
              !selectedUser ||
              !connected
            }
          />
        </main>

        <button
          className="theme-floating-button"
          onClick={() =>
            setDarkMode(
              (current) =>
                !current
            )
          }
          title="Toggle theme"
          type="button"
        >
          {darkMode ? (
            <Sun size={17} />
          ) : (
            <Moon size={17} />
          )}
        </button>
      </div>

      {profileOpen && (
        <ProfilePanel
          username={username}
          preferredLanguage={
            preferredLanguage
          }
          onLanguageChange={
            changeLanguage
          }
          onLeave={
            leaveChat
          }
          onClose={() =>
            setProfileOpen(
              false
            )
          }
        />
      )}
    </div>
  )
}

export default App