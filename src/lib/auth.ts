import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "ghobby_admin_session";
const ROLE_COOKIE_NAME = "ghobby_role";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Chỉ bật secure khi thực sự chạy trên HTTPS.
// Nếu bật secure trên http://localhost, trình duyệt sẽ TỪ CHỐI lưu cookie
// => middleware không thấy session => vòng lặp redirect vô tận.
function shouldUseSecureCookie(): boolean {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  return baseUrl.startsWith("https://");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt,
    },
    include: { user: true },
  });

  const secure = shouldUseSecureCookie();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  // Cookie phụ chứa role để middleware (Edge Runtime) quyết định redirect
  // mà không cần truy vấn DB.
  cookieStore.set(ROLE_COOKIE_NAME, session.user.role, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return session;
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const tokenHash = hashToken(token);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    if (!session.user.isActive) {
      return null;
    }

    return { session, user: session.user };
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

export async function requireStaff() {
  const sessionData = await getSession();
  if (!sessionData) return null;
  if (!["ADMIN", "STAFF"].includes(sessionData.user.role)) return null;
  return sessionData;
}

export async function requireAdmin() {
  const sessionData = await getSession();
  if (!sessionData) return null;
  if (sessionData.user.role !== "ADMIN") return null;
  return sessionData;
}

export async function revokeSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  cookieStore.set(ROLE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function checkLoginAttempts(ipAddress: string, username: string): Promise<boolean> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const attempts = await prisma.loginAttempt.count({
    where: {
      OR: [
        { ipAddress, createdAt: { gte: fifteenMinutesAgo } },
        { username, createdAt: { gte: fifteenMinutesAgo } },
      ],
      isSuccess: false,
    },
  });

  // Block if more than 5 failed attempts in 15 minutes
  return attempts < 5;
}

export async function recordLoginAttempt(ipAddress: string, username: string, isSuccess: boolean) {
  await prisma.loginAttempt.create({
    data: {
      ipAddress,
      username,
      isSuccess,
    },
  });
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}
