import { useState } from 'react'
import {
  Bell,
  Globe2,
  LogOut,
  Moon,
  ShieldCheck,
  X,
} from 'lucide-react'

import { getInitials } from '../utils/initials'
import { languageNames } from '../utils/language'

function ProfilePanel({
  username,
  preferredLanguage,
  onLanguageChange,
  onLeave,
  onClose,
}) {
  const [notifications, setNotifications] = useState(true)

  const languages = Object.entries(languageNames)

  return (
    <div
      className="profile-overlay"
      onClick={onClose}
    >
      <aside
        className="profile-panel"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="profile-header">
          <div>
            <span>Samvad</span>
            <h2>Your profile</h2>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="profile-user">
          <div className="profile-avatar">
            {getInitials(username)}
          </div>

          <h3>{username}</h3>

          <span>
            <i />
            Online
          </span>
        </div>

        <div className="profile-section">
          <span className="profile-title">
            Communication
          </span>

          <label className="settings-row">
            <div className="settings-icon">
              <Globe2 size={18} />
            </div>

            <div>
              <strong>Preferred language</strong>

              <select
                value={preferredLanguage}
                onChange={(event) =>
                  onLanguageChange(event.target.value)
                }
              >
                {languages.map(([code, name]) => (
                  <option
                    value={code}
                    key={code}
                  >
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <button
            className="settings-row"
            onClick={() =>
              setNotifications((value) => !value)
            }
          >
            <div className="settings-icon">
              <Bell size={18} />
            </div>

            <div>
              <strong>Notifications</strong>
              <span>
                {notifications
                  ? 'Enabled'
                  : 'Disabled'}
              </span>
            </div>

            <div
              className={`toggle ${
                notifications ? 'on' : ''
              }`}
            >
              <span />
            </div>
          </button>

          <div className="settings-row">
            <div className="settings-icon">
              <Moon size={18} />
            </div>

            <div>
              <strong>Appearance</strong>
              <span>
                Use the theme button in the chat
              </span>
            </div>
          </div>
        </div>

        <div className="privacy-card">
          <ShieldCheck size={19} />

          <div>
            <strong>About Samvad</strong>

            <p>
              A communication tool focused on
              making conversations easier across
              language barriers.
            </p>
          </div>
        </div>

        <button
          className="leave-button"
          onClick={onLeave}
        >
          <LogOut size={17} />
          Leave Samvad
        </button>
      </aside>
    </div>
  )
}

export default ProfilePanel