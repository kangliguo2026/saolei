import { hashPassword, generateToken, setAuthCookie } from '../../../lib/auth';
import { getUser, createUser, isKVReady } from '../../../lib/db';

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

  // 参数验证
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
    return res.status(400).json({ error: '用户名长度需为 3-20 个字符' });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    return res.status(400).json({ error: '用户名只能包含字母、数字和下划线' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少 6 个字符' });
  }

  try {
    // 检查用户名是否已存在
    const existingUser = await getUser(trimmedUsername);
    if (existingUser) {
      return res.status(409).json({ error: '该用户名已被注册' });
    }

    // 加密密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const newUser = {
      username: trimmedUsername,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await createUser(newUser);

    // 生成 JWT 并设置 Cookie
    const token = generateToken({ username: trimmedUsername });
    setAuthCookie(res, token);

    return res.status(201).json({
      message: '注册成功',
      user: { username: trimmedUsername },
    });
  } catch (err) {
    console.error('注册失败:', err);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}
