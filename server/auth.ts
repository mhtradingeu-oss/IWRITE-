import crypto from "crypto";
import bcrypt from "bcryptjs";
import { config } from "./config";

// JWT secret - should come from env var
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  email: string;
  plan: string;
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  plan: string;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create JWT token
 */
export function createToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    plan: user.plan,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  // Simple JWT implementation without external library
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const [header, body, signature] = token.split(".");

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString());

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
