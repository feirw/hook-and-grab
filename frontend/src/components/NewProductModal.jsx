import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

function NewProductModal({ isOpen, onClose, onAddProduct }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [isOpenToTrade, setIsOpenToTrade] = useState(false);
    const [images, setImages] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (!isOpen) return;
        setErrorMessage('');
    }, [isOpen]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPrice('');
        setIsFree(false);
        setIsOpenToTrade(false);
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
        formData.append('price', isFree ? 0 : parseFloat(price) || 0);
        formData.append('isFree', isFree);
        formData.append('isOpenToTrade', isOpenToTrade);
        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
        }

        try {
            const response = await api.post('/products', formData);
            onAddProduct(response.data.product);
            showToast('Product listed successfully.', 'success');
            handleClose();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error creating product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>New Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="product-title">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Product title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="product-description" className="mt-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="What are you listing?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="product-price" className="mt-3">
                        <Form.Label>Price (€)</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            disabled={isFree}
                            required={!isFree}
                        />
                    </Form.Group>
                    <Form.Check
                        className="mt-3"
                        type="checkbox"
                        label="Free"
                        checked={isFree}
                        onChange={(e) => {
                            setIsFree(e.target.checked);
                            if (e.target.checked) setPrice('0');
                        }}
                    />
                    <Form.Check
                        className="mt-2"
                        type="checkbox"
                        label="Open to trade"
                        checked={isOpenToTrade}
                        onChange={(e) => setIsOpenToTrade(e.target.checked)}
                    />
                    <Form.Group controlId="product-images" className="mt-3">
                        <Form.Label>Images</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/png,image/jpeg"
                            multiple
                            onChange={(e) => setImages(e.target.files)}
                        />
                    </Form.Group>
                    {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
                    <Button type="submit" variant="success" className="mt-3 w-100" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Add Product'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default NewProductModal;
