import { useState, useEffect } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="landing">
      <h1 className="landing-title">{'\u{1F4A3}'} 在线扫雷</h1>
      <p className="landing-subtitle">
        经典的扫雷游戏，登录后记录你的最佳成绩，挑战排行榜！
      </p>

      <div className="landing-features">
        <div className="landing-feature">
          <div className="landing-feature-icon">{'\u{1F3C6}'}</div>
          <div className="landing-feature-title">排行榜</div>
          <div className="landing-feature-desc">挑战全球最佳成绩</div>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">{'\u{1F4DD}'}</div>
          <div className="landing-feature-title">用户系统</div>
          <div className="landing-feature-desc">注册登录记录成绩</div>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">{'\u{1F4DF}'}</div>
          <div className="landing-feature-title">三种难度</div>
          <div className="landing-feature-desc">简单/中等/困难</div>
        </div>
      </div>

      <div className="landing-cta">
        {user ? (
          <>
            <a href="/game">
              <button className="btn-landing btn-landing-primary">开始游戏</button>
            </a>
            <a href="/leaderboard">
              <button className="btn-landing btn-landing-secondary">查看排行榜</button>
            </a>
          </>
        ) : (
          <>
            <a href="/register">
              <button className="btn-landing btn-landing-primary">立即注册</button>
            </a>
            <a href="/login">
              <button className="btn-landing btn-landing-secondary">已有账号？登录</button>
            </a>
          </>
        )}
      </div>
    </div>
  );
}
