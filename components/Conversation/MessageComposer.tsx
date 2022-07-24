import React, { useCallback, useEffect, useState } from 'react'
import { classNames } from '../../helpers'
import messageComposerStyles from '../../styles/MessageComposer.module.css'
import upArrowGreen from '../../public/up-arrow-green.svg'
import upArrowGrey from '../../public/up-arrow-grey.svg'
import { useRouter } from 'next/router'
import TokenGatingModal from './TokenGatingModal'

type MessageComposerProps = {
  onSend: (msg: string) => Promise<void>
}

const MessageComposer = ({ onSend }: MessageComposerProps): JSX.Element => {
  const [message, setMessage] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const router = useRouter()

  useEffect(() => setMessage(''), [router.query.recipientWalletAddr])

  const onMessageChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => setMessage(e.currentTarget.value),
    []
  )

  const setupUploadModal = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    setShowUploadModal(true)
  }

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!message) {
        return
      }
      setMessage('')
      await onSend(message)
    },
    [onSend, message]
  )
  return (
    <div
      className={classNames(
        'sticky',
        'bottom-0',
        'pl-4',
        'pt-2',
        'flex-shrink-0',
        'flex',
        'h-[68px]',
        'bg-white'
      )}
    >
      <form
        className={classNames(
          'flex',
          'w-full',
          'border',
          'py-2',
          'pl-4',
          'mr-3',
          messageComposerStyles.bubble
        )}
        autoComplete="off"
        onSubmit={onSubmit}
      >
        <input
          type="text"
          placeholder="Type something..."
          className={classNames(
            'block',
            'w-full',
            'text-md',
            'md:text-sm',
            messageComposerStyles.input
          )}
          name="message"
          value={message}
          onChange={onMessageChange}
          required
        />
        <button type="submit" className={messageComposerStyles.arrow}>
          <img
            src={message ? upArrowGreen : upArrowGrey}
            alt="send"
            height={32}
            width={32}
          />
        </button>
        <button
          className={messageComposerStyles.upload}
          onClick={setupUploadModal}
        >
          <img src="/upload-pink.png" alt="add File" height={32} width={32} />
        </button>
      </form>
      <TokenGatingModal
        isOpen={showUploadModal}
        onSend={onSend}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  )
}

export default MessageComposer
