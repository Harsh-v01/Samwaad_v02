import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Languages,
  LoaderCircle,
} from 'lucide-react'

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
  as: 'Assamese',
}

const initials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

async function translateText(
  text,
  fromLanguage,
  toLanguage
) {
  if (!text) return ''

  if (fromLanguage === toLanguage) {
    return text
  }

  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx` +
    `&sl=${encodeURIComponent(fromLanguage)}` +
    `&tl=${encodeURIComponent(toLanguage)}` +
    `&dt=t` +
    `&q=${encodeURIComponent(text)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Translation failed: ${response.status}`
    )
  }

  const result = await response.json()

  if (!result?.[0]) {
    throw new Error(
      'Unexpected translation response.'
    )
  }

  return (
    result[0]
      .map((item) => item?.[0])
      .filter(Boolean)
      .join('') || text
  )
}

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
          {initials(selectedUser.username)}
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
                  {initials(
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
                      {message.timestamp
                        ? new Date(
                            message.timestamp
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                            }
                          )
                        : ''}
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