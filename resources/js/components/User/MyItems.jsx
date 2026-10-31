import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../Layout/Loader';
import '../../../css/MyItems.css';

const getStorageUrl = (path) => (path?.startsWith('http') ? path : `/storage/${path}`);

const MyItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');
    const [openRecoveryItemId, setOpenRecoveryItemId] = useState(null);
    const [recoveryLogs, setRecoveryLogs] = useState({});
    const [recoveryLoadingId, setRecoveryLoadingId] = useState(null);
    const [recoveryErrors, setRecoveryErrors] = useState({});
    const navigate = useNavigate();

    const fetchMyItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/qr-codes');
            setItems(response.data);
            setListError('');
        } catch (error) {
            console.error('Error fetching items:', error);
            setListError(error.response?.data?.message || 'Could not load your items. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyItems();
    }, []);

    const getStatus = (status) => `mi-status mi-status-${status || 'inactive'}`;

    const toggleRecoveryLogs = async (itemId) => {
        if (openRecoveryItemId === itemId) {
            setOpenRecoveryItemId(null);
            return;
        }

        setOpenRecoveryItemId(itemId);
        if (Object.prototype.hasOwnProperty.call(recoveryLogs, itemId)) {
            return;
        }

        setRecoveryLoadingId(itemId);
        setRecoveryErrors((current) => ({ ...current, [itemId]: '' }));
        try {
            const response = await axios.get(`/api/qr-codes/${itemId}/recovery-logs`);
            setRecoveryLogs((current) => ({ ...current, [itemId]: response.data }));
        } catch (error) {
            console.error('Error fetching item recovery logs:', error);
            setRecoveryErrors((current) => ({
                ...current,
                [itemId]: error.response?.data?.message || 'Could not load recovery reports.',
            }));
        } finally {
            setRecoveryLoadingId(null);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <main className="mi-page">            
            <header className="mi-page-header">
                <div className="mi-page-header-content">
                    <h2>
                        Registered items
                        <span className="mi-section-count">{items.length}</span>
                    </h2>
                    <p className="mi-page-subtitle">
                        Manage your registered belongings and their QR codes.
                    </p>
                </div>

                <button
                    type="button"
                    className="mi-primary-button"
                    onClick={() => navigate('/register-item')}
                >
                    <i className="bi bi-plus-lg"></i>
                    <span>Register Item</span>
                </button>
            </header>

            {listError && (
                <div className="mi-alert" role="alert">
                    <i className="bi bi-exclamation-circle" />
                    <span>{listError}</span>
                    <button type="button" onClick={fetchMyItems}>Try again</button>
                </div>
            )}

            <section className="mi-inventory">
                {!listError && items.length === 0 ? (
                    <div className="mi-empty">
                        <div className="mi-empty-art"><i className="bi bi-qr-code" /></div>
                        <h3>Your collection starts here</h3>
                        <p>Register a QR sticker you own, or create an item to generate a new printable code.</p>
                        <span className="mi-empty-note"><i className="bi bi-shield-check" /> Your contact details stay attached to each item.</span>
                    </div>
                ) : (
                    <div className="mi-item-list">
                        {items.map((item) => (
                            <article key={item.id} className="mi-item-row">
                                {item.item_image_path ? (
                                    <img className="mi-item-photo" src={getStorageUrl(item.item_image_path)} alt={item.item_name} />
                                ) : (
                                    <div className="mi-item-photo mi-item-photo-placeholder"><i className="bi bi-box-seam" /></div>
                                )}
                                <div className="mi-item-main">
                                    <div className="mi-item-title">
                                        <h3>{item.item_name}</h3>
                                        <span className={getStatus(item.status)}><span />{item.status || 'inactive'}</span>
                                    </div>
                                    <p className="mi-item-meta">{item.category || 'Uncategorized'}<span>·</span>{new Date(item.created_at).toLocaleDateString()}</p>
                                    <code className="mi-item-description">{item.item_description}</code>
                                </div>
                                <div className="mi-item-actions">
                                    {item.qr_code_image_path && (
                                        <a className="mi-secondary-button" href={getStorageUrl(item.qr_code_image_path)} download={`${item.item_name}-qr.svg`}>
                                            <i className="bi bi-download" /><span>Download QR</span>
                                        </a>
                                    )}
                                    <Link className="mi-outline-button" to={`/qr-view/${encodeURIComponent(item.qr_code)}`}><i className="bi bi-box-arrow-up-right" /> View details</Link>
                                    <button type="button" className="mi-outline-button" onClick={() => toggleRecoveryLogs(item.id)}>
                                        <i className="bi bi-geo-alt" /> Recovery reports
                                    </button>
                                </div>
                                {openRecoveryItemId === item.id && (
                                    <div className="mi-recovery-reports">
                                        <h4><i className="bi bi-shield-check me-2" />Recovery reports for {item.item_name}</h4>
                                        {recoveryLoadingId === item.id ? (
                                            <p className="mb-0 text-muted small">Loading recovery reports…</p>
                                        ) : recoveryErrors[item.id] ? (
                                            <p className="mb-0 text-danger small" role="alert">{recoveryErrors[item.id]}</p>
                                        ) : recoveryLogs[item.id]?.length ? (
                                            <div className="mi-recovery-list">
                                                {recoveryLogs[item.id].map((log) => (
                                                    <article className="mi-recovery-entry" key={log.id}>
                                                        <div className="d-flex flex-wrap justify-content-between gap-2">
                                                            <strong>{log.visitor_name}</strong>
                                                            <time className="text-muted small" dateTime={log.created_at}>{new Date(log.created_at).toLocaleString()}</time>
                                                        </div>
                                                        <a href={`tel:${log.visitor_phone}`} className="small">{log.visitor_phone}</a>
                                                        <p className="mb-2 mt-2">{log.details}</p>
                                                        <small className="text-muted">Visitor IP: {log.ip_address || 'Unavailable'}</small>
                                                    </article>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="mb-0 text-muted small">No recovery reports submitted for this item yet.</p>
                                        )}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default MyItems;
