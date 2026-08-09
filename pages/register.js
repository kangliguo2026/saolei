import { useState } from 'react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 前端验证
    if (username.trim().length < 3) {
      setError('用户名至少 3 个字符');
      return;
    }
    if (username.trim().length > 20) {
      setError('用户名最多 20 个字符');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('用户名只能包含字母、数字和下划线');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '注册失败');
        setLoading(false);
        return;
      }

      // 注册成功，跳转
      window.location.href = '/game';
    } catch {
      setError('网络错误，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">{'\u{1F4A3}'} 创建账号</h1>
        <p className="auth-subtitle">注册后即可挑战扫雷排行榜</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3-20个字符，字母数字下划线"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 个字符"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">确认密码</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              required
              autoComplete="new-password"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="auth-footer">
          已有账号？<a href="/login" className="auth-link">立即登录</a>
        </div>
      </div>
    </div>
  );
}
