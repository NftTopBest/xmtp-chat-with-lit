import React, { useCallback, useEffect, useState } from 'react'
import { classNames } from '../../helpers'
import Loader from '../Loader'
import useNFTStorage from '../../hooks/useNFTStorage'
import { useLit } from '../../contexts/lit'

type MessageContentProps = {
  content: string
}

const MessageContent = ({ content }: MessageContentProps): JSX.Element => {
  const { isConnected, decryptFile } = useLit()
  const { getJson } = useNFTStorage()
  const [isLoading, setIsLoading] = useState(true)
  const [unlockError, setUnlockError] = useState('')
  const [isUnLocking, setIsUnLocking] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [contractAddress, setContractAddress] = useState('')
  const [imageContent, setImageContent] = useState('')
  const [data, setData] = useState(false)

  const unlockContent = async () => {
    setIsUnLocking(true)
    const cid = data.encryptedFileCID
    const url = `${cid.replace('ipfs://', 'https://')}.ipfs.nftstorage.link/`
    const response = await fetch(url)
    const blob = await response.blob()
    let decryptedFile = ''
    try {
      setUnlockError('')
      decryptedFile = await decryptFile(
        data.encryptedSymmetricKey,
        blob,
        data.condition
      )
      console.log('decryptedFile', decryptedFile)
    } catch (err) {
      setUnlockError(err.message)
      setIsUnLocking(false)
      return
    }

    let base64String = btoa(
      String.fromCharCode(...new Uint8Array(decryptedFile))
    )
    base64String = `data:image/jpg;base64, ${base64String}`
    setImageContent(base64String)
    setIsUnlocked(true)
    setIsUnLocking(false)
  }

  useEffect(() => {
    if (data) return

    const loadJson = async () => {
      const jsonData = await getJson(content)
      setData(jsonData)
      console.log(jsonData)
      setContractAddress(jsonData.condition[0].contractAddress)

      setIsLoading(false)
    }
    loadJson()
  }, [content, getJson])

  if (isLoading)
    return (
      <Loader
        subHeadingText="loading token gating content..."
        isLoading={true}
      />
    )

  const image = isUnlocked ? (
    <div className="aspect-w-3 aspect-h-2">
      <img
        className="object-cover rounded-lg shadow-lg"
        src={imageContent}
        alt=""
      />
    </div>
  ) : (
    <div className="aspect-w-3 aspect-h-2">
      <h3>
        Require unlock with NFT
        <a
          href={`https://mumbai.polygonscan.com/address/${contractAddress}`}
          target="_blank"
          className="text-blue-400 underline"
          rel="noreferrer"
        >
          {contractAddress}
        </a>
      </h3>
      <h3 className="py-1 text-xl font-bold text-red-400">{unlockError}</h3>
      <button
        type="button"
        onClick={unlockContent}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isUnLocking ? 'Unlocking, pls wait...' : 'Unlock Now!'}
        <span className="ml-2">
          <Loader isLoading={isUnLocking} />
        </span>
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      {image}

      <div className="space-y-2">
        <div className="space-y-1 text-lg font-medium leading-6">
          <h3>{data.title}</h3>
          <p className="text-gray-600">{data.description}</p>
        </div>
      </div>
    </div>
  )
}

export default MessageContent
