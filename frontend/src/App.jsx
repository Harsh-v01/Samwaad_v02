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

import WelcomeScreen from './components/WelcomeScreen'
import Sidebar from './components/Sidebar'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'
import ProfilePanel from './components/ProfilePanel'

import useSocket from './hooks/useSocket'
import useUsers from './hooks/useUsers'
import useMessages from './hooks/useMessages'

import './App.css'

const USERNAME_KEY = 'samvad_username'
const LANGUAGE_KEY = 'samvad_language'
const USER_ID_KEY = 'samvad_user_id'

function createUserId() {
  return (
    crypto.randomUUID?.() ||
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
  )
}

function App() {
  const {
    socket,
    connected,
    connect,
    disconnect,
  } = useSocket()

  const [userId] = useState(() => {
    const existing =
      sessionStorage.getItem(USER_ID_KEY)

    if (existing) {
      return existing
    }

    const newId = createUserId()

    sessionStorage.setItem(
      USER_ID_KEY,
      newId
    )

    return newId
  })

  const [username, setUsername] = useState(
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
    useState(() =>
      Boolean(
        sessionStorage.getItem(
          USERNAME_KEY
        )
      )
    )

  const [search, setSearch] =
    useState('')

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [darkMode, setDarkMode] =
    useState(
      () =>
        localStorage.getItem(
          'samvad_dark'
        ) === 'true'
    )

  const {
    users,
    selectedUserId,
    setSelectedUserId,
    setUsers,
  } = useUsers({
    socket,
    userId,
  })

  const {
    messages,
    setMessages,
    typingUsers,
    clearTypingForUser,
  } = useMessages({
    socket,
    userId,
  })

  // --------------------------------------------------
  // JOIN CURRENT USER WHEN SOCKET IS READY
  // --------------------------------------------------

  useEffect(() => {
    if (!connected || !username) {
      return
    }

    socket.emit('user_join', {
      userId,
      username,
      preferredLanguage,
    })
  }, [
    connected,
    socket,
    userId,
    username,
    preferredLanguage,
  ])

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
  // VISIBLE USERS
  // --------------------------------------------------

  const visibleUsers = useMemo(() => {
    const query =
      search.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter((user) =>
      user.username
        .toLowerCase()
        .includes(query)
    )
  }, [users, search])

  // --------------------------------------------------
  // SELECTED USER
  // --------------------------------------------------

  const selectedUser = useMemo(
    () =>
      users.find(
        (user) =>
          user.id === selectedUserId
      ) || null,
    [users, selectedUserId]
  )

  // --------------------------------------------------
  // VISIBLE MESSAGES
  // --------------------------------------------------

  const visibleMessages = useMemo(() => {
    if (!selectedUser) {
      return []
    }

    return messages.filter(
      (message) => {
        const sentByMe =
          message.senderId === userId &&
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

  const selectUser = (recipientId) => {
    setSelectedUserId(recipientId)
    clearTypingForUser(recipientId)

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

  const handleTyping = (isTyping) => {
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

  const sendMessage = (text) => {
    if (
      !text?.trim() ||
      !selectedUser ||
      !socket.connected
    ) {
      return
    }

    socket.emit('send_message', {
      senderId: userId,
      recipientId:
        selectedUser.id,
      message: text.trim(),
      timestamp:
        new Date().toISOString(),
    })
  }

  // --------------------------------------------------
  // LANGUAGE
  // --------------------------------------------------

  const changeLanguage = (language) => {
    setPreferredLanguage(language)

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

  const joinChat = (event) => {
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

    setUsername(cleanName)
    setJoined(true)

    if (!socket.connected) {
      connect()
    }
  }

  // --------------------------------------------------
  // LEAVE
  // --------------------------------------------------

  const leaveChat = () => {
    sessionStorage.removeItem(
      USERNAME_KEY
    )

    sessionStorage.removeItem(
      LANGUAGE_KEY
    )

    sessionStorage.removeItem(
      USER_ID_KEY
    )

    disconnect()

    setUsername('')
    setJoined(false)
    setUsers([])
    setMessages([])
    setSelectedUserId(null)
    setProfileOpen(false)
  }

  // --------------------------------------------------
  // WELCOME
  // --------------------------------------------------

  if (!joined || !username) {
    return (
      <WelcomeScreen
        darkMode={darkMode}
        nameInput={nameInput}
        preferredLanguage={
          preferredLanguage
        }
        onNameChange={setNameInput}
        onLanguageChange={
          setPreferredLanguage
        }
        onSubmit={joinChat}
      />
    )
  }

  // --------------------------------------------------
  // MAIN APP
  // --------------------------------------------------

  return (
    <div
      className={`app-shell ${
        darkMode ? 'dark' : ''
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
              setProfileOpen(true)
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

            <strong>Samvad</strong>

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
              setProfileOpen(true)
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
            onSend={sendMessage}
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
          onLeave={leaveChat}
          onClose={() =>
            setProfileOpen(false)
          }
        />
      )}
    </div>
  )
}

export default App
