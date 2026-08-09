import { kv } from '@vercel/kv';

/**
 * KV 数据库操作封装
 * 在 Vercel 部署时需要启用 KV Storage（在 Vercel 项目设置中创建）
 * 本地开发时需要设置 KV_URL 和 KV_REST_API_TOKEN 环境变量
 */

// KV 是否已配置
function isKVReady() {
  return !!process.env.KV_REST_API_URL || !!process.env.KV_URL;
}

/**
 * 获取用户数据
 * @param {string} username
 * @returns {Promise<object|null>}
 */
export async function getUser(username) {
  const key = `user:${username.toLowerCase()}`;
  if (isKVReady()) {
    return await kv.get(key);
  }
  return null;
}

/**
 * 创建用户
 * @param {object} user - { username, passwordHash, createdAt }
 */
export async function createUser(user) {
  const key = `user:${user.username.toLowerCase()}`;
  if (isKVReady()) {
    await kv.set(key, user);
  }
}

/**
 * 保存游戏分数到排行榜
 * @param {string} difficulty - easy | medium | hard
 * @param {object} score - { username, time, date }
 */
export async function saveScore(difficulty, score) {
  const key = `scores:${difficulty}`;
  if (!isKVReady()) return;

  const scores = (await kv.get(key)) || [];
  scores.push(score);
  // 按时间升序排序，只保留前 50 条
  scores.sort((a, b) => a.time - b.time);
  const topScores = scores.slice(0, 50);
  await kv.set(key, topScores);
}

/**
 * 获取排行榜
 * @param {string} difficulty - easy | medium | hard
 * @returns {Promise<array>}
 */
export async function getScores(difficulty) {
  const key = `scores:${difficulty}`;
  if (isKVReady()) {
    const scores = (await kv.get(key)) || [];
    return scores;
  }
  return [];
}

export { isKVReady };
