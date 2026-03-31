import React from 'react';

export default function CommandModal({ lead, onClose, onSuccess }) {
    function handleCommand(action) {
        onSuccess(action);
        onClose();
        alert(`Elliot: Understood Boss. Command Acquired: "${action}". Initiating relentless execution...`);
    }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ width: '500px', background: 'white', borderRadius: '25px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#D92027', fontSize: '1.4rem' }}>COMMAND AI ELLIOT ⚡</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '25px' }}>
                    Instruct Elliot to execute a proactive strategy for **{lead.name}**.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                    {[
                        { 
                            icon: '🦁', 
                            label: lead.status === 'Hot' ? 'Showroom Closer' : 'Persistence Nudge', 
                            desc: `Push for booking the ${lead.car || 'vehicle'}` 
                        },
                        { 
                            icon: '💰', 
                            label: lead.name.includes('Marvin') ? 'RAV4 Focus' : 'Trade-in Focus', 
                            desc: `Ask about their ${lead.name.includes('Marvin') ? '2018 RAV4' : 'current car'}` 
                        },
                        { 
                            icon: '🏦', 
                            label: 'Finance Qualifier', 
                            desc: `Verify credit status for ${lead.car || 'vehicle'}` 
                        },
                        { 
                            icon: '🚗', 
                            label: `Hook: ${lead.car || 'VW Atlas'}`, 
                            desc: `Suggest the ${lead.name.includes('Marvin') ? 'Grey' : 'Elite'} variant` 
                        }
                    ].map(cmd => (
                        <button 
                            key={cmd.label}
                            onClick={() => handleCommand(cmd.label)}
                            style={{ 
                                padding: '15px', borderRadius: '15px', border: '1px solid #eee', background: '#f9f9fb', 
                                textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = '#D92027'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{cmd.icon}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{cmd.label}</div>
                            <div style={{ fontSize: '0.65rem', color: '#888' }}>{cmd.desc}</div>
                        </button>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px' }}>CUSTOM COMMAND</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            id="custom-command-input"
                            placeholder="Instruct Elliot manually..." 
                            style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.85rem' }} 
                            onKeyPress={(e) => e.key === 'Enter' && handleCommand(e.target.value)}
                        />
                        <button 
                            onClick={() => handleCommand(document.getElementById('custom-command-input').value)}
                            style={{ padding: '0 20px', background: '#D92027', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            ISSUE 🏹
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
