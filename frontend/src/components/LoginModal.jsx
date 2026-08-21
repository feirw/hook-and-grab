import { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function LoginModal({ show, handleClose, handleShowSignup }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password.');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/auth/login', { username, password });
            login(res.data.user);
            handleCloseModal();
            showToast(`Welcome back, ${res.data.user.username}!`, 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setUsername('');
        setPassword('');
        setError('');
        setLoading(false);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Log In</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="login-username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="login-password" className="mt-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    {error && <p className="text-danger mt-2">{error}</p>}
                    <p className="text-muted mt-3 mb-0 small">Demo: captain / hookgrab</p>
                    <Button type="submit" variant="primary" className="mt-3 w-100" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Log In'}
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="link" onClick={() => { handleCloseModal(); handleShowSignup(); }} className="text-dark">
                    Don't have an account? Register
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default LoginModal;
