import LitJsSdk from 'lit-js-sdk'
import { useEffect, useState } from 'react'
import { LitContext, LitContextType } from '../contexts/lit'
import useXmtp from '../hooks/useXmtp'

export const LitProvider: React.FC = ({ children }) => {
  const { wallet } = useXmtp()

  const [isConnected, setIsConnected] = useState(false)
  const [client, setClient] = useState(false)

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

  const [providerState, setProviderState] = useState<LitContextType>({
    client,
    isConnected,
  })
  useEffect(() => {
    setProviderState({
      client,
      isConnected,
    })
  }, [client, isConnected])

  return (
    <LitContext.Provider value={providerState}>{children}</LitContext.Provider>
  )
}

export default LitProvider
