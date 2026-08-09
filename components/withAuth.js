import { useState, useEffect } from 'react';

/**
 * 高阶组件：保护需要登录的页面
 * 未登录时自动跳转到登录页
 */
export default function withAuth(Component) {
  return function ProtectedPage() {
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
        } else {
          window.location.href = '/login';
        }
      } catch {
        window.location.href = '/login';
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

    if (!user) return null;

    return <Component user={user} />;
  };
}
