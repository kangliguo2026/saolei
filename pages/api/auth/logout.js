import { clearAuthCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  clearAuthCookie(res);

  return res.status(200).json({ message: '已退出登录' });
}
