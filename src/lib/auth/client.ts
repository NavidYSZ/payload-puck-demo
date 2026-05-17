'use client'

import { createAuthClient, payloadAuthPlugins } from '@delmaredigital/payload-better-auth/client'
import { passkeyClient } from '@better-auth/passkey/client'
import { twoFactorClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [...payloadAuthPlugins, twoFactorClient(), passkeyClient()],
})

export const { useSession, signIn, signUp, signOut, twoFactor, passkey } = authClient
