import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/config";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return Response.redirect(`${SITE_URL}/account?verify=missing`, 302);
  }

  const user = await prisma.user.findUnique({ where: { verifyToken: token } });
  if (!user) {
    return Response.redirect(`${SITE_URL}/account?verify=invalid`, 302);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null },
  });

  return Response.redirect(`${SITE_URL}/account?verify=success`, 302);
}
