import {
  Circle,
  MessageCircle,
  Search,
  Settings,
} from 'lucide-react'

import { languageNames } from '../utils/language'
import { getInitials } from '../utils/initials'

function Sidebar({
  username,
  users,
  selectedUserId,
  search,
  preferredLanguage,
  connected,
  onSearchChange,
  onSelectUser,
  onProfile,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark">
            <MessageCircle size={19} />
          </div>

          <div>
            <strong>Samvad</strong>
            <span>Real-time communication</span>
          </div>
        </div>

        <button
          className="icon-button"
          onClick={onProfile}
          title="Profile"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="current-user">
        <div className="avatar my-avatar">
          {getInitials(username)}
          <span className="status-dot online" />
        </div>

        <div>
          <strong>{username}</strong>

          <span className="current-user-status">
            <Circle size={7} fill="currentColor" />
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="search-box">
        <Search size={16} />

        <input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search people"
        />
      </div>

      <div className="section-heading">
        <span>People</span>
        <span>{users.length}</span>
      </div>

      <div className="conversation-list">
        {users.map((user) => {
          const active = selectedUserId === user.id

          return (
            <button
              key={user.id}
              className={`conversation ${active ? 'active' : ''}`}
              onClick={() => onSelectUser(user.id)}
            >
              <div className="avatar">
                {getInitials(user.username)}

                <span className="status-dot online" />
              </div>

              <div className="conversation-copy">
                <strong>{user.username}</strong>

                <span>
                  {languageNames[user.preferredLanguage] ||
                    user.preferredLanguage}
                </span>
              </div>
            </button>
          )
        })}

        {users.length === 0 && (
          <div className="empty-people">
            <MessageCircle size={22} />
            <strong>No one else is here</strong>
            <span>
              Open another Samvad session to start a conversation.
            </span>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <span>Language</span>

        <strong>
          {languageNames[preferredLanguage] || preferredLanguage}
        </strong>
      </div>
    </aside>
  )
}

export default Sidebar