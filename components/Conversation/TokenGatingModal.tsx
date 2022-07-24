import React, { useState } from 'react'
import useNFTStorage from '../../hooks/useNFTStorage'
import { useLit } from '../../contexts/lit'
import { classNames } from '../../helpers'
import { Dialog, Switch } from '@headlessui/react'

const TokenGatingModal = ({ isOpen, onClose, onSend }) => {
  const { isConnected, encryptFile } = useLit()
  if (!isConnected) {
    return <div>Lit is Loading...</div>
  }

  const [title, setTitle] = useState('title')
  const [description, setDescription] = useState('description')
  const [isPublic, setIsPublic] = useState(true)
  const [imgPreview, setImgPreview] = useState('')
  const [contractAddress, setContractAddress] = useState(
    '0x83b06d09b99ad2641dd9b1132e8ce8809b623433'
  )

  const [isLoading, setIsLoading] = useState(false)
  const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState('')
  const [encryptedFileCID, setEncryptedFileCID] = useState('')

  const { storeBlob, storeJson } = useNFTStorage()

  const chain = 'mumbai'
  const getCondition = () => {
    return [
      {
        contractAddress,
        standardContractType: 'ERC721',
        chain,
        method: 'balanceOf',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
    ]
  }

  const addFilesAndStartUpload = async (files) => {
    const file = files[0]
    const url = URL.createObjectURL(file)
    setImgPreview(url)

    setIsLoading(true)

    const condition = getCondition()

    const { encryptedFile, encryptedSymmetricKey } = await encryptFile(
      file,
      condition
    )
    setEncryptedSymmetricKey(encryptedSymmetricKey)

    const cid = await storeBlob(encryptedFile)
    setEncryptedFileCID(cid)
    setIsLoading(false)
  }

  const onFileInputChange = (e) => {
    addFilesAndStartUpload(e.target.files)
    // reset so that selecting the same file again will still cause it to fire this change
    e.target.value = null
  }

  const doSubmit = async () => {
    if (isLoading) return
    setIsLoading(true)

    const metadata = {
      condition: getCondition(),
      encryptedFileCID,
      encryptedSymmetricKey,
      contentType: 'image',
      title,
      description,
      isPublic, // add into tableland and list on the discovery area?
    }

    const metadataCID = await storeJson(metadata)
    const rz = await onSend(metadataCID)
    onClose()
    setIsLoading(false)
    setImgPreview('')
  }

  const uploadText = (
    <div className="py-6 space-y-1 text-center">
      <svg
        className="w-12 h-12 mx-auto text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex text-sm text-gray-600">
        <label
          htmlFor="file-uploader"
          className="relative font-medium text-indigo-600 bg-white rounded-md cursor-pointer hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
        >
          Click to Upload file
        </label>
      </div>
      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
    </div>
  )

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Container to center the panel */}
        <div className="flex items-center justify-center w-1/2 min-h-full">
          {/* The actual dialog panel  */}
          <Dialog.Panel className="w-full p-6 mx-auto bg-white rounded ">
            <Dialog.Title>Send Token Gating Message</Dialog.Title>
            <div className="mt-6 space-y-6 sm:mt-5 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-6 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2 sm:col-span-2"
                >
                  Title
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-4">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    autoComplete="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Description
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="block w-full max-w-lg border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-6 sm:gap-4 sm:items-start sm:pt-5">
                <label
                  htmlFor="contractAddress"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2 sm:col-span-2"
                >
                  Gating NFT Contract
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-4">
                  <input
                    type="text"
                    name="contractAddress"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    id="contractAddress"
                    autoComplete="given-name"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="file-uploader"
                  className="block font-medium text-gray-700"
                >
                  Image for token gating
                </label>
                <label
                  htmlFor="file-uploader"
                  className="relative flex justify-center mt-1 border-2 border-gray-300 border-dashed rounded-md"
                >
                  {imgPreview ? (
                    <img src={imgPreview} className="object-cover h-50" />
                  ) : (
                    uploadText
                  )}
                  <input
                    id="file-uploader"
                    type="file"
                    name="file-uploader"
                    onChange={onFileInputChange}
                    className="absolute inset-0 w-full h-full border-gray-300 rounded-md opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  onClick={() => onClose()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={doSubmit}
                  className={classNames(
                    'inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                    isLoading ? 'animate-pulse' : ''
                  )}
                >
                  {isLoading ? 'Loading' : 'Send'}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}

export default TokenGatingModal
