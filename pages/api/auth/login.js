import { comparePassword, generateToken, setAuthCookie } from '../../../lib/auth';
import { getUser, isKVReady } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  // 检查 KV 是否可用
  if (!isKVReady()) {
    return res.status(503).json({
      error: '数据库未配置，请在 Vercel 项目设置中启用 KV Storage',
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  try {
    // 查找用户
    const user = await getUser(username.trim());
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成 JWT 并设置 Cookie
    const token = generateToken({ username: user.username });
    setAuthCookie(res, token);

    return res.status(200).json({
      message: '登录成功',
      user: { username: user.username },
    });
  } catch (err) {
    console.error('登录失败:', err);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
