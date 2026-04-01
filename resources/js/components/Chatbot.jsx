import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { X, Send } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Debug: Log that chatbot is rendering
    if (typeof window !== 'undefined' && window.location.pathname.includes('/')) {
        // Silently log without console spam
    }

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || !user) return;

        const userMessage = input;
        setInput('');
        setLoading(true);

        const tempMessageId = Date.now();
        setMessages(prev => [...prev, {
            id: tempMessageId,
            sender: 'user',
            text: userMessage,
        }]);

        try {
            const res = await axios.post('/api/chat/send', {
                message: userMessage,
            });

            if (res.data.success) {
                setMessages(prev => [...prev, {
                    id: res.data.chat_message_id || Date.now(),
                    sender: 'bot',
                    text: res.data.response,
                    stored: res.data.stored,
                    keywords: res.data.matched_keywords,
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    sender: 'bot',
                    text: 'Failed to get response. Please try again.',
                }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'bot',
                text: 'Error communicating with chatbot. Please try again.',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const chatbotUI = (
        <div style={{position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999}}>
            {/* Chat Window */}
            {showChat && user && (
                <div style={{
                    width: '320px',
                    height: '450px',
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(153,104,123,1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(153,104,123,1)',
                    animation: 'fadeIn 0.3s ease-in-out',
                }}>
                    
                    {/* Header */}
                    <div style={{
                        background: 'radial-gradient(circle, rgba(153,104,123,1) 0%, rgba(89,100,117,1) 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        flexShrink: 0,
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600}}>
                            <div style={{width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', padding: 0}}>
                                <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <DotLottieReact
                                        src="https://lottie.host/eafbfcb7-b178-4cf2-83f1-530b402b338c/fonJZArzTZ.lottie"
                                        loop
                                        autoplay
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <p style={{margin: 0, fontSize: '15px'}}>QR Assistant</p>
                                <p style={{margin: '4px 0 0 0', fontSize: '10px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px'}}>
                                    <span style={{width: '6px', height: '6px', backgroundColor: '#4ade80', borderRadius: '50%', animation: 'pulse 2s infinite'}}></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowChat(false)}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        backgroundColor: '#f8fafc',
                        padding: '16px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}>
                        {messages.length === 0 ? (
                            <div style={{textAlign: 'center', color: '#6b7280', margin: 'auto'}}>
                                <p>👋 Hi! I'm your QR Finder Assistant</p>
                                <p style={{fontSize: '12px', marginTop: '8px'}}>How can I help you?</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: '85%',
                                            padding: '12px',
                                            borderRadius: '16px',
                                            fontSize: '14px',
                                            lineHeight: 1.4,
                                            backgroundColor: msg.sender === 'user' ? 'rgba(153,104,123,1)' : 'white',
                                            color: msg.sender === 'user' ? 'white' : '#1f2937',
                                            border: msg.sender === 'user' ? 'none' : '1px solid #e5e7eb',
                                            boxShadow: msg.sender === 'user' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
                                            borderBottomRightRadius: msg.sender === 'user' ? 0 : 16,
                                            borderBottomLeftRadius: msg.sender === 'user' ? 16 : 0,
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{
                        padding: '12px',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={loading}
                            style={{
                                flex: 1,
                                backgroundColor: '#f8fafc',
                                border: '1px solid rgba(153,104,123,1)',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                cursor: loading ? 'not-allowed' : 'text',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(153,104,123,1)C'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(153,104,123,1)'}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(153,104,123,1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                                opacity: !input.trim() || loading ? 0.5 : 1,
                                transition: 'all 0.2s',
                                flexShrink: 0,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            }}
                            onMouseEnter={(e) => !input.trim() || loading ? null : e.target.style.backgroundColor = 'rgba(153,104,123,1)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(153,104,123,1)'}
                        >
                            <Send size={16} style={{marginLeft: '-2px'}} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            {!showChat && user && (
                <button
                    onClick={() => setShowChat(true)}
                    style={{
                        width: 'clamp(64px, 20vw, 80px)',
                        height: 'clamp(64px, 20vw, 80px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    }}
                >
                    {/* Status Dot */}
                    <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '14px',
                        height: '14px',
                        backgroundColor: '#22c55e',
                        border: '2px solid white',
                        borderRadius: '50%',
                        zIndex: 20,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        animation: 'pulse 2s infinite',
                    }}></span>
                    
                    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10}}>
                        <DotLottieReact
                            src="https://lottie.host/eafbfcb7-b178-4cf2-83f1-530b402b338c/fonJZArzTZ.lottie"
                            loop
                            autoplay
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                </button>
            )}

            {/* Logout Message */}
            {!user && (
                <button
                    onClick={() => window.location.href = '/login'}
                    style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#155DFC',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease',
                        title: 'Login to chat',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    }}
                >
                    💬
                </button>
            )}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );

    return createPortal(chatbotUI, document.body);
};

export default Chatbot;
