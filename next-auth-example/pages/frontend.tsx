import { ethers } from "ethers"
import { useEffect } from "react"
import { getCsrfToken, signIn } from "next-auth/react"
import { SiweMessage } from "siwe"
// import { getCsrfToken, signIn } from "next-auth/react"
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi"
import Layout from "../components/layout"

// const domain = window.location.host
// const origin = window.location.origin
// const provider = new ethers.providers.Web3Provider((window as any).ethereum)
let provider: any
// const signer = provider.getSigner()
let signer: any

const BACKEND_ADDR = "http://localhost:8080"

// export default function SIWE() {
//   useEffect(() => {
//     if (window) {
//       console.log("Setting provider")
//       provider = new ethers.providers.Web3Provider((window as any).ethereum)
//       signer = provider.getSigner()
//       console.log(signer)
//     }
//   })

//   async function createSiweMessage(address: string, statement: any) {
//     const res = await fetch(`${BACKEND_ADDR}/nonce`, {
//       credentials: "include",
//     })
//     const message = new SiweMessage({
//       //   domain,
//       domain: "http://localhost:3000",
//       address,
//       statement,
//       uri: origin,
//       version: "1",
//       chainId: 80001,
//       nonce: await res.text(),
//     })
//     return message.prepareMessage()
//   }

//   function connectWallet() {
//     console.log("Connected")
//     provider
//       .send("eth_requestAccounts", [])
//       .catch(() => console.log("user rejected request"))
//   }

//   async function signInWithEthereum() {
//     const message = await createSiweMessage(
//       await signer.getAddress(),
//       "Sign in with Ethereum to the app."
//     )
//     const signature = await signer.signMessage(message)

//     const res = await fetch(`${BACKEND_ADDR}/verify`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ message: JSON.stringify(message), signature }),
//       credentials: "include",
//     })
//     console.log("Resposne : ", res)
//     console.log(await res.text())
//   }

//   async function getInformation() {
//     const res = await fetch(`${BACKEND_ADDR}/personal_information`, {
//       credentials: "include",
//     })
//     console.log(await res.text())
//   }
//   return (
//     <div>
//       <button onClick={connectWallet}>connectWallet</button>
//       <button onClick={signInWithEthereum}>signInWithEthereum</button>

//       <button onClick={getInformation}>getInformation</button>
//     </div>
//   )
// }

function Siwe() {
  const [{ data: connectData }, connect] = useConnect()
  const [, signMessage] = useSignMessage()
  const [{ data: networkData }] = useNetwork()
  const [{ data: accountData }] = useAccount()

  const getNonce = async () => {
    const res = await fetch(`${BACKEND_ADDR}/nonce`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    // console.log(await res.text())
    const nonce = await res.text()
    return nonce
  }

  const handleLogin = async () => {
    try {
      await connect(connectData.connectors[0])
      //   const callbackUrl = "/protected"
      const nonce = await getNonce()

      const message = new SiweMessage({
        domain: window.location.host,
        address: accountData?.address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: networkData?.chain?.id,
        nonce: nonce,
      })
      const { data: signature, error } = await signMessage({
        message: message.prepareMessage(),
      })
      console.log("Signature : ", signature)
      //   signIn("credentials", {
      //     message: JSON.stringify(message),
      //     redirect: false,
      //     signature,
      //     callbackUrl,
      //   })

      const res = await fetch(`${BACKEND_ADDR}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: JSON.stringify(message), signature }),
        credentials: "include",
      })
      //   console.log("Resposne : ", res)
      //   console.log(await res.text())
    } catch (error) {
      window.alert(error)
    }
  }

  return (
    <Layout>
      <button
        onClick={(e) => {
          e.preventDefault()
          handleLogin()
        }}
      >
        Sign-In with Ethereum
      </button>
    </Layout>
  )
}

// Siwe.Layout = Layout

export default Siwe
