import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const user = await login(username, password);
    setLoading(false);

    if (user) {
        if (user.username === 'admin') {
            navigate('/admin', { replace: true });
        } else {
            navigate(from, { replace: true });
        }
    } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{ background: '#1f1f1f' }}
    >
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-4">
          <div className="card p-4 p-md-5 shadow border-0 rounded-4 bg-black">
            <h3 className="text-center text-white mb-4 fs-2">Online Music Web</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="usernameInput" className="form-label text-white">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="usernameInput"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="passwordInput" className="form-label text-white">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="passwordInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <button
                type="submit"
                className="btn btn-success w-100 mt-3"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>

              <div className="text-center text-white mt-3">
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
