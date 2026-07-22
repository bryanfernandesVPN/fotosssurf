import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";

export const CART_COOKIE = "fotossurf_cart";

export async function getOrCreateCartSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = nanoid();
  jar.set(CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return sessionId;
}

export async function getCartSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(CART_COOKIE)?.value ?? null;
}

export async function getCartWithItems() {
  const sessionId = await getCartSessionId();
  if (!sessionId) return null;

  return prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          photo: {
            include: { album: true },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });
}

export async function getOrCreateCart() {
  const sessionId = await getOrCreateCartSessionId();
  return prisma.cart.upsert({
    where: { sessionId },
    create: { sessionId },
    update: {},
    include: {
      items: {
        include: {
          photo: { include: { album: true } },
        },
      },
    },
  });
}
