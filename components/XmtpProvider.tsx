import { useCallback, useEffect, useReducer, useState } from 'react'
import { Conversation } from '@xmtp/xmtp-js'
import { Client } from '@xmtp/xmtp-js'
import { Signer } from 'ethers'
import { getEnv } from '../helpers'
import { XmtpContext, XmtpContextType } from '../contexts/xmtp'
import useMessageStore from '../hooks/useMessageStore'

export const XmtpProvider: React.FC = ({ children }) => {
  const [wallet, setWallet] = useState<Signer>()
  const [walletAddress, setWalletAddress] = useState<string>()
  const [client, setClient] = useState<Client>()
  const { getMessages, dispatchMessages } = useMessageStore()
  const [loadingConversations, setLoadingConversations] =
    useState<boolean>(false)

  const [conversations, dispatchConversations] = useReducer(
    (state: Conversation[], newConvos: Conversation[] | undefined) => {
      if (newConvos === undefined) {
        return []
      }
      newConvos = newConvos.filter(
        (convo) =>
          state.findIndex((otherConvo) => {
            return convo.peerAddress === otherConvo.peerAddress
          }) < 0 && convo.peerAddress != client?.address
      )
      return newConvos === undefined ? [] : state.concat(newConvos)
    },
    []
  )

  const connect = useCallback(
    async (wallet: Signer) => {
      setWallet(wallet)
      const walletAddr = await wallet.getAddress()
      setWalletAddress(walletAddr)
    },
    [setWallet, setWalletAddress]
  )

  const disconnect = useCallback(async () => {
    setWallet(undefined)
    setWalletAddress(undefined)
    setClient(undefined)
    dispatchConversations(undefined)
  }, [setWallet, setWalletAddress, setClient, dispatchConversations])

  useEffect(() => {
    const initClient = async () => {
      if (!wallet) return

      let keys = await localStorage.getItem('xmtpKeys')
      try {
        // Create the client with an `ethers.Signer` from your application
        if (!keys) {
          keys = await Client.getKeys(wallet)
          const keysToString = Array.from // if available
            ? Array.from(keys) // use Array#from
            : [].map.call(keys, (v) => v) // otherwise map()
          await localStorage.setItem('xmtpKeys', JSON.stringify(keysToString))
        } else {
          keys = new Uint8Array(JSON.parse(keys))
        }
      } catch (err) {
        console.log(`====> err :`, err)
      }

      const client = await Client.create(null, {
        privateKeyOverride: keys,
        env: getEnv(),
      })

      setClient(client)
    }
    initClient()
  }, [wallet])

  useEffect(() => {
    const listConversations = async () => {
      if (!client) return
      console.log('Listing conversations')
      setLoadingConversations(true)
      const convos = await client.conversations.list()
      convos.forEach((convo: Conversation) => {
        dispatchConversations([convo])
      })
      setLoadingConversations(false)
    }
    listConversations()
  }, [client, walletAddress])

  useEffect(() => {
    const streamConversations = async () => {
      if (!client) return
      const stream = await client.conversations.stream()
      for await (const convo of stream) {
        dispatchConversations([convo])
      }
    }
    streamConversations()
  }, [client, walletAddress])

  const [providerState, setProviderState] = useState<XmtpContextType>({
    wallet,
    walletAddress,
    client,
    conversations,
    loadingConversations,
    getMessages,
    dispatchMessages,
    connect,
    disconnect,
  })

  useEffect(() => {
    setProviderState({
      wallet,
      walletAddress,
      client,
      conversations,
      loadingConversations,
      getMessages,
      dispatchMessages,
      connect,
      disconnect,
    })
  }, [
    wallet,
    walletAddress,
    client,
    conversations,
    loadingConversations,
    getMessages,
    dispatchMessages,
    connect,
    disconnect,
  ])

  return (
    <XmtpContext.Provider value={providerState}>
      {children}
    </XmtpContext.Provider>
  )
}

export default XmtpProvider
