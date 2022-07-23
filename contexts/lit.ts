import { createContext } from 'react'

export type LitContextType = {
  client: any
  isConnected: boolean
}

export const LitContext = createContext<LitContextType>({
  client: undefined,
  isConnected: false,
})

export default LitContext
