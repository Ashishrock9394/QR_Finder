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
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default MyItems;
