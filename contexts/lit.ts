import { createContext, useContext } from 'react'

export type encryptFileResult = {
  encryptedFile: Blob
  encryptedSymmetricKey: string
}

export type LitContextType = {
  client: any
  isConnected: boolean
  encryptFile: (
    file: Blob,
    accessControlConditions: Array<Object>
  ) => Promise<encryptFileResult | undefined>
  decryptFile: (
    file: Blob,
    accessControlConditions: Array<Object>
  ) => Promise<ArrayBuffer | undefined>
}

export const LitContext = createContext<LitContextType>({
  client: undefined,
  isConnected: false,
  encryptFile: async () => undefined,
  decryptFile: async () => undefined,
})

export const useLit = (): LitContextType => {
  const context = useContext(LitContext)
  if (context === undefined) {
    throw new Error('useLit must be used within an LitProvider')
  }
  return context
}
