import { Container, Col, Row, Table, Button, Image, Modal, Form, ListGroup } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
    { key: 'users', label: 'User Manager' },
    { key: 'artists', label: 'Artist Manager' },
    { key: 'albums', label: 'Album Manager' },
    { key: 'songs', label: 'Song Manager' },
];

const getDefaultFor = (view) => {
    switch (view) {
        case 'users':
            return { username: '', password: '', avatar: '', subscription: { tier: 'basic', status: 'active', expiresOn: null } };
        case 'artists':
            return { name: '', coverImg: '', description: '' };
        case 'albums':
            return { title: '', artistId: '', coverImg: '', releaseYear: new Date().getFullYear() };
        case 'songs':
            return { title: '', artistId: '', albumId: '', duration: 0, genre: '', src: '', isPremium: false };
        default:
            return {};
    }
}

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [songs, setSongs] = useState([]);

    const [activeView, setActiveView] = useState('users');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const API_URL = "http://localhost:9000";

    useEffect(() => {
        axios.get(`${API_URL}/users`)
            .then(res => setUsers(res.data))
            .catch(console.error);

        axios.get(`${API_URL}/artists`)
            .then(res => setArtists(res.data))
            .catch(console.error);

        axios.get(`${API_URL}/albums`)
            .then(res => setAlbums(res.data))
            .catch(console.error);

        axios.get(`${API_URL}/songs`)
            .then(res => setSongs(res.data))
            .catch(console.error);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/home");
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({});
        setCurrentItem(null);
    };

    const handleShowAddModal = () => {
        setModalMode('add');
        setFormData(getDefaultFor(activeView));
        setCurrentItem(null);
        setShowModal(true);
    };

    const handleShowEditModal = (item) => {
        setModalMode('edit');
        const itemData = activeView === 'users'
            ? { ...getDefaultFor('users'), ...item }
            : { ...item };

        setFormData(itemData);
        setCurrentItem(item);
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value;

        if (name.includes('.')) {
            const [parentKey, childKey] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parentKey]: {
                    ...prev[parentKey],
                    [childKey]: inputValue
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: inputValue
            }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const resourceType = activeView;

        try {
            let response;
            if (modalMode === 'add') {
                response = await axios.post(`${API_URL}/${resourceType}`, formData);
                const newItem = response.data;
                switch (resourceType) {
                    case 'users': setUsers(prev => [...prev, newItem]); break;
                    case 'artists': setArtists(prev => [...prev, newItem]); break;
                    case 'albums': setAlbums(prev => [...prev, newItem]); break;
                    case 'songs': setSongs(prev => [...prev, newItem]); break;
                    default: break;
                }
            } else {
                response = await axios.patch(`${API_URL}/${resourceType}/${currentItem.id}`, formData);
                const updatedItem = response.data;
                switch (resourceType) {
                    case 'users': setUsers(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item)); break;
                    case 'artists': setArtists(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item)); break;
                    case 'albums': setAlbums(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item)); break;
                    case 'songs': setSongs(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item)); break;
                    default: break;
                }
            }
            handleCloseModal();
        } catch (err) {
            console.error(`Lỗi khi ${modalMode} ${resourceType}:`, err);
        }
    };

    const handleDelete = async (id, resourceType) => {
        if (!window.confirm(`Bạn có chắc muốn xóa ${resourceType} với ID: ${id}?`)) return;
        try {
            await axios.delete(`${API_URL}/${resourceType}/${id}`);
            switch (resourceType) {
                case 'users': setUsers(prev => prev.filter(item => item.id !== id)); break;
                case 'artists': setArtists(prev => prev.filter(item => item.id !== id)); break;
                case 'albums': setAlbums(prev => prev.filter(item => item.id !== id)); break;
                case 'songs': setSongs(prev => prev.filter(item => item.id !== id)); break;
                default: break;
            }
        } catch (err) {
            console.error(`Lỗi khi xóa ${resourceType}:`, err);
        }
    };

    const renderModalForm = () => {
        if (!formData) return null;

        switch (activeView) {
            case 'users':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" name="username" value={formData.username || ''} onChange={handleFormChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" name="password" value={formData.password || ''} onChange={handleFormChange} placeholder={modalMode === 'edit' ? "Để trống nếu không đổi" : "Bắt buộc"} required={modalMode === 'add'} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Avatar URL</Form.Label>
                            <Form.Control type="text" name="avatar" value={formData.avatar || ''} onChange={handleFormChange} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Subscription Tier</Form.Label>
                            <Form.Control
                                as="select"
                                name="subscription.tier"
                                value={formData.subscription?.tier || 'basic'}
                                onChange={handleFormChange}
                            >
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                            </Form.Control>
                        </Form.Group>
                    </>
                );
            case 'artists':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Artist Name</Form.Label>
                            <Form.Control type="text" name="name" value={formData.name || ''} onChange={handleFormChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cover Image URL</Form.Label>
                            <Form.Control type="text" name="coverImg" value={formData.coverImg || ''} onChange={handleFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" value={formData.description || ''} onChange={handleFormChange} />
                        </Form.Group>
                    </>
                );
            case 'albums':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Album Title</Form.Label>
                            <Form.Control type="text" name="title" value={formData.title || ''} onChange={handleFormChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Artist ID</Form.Label>
                            <Form.Control type="text" name="artistId" value={formData.artistId || ''} onChange={handleFormChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cover Image URL</Form.Label>
                            <Form.Control type="text" name="coverImg" value={formData.coverImg || ''} onChange={handleFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Release Year</Form.Label>
                            <Form.Control type="number" name="releaseYear" value={formData.releaseYear || ''} onChange={handleFormChange} />
                        </Form.Group>
                    </>
                );
            case 'songs':
                return (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Song Title</Form.Label>
                            <Form.Control type="text" name="title" value={formData.title || ''} onChange={handleFormChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Artist ID</Form.Label>
                            <Form.Control type="text" name="artistId" value={formData.artistId || ''} onChange={handleFormChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Album ID</Form.Label>
                            <Form.Control type="text" name="albumId" value={formData.albumId || ''} onChange={handleFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Duration (seconds)</Form.Label>
                            <Form.Control type="number" name="duration" value={formData.duration || 0} onChange={handleFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Source URL (src)</Form.Label>
                            <Form.Control type="text" name="src" value={formData.src || ''} onChange={handleFormChange} />
                        </Form.Group>
                        <Form.Check type="checkbox" name="isPremium" label="Is Premium?" checked={formData.isPremium || false} onChange={handleFormChange} />
                    </>
                );
            default:
                return <p>Form không hợp lệ.</p>;
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'users':
                return (
                    <Table bordered hover striped variant="dark">
                        <thead><tr><th>ID</th><th>Avatar</th><th>Username</th><th>Tier</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td><Image src={u.avatar} roundedCircle width={40} height={40} /></td>
                                    <td>{u.username}</td>
                                    <td>{u.subscription?.tier || 'N/A'}</td>
                                    <td>
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEditModal(u)}>Edit</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(u.id, 'users')}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );

            case 'albums':
                return (
                    <Table bordered hover striped variant="dark">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cover</th>
                                <th>Title</th>
                                <th>Artist ID</th>
                                <th>Songs in Album</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {albums.map(al => {
                                const albumSongs = songs.filter(s => s.albumId == al.id);
                                return (
                                    <tr key={al.id}>
                                        <td>{al.id}</td>
                                        <td><Image src={al.coverImg} thumbnail width={60} /></td>
                                        <td>{al.title}</td>
                                        <td>{al.artistId}</td>
                                        <td>
                                            {albumSongs.length > 0 ? (
                                                <ListGroup variant="flush">
                                                    {albumSongs.map(s => (
                                                        <ListGroup.Item key={s.id} className="bg-transparent text-white py-1 px-0 border-0" style={{ fontSize: '0.9em' }}>
                                                            {s.title} (ID: {s.id})
                                                        </ListGroup.Item>
                                                    ))}
                                                </ListGroup>
                                            ) : (
                                                <small className="text-muted">Chưa có bài hát</small>
                                            )}
                                        </td>
                                        <td>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEditModal(al)}>Edit</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(al.id, 'albums')}>Delete</Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                );

            case 'artists':
                return (
                    <Table bordered hover striped variant="dark">
                        <thead><tr><th>ID</th><th>Cover</th><th>Name</th><th>Actions</th></tr></thead>
                        <tbody>
                            {artists.map(a => (
                                <tr key={a.id}>
                                    <td>{a.id}</td>
                                    <td><Image src={a.coverImg} thumbnail width={60} /></td>
                                    <td>{a.name}</td>
                                    <td>
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEditModal(a)}>Edit</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(a.id, 'artists')}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'songs':
                return (
                    <Table bordered hover striped variant="dark">
                        <thead><tr><th>ID</th><th>Title</th><th>Artist ID</th><th>Album ID</th><th>Premium</th><th>Actions</th></tr></thead>
                        <tbody>
                            {songs.map(s => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td>{s.title}</td>
                                    <td>{s.artistId}</td>
                                    <td>{s.albumId || 'N/A'}</td>
                                    <td>{s.isPremium ? 'Yes' : 'No'}</td>
                                    <td>
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEditModal(s)}>Edit</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(s.id, 'songs')}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );

            default:
                return <p>Vui lòng chọn một mục để quản lý.</p>;
        }
    };

    return (
        <Container fluid className="bg-dark text-white min-vh-100 p-3">
            <div className="d-flex justify-content-between align-items-center">
                <h1 className="mb-4">Admin Dashboard</h1>
                <div>
                    <div className="d-flex align-items-center">
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.username}
                            className="rounded-circle me-2"
                            style={{ width: "40px", height: "40px" }}
                        />
                        <span className="me-3">Chào, {currentUser.username}</span>
                        <button
                            className="btn btn-sm btn-outline-light"
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
            <Row>
                <Col sm={3} className="border-end border-secondary pe-4">
                    {navItems.map(item => (
                        <Row
                            key={item.key}
                            className="p-3 rounded mb-2"
                            style={{
                                cursor: 'pointer',
                                backgroundColor: activeView === item.key ? '#0d6efd' : 'transparent'
                            }}
                            onClick={() => setActiveView(item.key)}
                        >
                            <span className="fs-5">{item.label}</span>
                        </Row>
                    ))}
                </Col>

                <Col sm={9}>
                    <h2 className="text-capitalize">{activeView} Management</h2>
                    <Button variant="success" className="mb-3" onClick={handleShowAddModal}>
                        Thêm mới {activeView}
                    </Button>
                    {renderContent()}
                </Col>
            </Row>

            {/* === MODAL ADD/EDIT === */}
            <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>
                        {modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} {activeView}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    <Form onSubmit={handleFormSubmit}>
                        {renderModalForm()}

                        <div className="text-end mt-4">
                            <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit">
                                Lưu
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}