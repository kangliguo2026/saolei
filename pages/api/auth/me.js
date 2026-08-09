import { getCurrentUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({
      authenticated: true,
      user: { username: user.username },
    });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
}
