import React from 'react';
import { MOCK_CHATS } from '../utils/mockData';

export default function ChatModal({ lead, onClose, tenant }) {
    const chat = MOCK_CHATS[lead.id] || [
        { sender: 'customer', text: `Hi! I'm interested in the car. Do you have one in stock?`, time: "Just Now" },
        { sender: 'ai', text: `Hi ${lead.name.split(' ')[0]}! 👋 I'm the Digital Sales Specialist for ${tenant.name}. I'll check our inventory for you right now!`, time: "Just Now" }
    ];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ width: 'min(95vw, 450px)', height: 'min(90vh, 600px)', background: 'white', borderRadius: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease-out' }} className="modal-container">
                <div style={{ background: tenant.theme_color || '#003366', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', color: tenant.theme_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{lead.name.charAt(0)}</div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{lead.name}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Relentless AI: ACTIVE</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                
                <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f9f9fb', display: 'flex', gap: '20px' }} className="modal-content-wrapper">
                    {/* Chat Messages */}
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '15px' }} className="chat-messages">
                        {chat.map((msg, i) => (
                            <div key={i} style={{ 
                                alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                                maxWidth: '90%',
                                display: 'flex', flexDirection: 'column',
                                alignItems: msg.sender === 'ai' ? 'flex-start' : 'flex-end'
                            }}>
                                <div style={{ 
                                    padding: '12px 16px', borderRadius: '18px', fontSize: '0.9rem',
                                    background: msg.sender === 'ai' ? (msg.isNudge ? '#D92027' : '#003366') : '#fff',
                                    color: msg.sender === 'ai' ? 'white' : '#333',
                                    border: msg.sender === 'customer' ? '1px solid #eee' : 'none',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '18px',
                                    borderBottomRightRadius: msg.sender === 'customer' ? '4px' : '18px'
                                }}>
                                    {msg.sender === 'ai' && (
                                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginBottom: '4px', opacity: 0.8 }}>🌟 Elliot (Digital Specialist)</div>
                                    )}
                                    {msg.text}
                                </div>
                                <span style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '4px' }}>{msg.time} {msg.isNudge && "🔥 AUTO-NUDGE"}</span>
                            </div>
                        ))}
                    </div>

                    {/* 9-Step Hunter Audit (Right Panel) */}
                    <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px', background: '#fff', borderRadius: '15px', padding: '15px', display: 'flex', flexDirection: 'column' }} className="audit-panel">
                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#003366', marginBottom: '15px', letterSpacing: '1px' }}>9-STEP HUNTER AUDIT</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            {[
                                { n: 1, label: "Greeting", icon: "👋" },
                                { n: 2, label: "Discovery", icon: "🔍" },
                                { n: 3, label: "Lifestyle", icon: "🏠" },
                                { n: 4, label: "Must-Haves", icon: "⭐" },
                                { n: 5, label: "Current Car", icon: "🚗" },
                                { n: 6, label: "Trade-in Info", icon: "💰" },
                                { n: 7, label: "Financing", icon: "🏦" },
                                { n: 8, label: "Inventory Match", icon: "✅" },
                                { n: 9, label: "Booking", icon: "📅" }
                            ].map((s) => {
                                const currentStep = lead.name.includes('Marvin') ? 6 : lead.name.includes('Jessica') ? 3 : 1;
                                const isDone = s.n <= currentStep;
                                const isCurrent = s.n === currentStep + 1;
                                
                                return (
                                    <div key={s.n} style={{ 
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', 
                                        borderRadius: '8px', background: isCurrent ? '#fff9eb' : 'transparent',
                                        opacity: isDone || isCurrent ? 1 : 0.4
                                    }}>
                                        <div style={{ 
                                            width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.6rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isDone ? '#00b894' : isCurrent ? '#f1c40f' : '#eee',
                                            color: isDone || isCurrent ? 'white' : '#999',
                                            fontWeight: 'bold'
                                        }}>
                                            {isDone ? '✓' : s.n}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: isDone || isCurrent ? '600' : '400', color: isDone ? '#00b894' : isCurrent ? '#d35400' : '#888' }}>
                                            {s.icon} {s.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid #eee', background: 'white', display: 'flex', gap: '10px' }}>
                    <input disabled placeholder="AI is lead-hunting..." style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #eee', backgroundColor: '#f5f5f5', fontSize: '0.85rem' }} />
                    <button style={{ background: tenant.theme_color || '#003366', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏹</button>
                </div>
            </div>
            <style>{`
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @media (max-width: 600px) {
                    .modal-container { width: 95vw !important; height: 90vh !important; }
                    .modal-content-wrapper { flex-direction: column !important; padding: 10px !important; }
                    .audit-panel { border-left: none !important; border-top: 1px solid #eee !important; padding-left: 0 !important; padding-top: 15px !important; margin-top: 10px !important; }
                }
            `}</style>
        </div>
    );
}
