import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        // Update last login
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role: user.role,
          systemRole: user.systemRole || 'user',
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 60 },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as any).role;
        token.systemRole = (user as any).systemRole;
        token.organizationId = (user as any).organizationId;
        token.lastActivity = Date.now();
      }
      // Check session timeout on every request
      if (token.lastActivity) {
        const elapsed = Date.now() - (token.lastActivity as number);
        if (elapsed > SESSION_TIMEOUT_MS) {
          // Session expired — return empty token to force re-auth
          return { ...token, expired: true };
        }
        // Update last activity
        token.lastActivity = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (token.expired) {
        // Signal session expiration
        (session as any).expired = true;
        return session;
      }
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).systemRole = token.systemRole;
        (session.user as any).organizationId = token.organizationId;
      }
      (session as any).sessionExpiresAt = new Date((token.lastActivity as number) + SESSION_TIMEOUT_MS).toISOString();
      return session;
    },
  },
  pages: { signIn: '/auth/login' },
  secret: process.env.NEXTAUTH_SECRET,
};

export { SESSION_TIMEOUT_MS };
