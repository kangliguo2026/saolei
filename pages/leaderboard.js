import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [difficulty, setDifficulty] = useState('easy');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const difficultyLabels = {
    easy: '简单 (9x9, 10雷)',
    medium: '中等 (16x16, 40雷)',
    hard: '困难 (16x30, 99雷)',
  };

  useEffect(() => {
    fetchScores(difficulty);
  }, [difficulty]);

  const fetchScores = async (diff) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/scores?difficulty=${diff}`);
      const data = await res.json();
      if (res.ok) {
        setScores(data.scores || []);
      } else {
        setScores([]);
        if (data.error && data.error.includes('KV')) {
          setError('数据库未配置，请在 Vercel 中启用 KV Storage');
        }
      }
    } catch {
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-card">
        <h1 className="leaderboard-title">{'\u{1F3C6}'} 排行榜</h1>

        <div className="game-difficulty-selector" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          {Object.entries(difficultyLabels).map(([key, label]) => (
            <button
              key={key}
              className={`difficulty-btn ${difficulty === key ? 'active' : ''}`}
              onClick={() => setDifficulty(key)}
              style={
                difficulty === key
                  ? { background: '#667eea', color: '#fff', borderColor: '#667eea' }
                  : { background: '#f7fafc', color: '#4a5568', borderColor: '#e2e8f0' }
              }
            >
              {label.split(' ')[0]}
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#718096', fontSize: '0.9rem', marginBottom: '20px' }}>
          {difficultyLabels[difficulty]}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>{'\u{1F6D1}'}</p>
            <p>{error}</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>{'\u{1F4ED}'}</p>
            <p>暂无成绩，快来成为第一名！</p>
          </div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>排名</th>
                <th>玩家</th>
                <th style={{ width: '100px' }}>用时</th>
                <th style={{ width: '120px' }}>日期</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={`rank-badge ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{score.username}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{score.time}秒</td>
                  <td style={{ color: '#a0aec0', fontSize: '0.9rem' }}>{formatDate(score.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
