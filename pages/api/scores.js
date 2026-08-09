import { getCurrentUser } from '../../lib/auth';
import { getScores, saveScore, isKVReady } from '../../lib/db';

export default async function handler(req, res) {
  // GET: 获取排行榜
  if (req.method === 'GET') {
    const difficulty = req.query.difficulty || 'easy';

    // 验证难度
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: '无效的难度' });
    }

    if (!isKVReady()) {
      return res.status(200).json({ scores: [] });
    }

    try {
      const scores = await getScores(difficulty);
      return res.status(200).json({ scores });
    } catch (err) {
      console.error('获取排行榜失败:', err);
      return res.status(200).json({ scores: [] });
    }
  }

  // POST: 保存分数
  if (req.method === 'POST') {
    // 验证登录
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: '请先登录' });
    }

    if (!isKVReady()) {
      return res.status(503).json({ error: '数据库未配置' });
    }

    const { difficulty, time } = req.body;

    // 验证参数
    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: '无效的难度' });
    }

    if (typeof time !== 'number' || time < 0 || time > 999) {
      return res.status(400).json({ error: '无效的时间' });
    }

    try {
      const score = {
        username: user.username,
        time: Math.floor(time),
        date: new Date().toISOString(),
      };

      await saveScore(difficulty, score);

      return res.status(201).json({ message: '成绩已保存', score });
    } catch (err) {
      console.error('保存成绩失败:', err);
      return res.status(500).json({ error: '服务器内部错误' });
    }
  }

  return res.status(405).json({ error: '方法不允许' });
}
