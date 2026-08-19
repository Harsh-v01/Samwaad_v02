import {
  MoreVertical,
  UserRound,
} from 'lucide-react'

import { languageNames } from '../utils/language'
import { getInitials } from '../utils/initials'

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
          {getInitials(
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