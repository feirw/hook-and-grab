import { Modal, Button } from 'react-bootstrap';

function ContactModal({ show, onClose, title, actionLabel, person }) {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>This listing is handled directly between community members. Reach out to continue the {actionLabel.toLowerCase()}.</p>
                <ul className="mb-0">
                    <li><strong>Name:</strong> {person?.name || 'Community member'}</li>
                    {person?.email && <li><strong>Email:</strong> {person.email}</li>}
                    {person?.phone && <li><strong>Phone:</strong> {person.phone}</li>}
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Close</Button>
                {person?.email && (
                    <Button variant="primary" href={`mailto:${person.email}`}>
                        Email seller
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export default ContactModal;
