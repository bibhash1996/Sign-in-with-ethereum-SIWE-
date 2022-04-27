import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getCsrfToken } from "next-auth/react"
import { SiweMessage } from "siwe"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: any, res: any) {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      // async authorize(credentials) {
      //   try {
      //     const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"))
      //     const domain = process.env.DOMAIN
      //     if (siwe.domain !== domain) {
      //       return null
      //     }

      //     if (siwe.nonce !== (await getCsrfToken({ req }))) {
      //       return null
      //     }
      //     await siwe.validate(credentials?.signature || "")
      //     return {
      //       id: siwe.address,
      //     }
      //   } catch (e) {
      //     return null
      //   }
      // },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"))
          const domain = process.env.DOMAIN
          if (siwe.domain !== domain) {
            return null
          }

          if (siwe.nonce !== (await getCsrfToken({ req }))) {
            return null
          }
          await siwe.validate(credentials?.signature || "")
          return {
            id: siwe.address,
          }
          // const res = await fetch(`http://localhost:8080/verify`, {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify({ message: credentials?.message || "{}", signature: credentials?.signature || "" }),
          //   credentials: "include",
          // });
          // const nonce = await getCsrfToken({ req });
          // console.log("NONCE : ", nonce);
          // console.log("Req  : ", req);
          // console.log("RES : ", await res.text());
          // return {
          //   id: "text"
          // }
        } catch (e) {
          return null
        }
      },
    }),
  ]

  const isDefaultSigninPage =
    req.method === "GET" && req.query.nextauth.includes("signin")

  // Hides Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop()
  }

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    session: {
      strategy: "jwt",
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    secret: process.env.NEXT_AUTH_SECRET,
    callbacks: {
      async session({ session, token }) {
        session.address = token.sub
        if (session.user)
          session.user.name = token.sub
        else {
          session.user = {};
          session.user.name = token.sub
        }
        return session
      },
    },
  })
}