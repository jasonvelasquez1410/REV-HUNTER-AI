import React, { useState, useEffect, useRef } from 'react';

const ChatWidget = ({ defaultOpen = false, placeholder = "Type a message..." }) => {
    const [messages, setMessages] = useState([
        { text: "👋 Welcome to FilCan Cars! I'm your digital receptionist. I'd love to help you find the perfect vehicle. What brings you in today?", isAi: true }
    ]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [context, setContext] = useState({ stage: "receptionist_greet", role: "Receptionist" });
    const messagesEndRef = useRef(null);

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentInput, context: context })
            });
            const data = await response.json();
            
            setMessages(prev => [...prev, { text: data.response, isAi: true }]);
            setContext(data.context);
        } catch (error) {
            console.error("Chat error:", error);
            // Fallback for demo if backend is down
            setMessages(prev => [...prev, { text: "I'm having trouble connecting, but I'm usually much faster! (Demo Mode)", isAi: true }]);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: '20px', right: '20px',
                    width: '60px', height: '60px', borderRadius: '50%',
                    backgroundColor: '#0055a4', color: 'white', border: 'none',
                    fontSize: '1.5rem', cursor: 'pointer', zIndex: '2001'
                }}
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="chat-widget">
                    <div className="chat-header" style={{ backgroundColor: '#D92027' }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>FilCan Omni Hunter</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                                ● {context.role || 'Receptionist'} Mode
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.isAi ? 'message-ai' : 'message-user'}`}>
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
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
