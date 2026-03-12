import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encrypt'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For GitHub login, save the access token for star syncing
      if (account?.provider === 'github' && account.access_token) {
        try {
          const encryptedToken = encrypt(account.access_token)
          await prisma.user.update({
            where: { id: user.id },
            data: { githubToken: encryptedToken },
          })
        } catch (e) {
          // User might not exist yet during first sign-in, token will be saved on next login
          console.error('Failed to save GitHub token on sign-in:', e)
        }
      }
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
