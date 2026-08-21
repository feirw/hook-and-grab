import { useEffect, useState } from 'react';
import { Container, Row, Col, Image, Button, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import pfp from '../assets/images/pfp.jpg';
import '../styles/Profile.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { mediaSrc, formatDate, formatPrice } from '../utils/format';

function Profile() {
    const { user, persistUser, openLogin } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [activity, setActivity] = useState({ products: [], boats: [], myBookings: [], incomingBookings: [] });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) {
            openLogin();
            navigate('/');
            return;
        }

        setLoading(true);
        api.get('/users/me/activity')
            .then((response) => setActivity(response.data))
            .catch(() => showToast('Could not load your activity.', 'error'))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return null;

    const avatar = mediaSrc(user.profilePicture) || pfp;

    const handlePictureChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('profilePicture', file);
        setUploading(true);
        try {
            const response = await api.post('/users/profile-picture', formData);
            persistUser(response.data.user);
            showToast('Profile picture updated.', 'success');
        } catch {
            showToast('Could not update profile picture.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const updateBooking = async (booking, status) => {
        try {
            await api.put(`/boats/${booking.boatId}/bookings/${booking.id}/status`, { status });
            setActivity((current) => ({
                ...current,
                incomingBookings: current.incomingBookings.map((item) =>
                    item.id === booking.id ? { ...item, status } : item
                ),
            }));
            showToast(`Booking ${status}.`, 'success');
        } catch {
            showToast('Could not update booking.', 'error');
        }
    };

    return (
        <div className="site-container">
            <div className="content-container">
                <Container className="mt-0 profile-page">
                    <Row className="justify-content-center">
                        <Col md={8} className="text-center">
                            <div style={{ marginTop: '15vh' }}>
                                <h1 className="text-center color-white mt-3 pt-3">Profile</h1>
                            </div>
                            <Image src={avatar} roundedCircle className="mb-3 profile-avatar" />
                            <Form.Group controlId="profile-picture" className="mb-3">
                                <Form.Label className="text-white">{uploading ? 'Uploading...' : 'Change photo'}</Form.Label>
                                <Form.Control type="file" accept="image/png,image/jpeg" onChange={handlePictureChange} disabled={uploading} />
                            </Form.Group>
                            <h5 className="color-white">{user.firstName} {user.lastName} (@{user.username})</h5>
                            <div className="container">
                                <div className="box3">
                                    <h5 className="text-white">Email: {user.email}</h5>
                                    <h5 className="text-white">Phone: {user.phone || '—'}</h5>
                                </div>
                                <div className="box3">
                                    <h5 className="text-white">Date of Birth: {formatDate(user.dateOfBirth)}</h5>
                                    <h5 className="text-white">Listings: {(activity.products?.length || 0) + (activity.boats?.length || 0)}</h5>
                                </div>
                            </div>
                            <div className="container">
                                <div className="box4">
                                    <h5 className="text-white">Products listed: {activity.products?.length || 0}</h5>
                                    <h5 className="text-white">Boats listed: {activity.boats?.length || 0}</h5>
                                    <h5 className="text-white">Bookings made: {activity.myBookings?.length || 0}</h5>
                                </div>
                            </div>

                            {loading ? <Spinner animation="border" variant="light" /> : (
                                <>
                                    <section className="profile-section">
                                        <h3>Your products</h3>
                                        {activity.products?.length ? activity.products.map((product) => (
                                            <p key={product.id}>{product.title} · {product.isFree ? 'Free' : formatPrice(product.price)}</p>
                                        )) : <p>No products listed yet.</p>}
                                    </section>
                                    <section className="profile-section">
                                        <h3>Your boats</h3>
                                        {activity.boats?.length ? activity.boats.map((boat) => (
                                            <p key={boat.id}>{boat.title} · {boat.location} · {formatPrice(boat.pricePerDay)}/day</p>
                                        )) : <p>No boats listed yet.</p>}
                                    </section>
                                    <section className="profile-section">
                                        <h3>Your booking requests</h3>
                                        {activity.myBookings?.length ? activity.myBookings.map((booking) => (
                                            <p key={booking.id}>
                                                {booking.boatTitle} · {formatDate(booking.startDate)} – {formatDate(booking.endDate)} · {booking.status}
                                            </p>
                                        )) : <p>No booking requests yet.</p>}
                                    </section>
                                    <section className="profile-section">
                                        <h3>Incoming bookings</h3>
                                        {activity.incomingBookings?.length ? activity.incomingBookings.map((booking) => (
                                            <div key={booking.id} className="incoming-booking">
                                                <p>
                                                    {booking.boatTitle} for {booking.renterUsername} · {formatDate(booking.startDate)} – {formatDate(booking.endDate)} · {booking.status}
                                                </p>
                                                {booking.status === 'pending' && (
                                                    <div className="booking-actions">
                                                        <Button size="sm" variant="success" onClick={() => updateBooking(booking, 'approved')}>Approve</Button>
                                                        <Button size="sm" variant="outline-light" onClick={() => updateBooking(booking, 'rejected')}>Reject</Button>
                                                    </div>
                                                )}
                                            </div>
                                        )) : <p>No incoming requests.</p>}
                                    </section>
                                </>
                            )}

                            <Button variant="primary" onClick={() => navigate('/')} className="button-style mt-3">Go back</Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
}

export default Profile;
