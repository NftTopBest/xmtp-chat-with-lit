import XmtpProvider from './XmtpProvider'
import LitProvider from './LitProvider'
import Layout from '../components/Layout'
import { WalletProvider } from './WalletProvider'

type AppProps = {
  children?: React.ReactNode
}

function App({ children }: AppProps) {
  return (
    <WalletProvider>
      <XmtpProvider>
        <LitProvider>
          <Layout>{children}</Layout>
        </LitProvider>
      </XmtpProvider>
    </WalletProvider>
  )
}

export default App
