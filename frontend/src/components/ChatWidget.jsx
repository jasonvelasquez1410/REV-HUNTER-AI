import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../context/TenantContext';

const ChatWidget = ({ defaultOpen = false, placeholder = "Type a message..." }) => {
    const { tenant } = useTenant();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [context, setContext] = useState({ stage: "receptionist_greet", role: "Digital Sales Specialist" });
    const messagesEndRef = useRef(null);

    // Initialize with tenant welcome message
    useEffect(() => {
        if (tenant && messages.length === 0) {
            const timer = setTimeout(() => {
                setMessages([{ text: tenant.welcome_message, isAi: true }]);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [tenant, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { text: input, isAi: false };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Tenant-Id': tenant.id 
                },
                body: JSON.stringify({ message: currentInput, context: context })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error (${response.status}): ${errorText.substring(0, 50)}`);
            }

            const data = await response.json();
            setMessages(prev => [...prev, { text: data.response, isAi: true }]);
            setContext(data.context);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                text: `[Relentless Engine Error]: I'm having trouble reaching the AI. Please verify the Vercel deployment logs. (Error: ${error.message})`, 
                isAi: true 
            }]);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: '30px', right: '30px',
                    width: '60px', height: '60px', borderRadius: '50%',
                    backgroundColor: tenant.theme_color || '#0055a4', color: 'white', border: 'none',
                    fontSize: '1.5rem', cursor: 'pointer', zIndex: '2001',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="chat-widget">
                    <div className="chat-header" style={{ backgroundColor: tenant.theme_color || '#D92027' }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{tenant.name} Digital Specialist</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                                ● {context.role || 'Digital Specialist'} Mode | v15.0-FORCE-REFRESH [ELITE]
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.isAi ? 'message-ai' : 'message-user'}`}>
                                {msg.isAi && (
                                    <div style={{ 
                                        fontSize: '0.7rem', 
                                        fontWeight: 'bold', 
                                        marginBottom: '4px', 
                                        color: tenant.theme_color || '#D92027',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}>
                                        🌟 Elliot (Digital Specialist)
                                    </div>
                                )}
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input">
                        <input 
                            type="text" 
                            placeholder={placeholder} 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} style={{ backgroundColor: tenant.theme_color }}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
