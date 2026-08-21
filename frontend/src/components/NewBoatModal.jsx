import { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

function NewBoatModal({ isOpen, onClose, onAddBoat }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [location, setLocation] = useState('');
    const [images, setImages] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPricePerDay('');
        setLocation('');
        setImages([]);
        setErrorMessage('');
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('pricePerDay', parseFloat(pricePerDay));
        formData.append('location', location);
        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
        }

        try {
            const response = await api.post('/boats', formData);
            onAddBoat(response.data.boat);
            showToast('Boat listed successfully.', 'success');
            handleClose();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error creating boat listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>List Your Boat</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="boat-title">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="boat-description" className="mt-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="boat-price" className="mt-3">
                        <Form.Label>Price Per Day</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter Price Per Day"
                            value={pricePerDay}
                            onChange={(e) => setPricePerDay(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="boat-location" className="mt-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="boat-images" className="mt-3">
                        <Form.Label>Images</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/png,image/jpeg"
                            multiple
                            onChange={(e) => setImages(e.target.files)}
                        />
                    </Form.Group>
                    {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
                    <Button type="submit" variant="primary" className="mt-3 w-100" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'List Boat'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default NewBoatModal;
