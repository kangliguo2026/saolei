import { useState, useEffect } from 'react';

export default function Navbar() {
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
      // 忽略
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">
        {'\u{1F4A3}'} 扫雷
      </a>
      <div className="navbar-links">
        {loading ? null : user ? (
          <>
            <span className="navbar-user">{user.username}</span>
            <a href="/game" className="navbar-link">开始游戏</a>
            <a href="/leaderboard" className="navbar-link">排行榜</a>
            <button className="navbar-link" onClick={handleLogout}>退出</button>
          </>
        ) : (
          <>
            <a href="/login" className="navbar-link">登录</a>
            <a href="/register" className="navbar-link">注册</a>
          </>
        )}
      </div>
    </nav>
  );
}
