import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production-please';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'saolei_token';

/**
 * 加密密码
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * 验证密码
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * 生成 JWT
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * 设置认证 Cookie
 */
export function setAuthCookie(res, token) {
  // 注意：Vercel 上 HTTPS 会自动处理 secure
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}; Max-Age=${7 * 24 * 60 * 60}`
  );
}

/**
 * 清除认证 Cookie
 */
export function clearAuthCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}; Max-Age=0`
  );
}

/**
 * 从请求中获取当前用户
 */
export function getCurrentUser(req) {
  const cookies = req.headers.cookie || '';
  const token = parseCookies(cookies)[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

/**
 * 解析 Cookie 字符串
 */
function parseCookies(cookieStr) {
  const cookies = {};
  cookieStr.split(';').forEach((pair) => {
    const [key, ...valParts] = pair.trim().split('=');
    if (key) {
      cookies[key] = decodeURIComponent(valParts.join('='));
    }
  });
  return cookies;
}

export const COOKIE = COOKIE_NAME;
