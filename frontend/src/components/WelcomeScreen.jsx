import {
  ArrowRight,
  Globe2,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import './WelcomeScreen.css'
const languages = [
  ['en', 'English'],
  ['hi', 'Hindi'],
  ['mr', 'Marathi'],
  ['bn', 'Bengali'],
  ['gu', 'Gujarati'],
  ['kn', 'Kannada'],
  ['ml', 'Malayalam'],
  ['ta', 'Tamil'],
  ['te', 'Telugu'],
  ['ur', 'Urdu'],
]

function WelcomeScreen({
  darkMode,
  nameInput,
  preferredLanguage,
  onNameChange,
  onLanguageChange,
  onSubmit,
}) {
  return (
    <div
      className={`welcome-screen ${
        darkMode ? 'dark' : ''
      }`}
    >
      <div className="welcome-layout">
        <section className="welcome-story">
          <div className="welcome-brand">
            <div className="welcome-mark">
              <span>स</span>
            </div>

            <div>
              <strong>Samvad</strong>
              <span>साथ बात करें</span>
            </div>
          </div>

          <div className="welcome-copy">
            <span className="welcome-eyebrow">
              REAL-TIME · MULTILINGUAL · ACCESSIBLE
            </span>

            <h1>
              Talk naturally.
              <br />
              <em>Understand each other.</em>
            </h1>

            <p>
              Samvad brings people together across
              language barriers through real-time
              communication and translation.
            </p>
          </div>

          <div className="welcome-features">
            <div>
              <MessageCircle size={17} />
              <span>Live conversations</span>
            </div>

            <div>
              <Globe2 size={17} />
              <span>Multiple Indian languages</span>
            </div>

            <div>
              <ShieldCheck size={17} />
              <span>Built for accessible communication</span>
            </div>
          </div>
        </section>

        <section className="welcome-form-section">
          <div className="welcome-form-card">
            <div className="form-heading">
              <span>GET STARTED</span>

              <h2>Join the conversation</h2>

              <p>
                Choose how you'd like to communicate.
              </p>
            </div>

            <form onSubmit={onSubmit}>
              <label>
                <span>Your name</span>

                <input
                  value={nameInput}
                  onChange={(event) =>
                    onNameChange(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Harsh"
                  maxLength={30}
                  autoFocus
                />
              </label>

              <label>
                <span>Preferred language</span>

                <div className="language-select">
                  <Globe2 size={17} />

                  <select
                    value={preferredLanguage}
                    onChange={(event) =>
                      onLanguageChange(
                        event.target.value
                      )
                    }
                  >
                    {languages.map(
                      ([code, name]) => (
                        <option
                          value={code}
                          key={code}
                        >
                          {name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </label>

              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="welcome-submit"
              >
                <span>Enter Samvad</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="welcome-note">
              <span className="live-dot" />
              Your language can be changed anytime
            </div>
          </div>
        </section>
      </div>

      <footer className="welcome-footer">
        <span>Samvad</span>
        <span>Real-time communication without language barriers.</span>
      </footer>
    </div>
  )
}

export default WelcomeScreen