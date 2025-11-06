import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        const result = await register(username, password);
        setLoading(false);

        if (result.success) {
            if (result.user.username.toLowerCase().includes('admin') ) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/home', { replace: true });
            }
        } else {
            setError(result.message);
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
                        <h3 className="text-center text-white mb-4 fs-2">Đăng Ký</h3>
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
                            <div className="mb-3">
                                <label htmlFor="confirmPasswordInput" className="form-label text-white">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="confirmPasswordInput"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            
                            {error && <div className="alert alert-danger">{error}</div>}
                            
                            <button
                                type="submit"
                                className="btn btn-success w-100 mt-3"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                            </button>

                            <div className="text-center text-white mt-3">
                                Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}