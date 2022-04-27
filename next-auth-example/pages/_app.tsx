import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import { WagmiProvider } from "wagmi"

import { CookiesProvider } from "react-cookie"
import "./styles.css"

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider autoConnect>
      {/* <CookiesProvider> */}
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <Component {...pageProps} />
      </SessionProvider>
      {/* </CookiesProvider> */}
    </WagmiProvider>
  )
}
