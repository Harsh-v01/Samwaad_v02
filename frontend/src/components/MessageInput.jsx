import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Languages,
  Mic,
  Paperclip,
  Send,
  Smile,
} from 'lucide-react'

function MessageInput({
  onSend,
  onTyping,
  disabled,
}) {
  const [text, setText] =
    useState('')

  const textareaRef =
    useRef(null)

  const typingTimer =
    useRef(null)

  const stopTypingTimer = () => {
    if (typingTimer.current) {
      clearTimeout(
        typingTimer.current
      )

      typingTimer.current = null
    }
  }

  const send = () => {
    if (
      disabled ||
      !text.trim()
    ) {
      return
    }

    stopTypingTimer()

    onTyping?.(false)

    onSend(text)

    setText('')

    if (textareaRef.current) {
      textareaRef.current.style.height =
        'auto'
    }
  }

  const handleKeyDown =
    (event) => {
      if (
        event.key === 'Enter' &&
        !event.shiftKey
      ) {
        event.preventDefault()

        send()
      }
    }

  const handleChange =
    (event) => {
      const value =
        event.target.value

      setText(value)

      event.target.style.height =
        'auto'

      event.target.style.height =
        `${Math.min(
          event.target.scrollHeight,
          120
        )}px`

      if (!value.trim()) {
        stopTypingTimer()

        onTyping?.(false)

        return
      }

      onTyping?.(true)

      stopTypingTimer()

      typingTimer.current =
        setTimeout(() => {
          onTyping?.(false)

          typingTimer.current =
            null
        }, 900)
    }

  useEffect(() => {
    return () => {
      stopTypingTimer()

      onTyping?.(false)
    }
  }, [])

  return (
    <footer className="composer-wrap">
      <div className="composer">
        <div className="composer-main">
          <button
            className="composer-tool"
            title="Attach"
            disabled
            type="button"
          >
            <Paperclip size={18} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={
              handleChange
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder={
              disabled
                ? 'Select someone to chat...'
                : 'Write a message...'
            }
            disabled={disabled}
            rows={1}
          />

          <button
            className="composer-tool"
            title="Language"
            disabled
            type="button"
          >
            <Languages size={18} />
          </button>

          <button
            className="composer-tool"
            title="Voice"
            disabled
            type="button"
          >
            <Mic size={18} />
          </button>

          <button
            className="composer-tool"
            title="Emoji"
            disabled
            type="button"
          >
            <Smile size={18} />
          </button>

          <button
            className="send-button"
            onClick={send}
            disabled={
              disabled ||
              !text.trim()
            }
            title="Send"
            type="button"
          >
            <Send size={17} />
          </button>
        </div>

        <div className="composer-footer">
          <span>
            Messages are sent in your
            preferred language.
          </span>

          <span>
            Enter to send
          </span>
        </div>
      </div>
    </footer>
  )
}

export default MessageInput