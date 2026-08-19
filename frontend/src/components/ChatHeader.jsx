import {
  MoreVertical,
  UserRound,
} from 'lucide-react'

const initials = (name = '') =>
  name
    .split(' ')
    .map(
      (part) => part[0]
    )
    .join('')
    .slice(0, 2)
    .toUpperCase()

const languageNames = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  bn: 'Bengali',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  ta: 'Tamil',
  te: 'Telugu',
  ur: 'Urdu',
}

function ChatHeader({
  user,
  connected,
  onProfile,
  isTyping,
}) {
  if (!user) {
    return (
      <header className="chat-header empty-header">
        <div>
          <strong>
            Samvad
          </strong>

          <span>
            Select someone to start chatting
          </span>
        </div>
      </header>
    )
  }

  return (
    <header className="chat-header">
      <div className="chat-person">
        <div className="avatar large">
          {initials(
            user.username
          )}

          <span className="status-dot online" />
        </div>

        <div className="person-copy">
          <strong>
            {user.username}
          </strong>

          <span>
            {isTyping ? (
              <>
                <i className="typing-indicator-dot" />
                Typing...
              </>
            ) : (
              <>
                <i className="status-indicator" />

                {connected
                  ? 'Online'
                  : 'Connecting...'}

                {' · '}

                {languageNames[
                  user.preferredLanguage
                ] ||
                  user.preferredLanguage}
              </>
            )}
          </span>
        </div>
      </div>

      <div className="chat-actions">
        <button
          className="icon-button"
          onClick={
            onProfile
          }
          title="Profile"
          type="button"
        >
          <UserRound size={19} />
        </button>

        <button
          className="icon-button"
          title="More"
          type="button"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </header>
  )
}

export default ChatHeader