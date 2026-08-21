import { useEffect, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import '../styles/Forum.css';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { relativeTime } from '../utils/format';

function Forum() {
    const { user, openLogin } = useAuth();
    const { showToast } = useToast();
    const [discussions, setDiscussions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [reply, setReply] = useState('');
    const [saving, setSaving] = useState(false);

    const loadDiscussions = () => {
        setLoading(true);
        api.get('/forum/discussions')
            .then((response) => setDiscussions(response.data.discussions || []))
            .catch(() => showToast('Could not load the forum.', 'error'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadDiscussions();
    }, []);

    const openDiscussion = async (id) => {
        try {
            const response = await api.get(`/forum/discussions/${id}`);
            setSelected(response.data.discussion);
            setDiscussions((current) =>
                current.map((item) => item.id === id ? { ...item, views: (item.views || 0) + 1 } : item)
            );
        } catch {
            showToast('Could not open that discussion.', 'error');
        }
    };

    const createDiscussion = async (event) => {
        event.preventDefault();
        if (!user) {
            openLogin();
            return;
        }
        setSaving(true);
        try {
            const response = await api.post('/forum/discussions', { title, body });
            setDiscussions((current) => [response.data.discussion, ...current]);
            setTitle('');
            setBody('');
            setShowNew(false);
            showToast('Discussion posted.', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Could not post discussion.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const postReply = async (event) => {
        event.preventDefault();
        if (!user) {
            openLogin();
            return;
        }
        if (!selected) return;
        setSaving(true);
        try {
            const response = await api.post(`/forum/discussions/${selected.id}/replies`, { body: reply });
            setSelected((current) => ({
                ...current,
                replies: [...(current.replies || []), response.data.reply],
            }));
            setDiscussions((current) =>
                current.map((item) =>
                    item.id === selected.id ? { ...item, replies: (item.replies || 0) + 1 } : item
                )
            );
            setReply('');
            showToast('Reply posted.', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Could not post reply.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="forum-container">
            <div className="content-container">
                <main>
                    <div className="headerForum">
                        <div className="header-left">
                            <h2 className="header-title">General Discussions</h2>
                            <p className="header-description">Share advice, repairs, and circular-economy ideas with the harbor community.</p>
                        </div>
                        <Button className="new-discussion-button" onClick={() => (user ? setShowNew(true) : openLogin())}>
                            NEW DISCUSSION
                        </Button>
                    </div>

                    {selected ? (
                        <article className="box6 discussion-detail">
                            <Button variant="link" className="text-white mb-3" onClick={() => setSelected(null)}>← Back to topics</Button>
                            <h2>{selected.title}</h2>
                            <p className="discussion-meta">{selected.author} · {relativeTime(selected.createdAt)} · {selected.views} views</p>
                            <p className="discussion-body">{selected.body}</p>
                            <div className="replies">
                                {(selected.replies || []).map((item) => (
                                    <div key={item.id} className="reply-card">
                                        <strong>{item.author}</strong>
                                        <span> · {relativeTime(item.createdAt)}</span>
                                        <p>{item.body}</p>
                                    </div>
                                ))}
                                {(selected.replies || []).length === 0 && <p>No replies yet. Start the conversation.</p>}
                            </div>
                            <Form onSubmit={postReply} className="reply-form">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder={user ? 'Write a reply...' : 'Log in to reply'}
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="mt-3" disabled={saving}>
                                    {saving ? <Spinner animation="border" size="sm" /> : 'Post reply'}
                                </Button>
                            </Form>
                        </article>
                    ) : (
                        <>
                            <div className="box7">
                                <div className="textOnTheInsideR forum-table-head">
                                    <div>Topic</div>
                                    <p>User</p>
                                    <p>Replies</p>
                                    <p>Views</p>
                                    <p>Activity</p>
                                </div>
                            </div>
                            <div className="box6">
                                {loading && <p>Loading discussions...</p>}
                                {!loading && discussions.length === 0 && <p>No discussions yet. Start one.</p>}
                                {discussions.map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        className="textOnTheInsideR2 forum-row"
                                        onClick={() => openDiscussion(item.id)}
                                    >
                                        <div>{item.title}</div>
                                        <p>{item.author}</p>
                                        <p>{item.replies || 0}</p>
                                        <p>{item.views || 0}</p>
                                        <p>{relativeTime(item.lastActivity || item.createdAt)}</p>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>

            <Modal show={showNew} onHide={() => setShowNew(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>New discussion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={createDiscussion}>
                        <Form.Group controlId="discussion-title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="discussion-body" className="mt-3">
                            <Form.Label>Details</Form.Label>
                            <Form.Control as="textarea" rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
                        </Form.Group>
                        <Button type="submit" className="mt-3 w-100" disabled={saving}>
                            {saving ? <Spinner animation="border" size="sm" /> : 'Publish'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Forum;
