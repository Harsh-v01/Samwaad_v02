import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Languages,
  LoaderCircle,
} from 'lucide-react'

import { translateText } from '../services/translation'
import { languageNames } from '../utils/language'
import { getInitials } from '../utils/initials'
import { formatTime } from '../utils/formatTime'

function MessageList({
  messages,
  currentSocketId,
  selectedUser,
}) {
  const [translations, setTranslations] =
    useState({})

  const [translating, setTranslating] =
    useState({})

  const [translationErrors, setTranslationErrors] =
    useState({})

  /*
   * This element sits at the very bottom
   * of the message list.
   */
  const bottomRef = useRef(null)

  /*
   * Automatically move to the newest message.
   */
  useEffect(() => {
    if (!selectedUser) return

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages.length, selectedUser])

  const handleTranslation = async (message) => {
    const messageId =
      message.id ||
      `${message.senderId}-${message.timestamp}`

    /*
     * If translation already exists,
     * simply toggle it.
     */
    if (
      Object.prototype.hasOwnProperty.call(
        translations,
        messageId
      )
    ) {
      setTranslations((current) => {
        const next = { ...current }

        delete next[messageId]

        return next
      })

      return
    }

    const sourceLanguage =
      message.sourceLanguage || 'en'

    const targetLanguage =
      message.targetLanguage ||
      selectedUser.preferredLanguage ||
      'en'

    /*
     * Same language = no translation required.
     */
    if (
      sourceLanguage === targetLanguage
    ) {
      setTranslations((current) => ({
        ...current,
        [messageId]:
          message.originalText ||
          message.message ||
          '',
      }))

      return
    }

    setTranslating((current) => ({
      ...current,
      [messageId]: true,
    }))

    setTranslationErrors((current) => {
      const next = { ...current }

      delete next[messageId]

      return next
    })

    try {
      const originalText =
        message.originalText ||
        message.message ||
        ''

      const translated =
        await translateText(
          originalText,
          sourceLanguage,
          targetLanguage
        )

      setTranslations((current) => ({
        ...current,
        [messageId]: translated,
      }))
    } catch (error) {
      console.error(
        'Samvad translation error:',
        error
      )

      setTranslationErrors((current) => ({
        ...current,
        [messageId]:
          'Translation unavailable right now.',
      }))
    } finally {
      setTranslating((current) => {
        const next = { ...current }

        delete next[messageId]

        return next
      })
    }
  }

  if (!selectedUser) {
    return (
      <section className="message-area empty-chat">
        <div className="empty-chat-content">
          <div className="empty-chat-icon">
            <Languages size={24} />
          </div>

          <h2>Choose a conversation</h2>

          <p>
            Select someone from the people list
            to start a conversation.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="message-area">
      <div className="chat-intro">
        <div className="avatar large">
          {getInitials(selectedUser.username)}
        </div>

        <strong>
          {selectedUser.username}
        </strong>

        <span>
          {languageNames[
            selectedUser.preferredLanguage
          ] ||
            selectedUser.preferredLanguage}
        </span>
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <div className="no-messages">
            No messages yet. Say hello.
          </div>
        )}

        {messages.map((message, index) => {
          const mine =
            message.senderId ===
            currentSocketId

          const messageId =
            message.id ||
            `${message.senderId}-${message.timestamp}-${index}`

          const translatedText =
            translations[messageId]

          const isTranslating =
            translating[messageId]

          const translationError =
            translationErrors[messageId]

          const sourceLanguage =
            message.sourceLanguage ||
            'en'

          const targetLanguage =
            message.targetLanguage ||
            selectedUser.preferredLanguage ||
            'en'

          const originalText =
            message.originalText ||
            message.message ||
            ''

          const sameLanguage =
            sourceLanguage ===
            targetLanguage

          return (
            <div
              className={`message-row ${
                mine
                  ? 'mine'
                  : 'theirs'
              }`}
              key={messageId}
            >
              {!mine && (
                <div className="message-avatar">
                  {getInitials(
                    message.senderName ||
                      selectedUser.username
                  )}
                </div>
              )}

              <div className="message-content">
                {!mine && (
                  <span className="sender-name">
                    {message.senderName}
                  </span>
                )}

                <div className="bubble">
                  <p>{originalText}</p>

                  <div className="message-meta">
                    <time>
                      {formatTime(message.timestamp)}
                    </time>
                  </div>
                </div>

                {!mine &&
                  !sameLanguage && (
                    <>
                      <button
                        className="translate-action"
                        onClick={() =>
                          handleTranslation(
                            message
                          )
                        }
                        disabled={
                          isTranslating
                        }
                      >
                        {isTranslating ? (
                          <LoaderCircle
                            size={13}
                            className="spin"
                          />
                        ) : (
                          <Languages
                            size={13}
                          />
                        )}

                        {isTranslating
                          ? 'Translating...'
                          : translatedText
                            ? 'Hide translation'
                            : `Translate to ${
                                languageNames[
                                  targetLanguage
                                ] ||
                                targetLanguage
                              }`}
                      </button>

                      {translatedText && (
                        <div className="translation-result">
                          <span className="translation-label">
                            {languageNames[
                              targetLanguage
                            ] ||
                              targetLanguage}
                          </span>

                          <p>
                            {translatedText}
                          </p>
                        </div>
                      )}

                      {translationError && (
                        <div className="translation-error">
                          {translationError}
                        </div>
                      )}
                    </>
                  )}
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>
    </section>
  )
}

export default MessageList