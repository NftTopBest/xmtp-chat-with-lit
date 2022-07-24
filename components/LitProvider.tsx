import LitJsSdk from 'lit-js-sdk'
import { useEffect, useState, useCallback } from 'react'
import { LitContext, LitContextType } from '../contexts/lit'
import useXmtp from '../hooks/useXmtp'

export const LitProvider: React.FC = ({ children }) => {
  const { wallet } = useXmtp()

  const [isConnected, setIsConnected] = useState(false)
  const [client, setClient] = useState<LitJsSdk.LitNodeClient>(null)

  const updateLitConnectStatus = () => {
    setIsConnected(true)
  }

  useEffect(() => {
    const initClient = async () => {
      if (!wallet) return
      document.addEventListener('lit-ready', updateLitConnectStatus, false)

      const litNodeClient = new LitJsSdk.LitNodeClient()
      await litNodeClient.connect()
      setClient(litNodeClient)
    }
    initClient()
    return () => {
      document.removeEventListener('lit-ready', updateLitConnectStatus)
    }
  }, [wallet])

  const encryptFile = useCallback(
    async (file, accessControlConditions) => {
      const chain = 'mumbai'
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain,
      })
      const { encryptedFile, symmetricKey } = await LitJsSdk.encryptFile({
        file,
      })

      const encryptedSymmetricKey = await client.saveEncryptionKey({
        accessControlConditions,
        symmetricKey,
        authSig,
        chain,
      })

      return {
        encryptedFile,
        encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
          encryptedSymmetricKey,
          'base16'
        ),
      }
    },
    [client]
  )

  // providerState
  const [providerState, setProviderState] = useState<LitContextType>({
    client,
    isConnected,
    encryptFile,
  })
  useEffect(() => {
    setProviderState({
      client,
      isConnected,
      encryptFile,
    })
  }, [client, isConnected, encryptFile])
  return (
    <LitContext.Provider value={providerState}>{children}</LitContext.Provider>
  )
}

export default LitProvider
