import { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import api from '../api/client';
import { formatPrice } from '../utils/format';

function BookingModal({ boat, show, onClose, onBooked }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!boat) return null;

    const nights = startDate && endDate && new Date(endDate) >= new Date(startDate)
        ? Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1
        : 0;
    const total = nights * (Number(boat.pricePerDay) || 0);

    const handleClose = () => {
        setStartDate('');
        setEndDate('');
        setError('');
        setLoading(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post(`/boats/${boat.id}/bookings`, { startDate, endDate });
            onBooked?.();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not submit booking.');
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().slice(0, 10);

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Rent {boat.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted">{boat.location} · {formatPrice(boat.pricePerDay)} / day</p>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="booking-start">
                        <Form.Label>Start date</Form.Label>
                        <Form.Control
                            type="date"
                            min={today}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="booking-end" className="mt-3">
                        <Form.Label>End date</Form.Label>
                        <Form.Control
                            type="date"
                            min={startDate || today}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </Form.Group>
                    {nights > 0 && (
                        <p className="mt-3 mb-0">
                            {nights} day{nights === 1 ? '' : 's'} · Total {formatPrice(total)}
                        </p>
                    )}
                    {error && <p className="text-danger mt-2">{error}</p>}
                    <Button type="submit" variant="primary" className="mt-3 w-100" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Request Booking'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default BookingModal;
