import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Phone, TrendingUp, Users, Clock, Star, Upload, Bell, LogOut, FileSpreadsheet, CheckCircle, AlertCircle, Share2, Settings, LayoutDashboard, Image as ImageIcon, Send, MessageSquare, Mic } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import * as XLSX from 'xlsx';

// ── PUSH NOTIFICATION HELPER ──────────────────────
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function sendPushNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'revhunter-lead'
        });
    }
}

// ── STRATEGIST MODAL ──────────────────────────────
function StrategistModal({ isOpen, onClose }) {
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const recognitionRef = useRef(null);

    const speak = (text) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            
            // MASTER VOICE SELECTION: Filter for English (US/GB) and prioritize a professional male voice
            const elliotVoice = voices.find(v => 
                (v.lang.startsWith('en-') && (v.name.includes('Male') || v.name.includes('Guy') || v.name.includes('Daniel') || v.name.includes('Google US English')))
            ) || voices.find(v => v.lang.startsWith('en-')) || voices[0];
            
            if (elliotVoice) {
                msg.voice = elliotVoice;
            }
            
            msg.pitch = 0.85; // Lower pitch for a more masculine, professional 'Elliot' feel
            msg.rate = 1.0;
            window.speechSynthesis.speak(msg);
        } catch (e) {
            console.error("Speech Synthesis Error:", e);
        }
    };

    useEffect(() => {
        let recognition = null;
        if (isOpen) {
            setTranscript('');
            setAiResponse('');
            setIsThinking(false);
            
            // Small delay to ensure voices are loaded on mobile
            setTimeout(() => speak("I'm listening, boss. What are your instructions for today?"), 500);

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event) => {
                    const result = Array.from(event.results)
                        .map(res => res[0].transcript)
                        .join('');
                    setTranscript(result);
                };

                recognition.onend = () => {
                    // Logic to trigger response if we have enough text
                    setTranscript(prev => {
                        if (prev.length > 3) {
                            processInstruction();
                        }
                        return prev;
                    });
                };

                // Delay start to avoid Elliot hearing himself
                setTimeout(() => {
                    try { recognition.start(); } catch(e) {}
                }, 2500);
            }
        }
        
        return () => {
            if (recognition) recognition.stop();
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isOpen]);

    const processInstruction = () => {
        setIsThinking(true);
        setTimeout(() => {
            setIsThinking(false);
            const response = "Copy that. Hunt strategy updated. I'll prioritize those leads and increase the follow-up frequency. Anything else?";
            setAiResponse(response);
            speak(response);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.98)', backdropFilter: 'blur(30px)', zIndex: 30000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ marginBottom: '30px', position: 'relative' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(217,32,39,0.1)', border: '2px solid #D92027', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: isThinking ? '0 0 60px #D92027' : '0 0 30px rgba(217,32,39,0.3)', transition: 'all 0.5s ease', animation: 'pulse 2s infinite' }}>
                        <Mic size={60} color="#D92027" />
                    </div>
                </div>
                
                <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '900', marginBottom: '5px', letterSpacing: '1px' }}>ELLIOT STRATEGIST</h2>
                <div style={{ fontSize: '0.7rem', color: '#D92027', fontWeight: 'bold', marginBottom: '30px', opacity: 0.8 }}>VOICE COMMAND ACTIVE</div>

                <div style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px' }}>
                    {transcript && (
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '15px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', textAlign: 'left', alignSelf: 'flex-start', maxWidth: '85%' }}>
                            "{transcript}"
                        </div>
                    )}

                    {isThinking && (
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontStyle: 'italic', animation: 'pulse 1s infinite' }}>
                            Elliot is updating the hunt strategy...
                        </div>
                    )}

                    {aiResponse && (
                        <div style={{ background: 'rgba(217,32,39,0.15)', borderRadius: '15px', padding: '15px', border: '1px solid rgba(217,32,39,0.3)', color: 'white', fontSize: '0.9rem', textAlign: 'right', alignSelf: 'flex-end', maxWidth: '85%', fontWeight: '600' }}>
                            {aiResponse}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '50px' }}>
                    <button 
                        onClick={onClose}
                        style={{ background: '#D92027', color: 'white', border: 'none', borderRadius: '16px', padding: '18px 40px', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', width: '100%', boxShadow: '0 8px 25px rgba(217,32,39,0.4)' }}
                    >
                        DONE & SYNC STRATEGY
                    </button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', marginTop: '20px', cursor: 'pointer', fontSize: '0.85rem' }}>LOGOUT COMMAND MODE</button>
                </div>
            </div>
        </div>
    );
}

// ── LOGIN SCREEN ──────────────────────────────────
function AgentLogin({ onLogin }) {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    const handleLogin = async () => {
        if (!name || !pin) return setError('Enter your name and PIN');
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${apiUrl}/agents/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, pin })
            });
            if (res.ok) {
                const data = await res.json();
                onLogin(data.agent);
            } else if (res.status === 402) {
                const data = await res.json();
                onLogin({ name, pin, subscription_status: 'expired', ...data.detail });
            } else {
                setError('Invalid name or PIN. Try again.');
            }
        } catch {
            // Demo fallback login
            const demoAgents = [
                { id: 1, name: 'Juan Dela Cruz', pin: '1234', avatar: 'JD', role: 'Senior Sales Consultant' },
                { id: 2, name: 'Mark Santos', pin: '5678', avatar: 'MS', role: 'Sales Consultant' },
                { id: 3, name: 'Jessica Cruz', pin: '9012', avatar: 'JC', role: 'Junior Sales Consultant' }
            ];
            const match = demoAgents.find(a => a.name.toLowerCase() === name.toLowerCase() && a.pin === pin);
            if (match) { onLogin(match); }
            else { setError('Invalid credentials. Demo PINs: Juan=1234, Mark=5678, Jessica=9012'); }
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚡</div>
                    <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>REVHUNTER AGENT</h1>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginTop: '8px' }}>Sign in to access your leads</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '30px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your Full Name"
                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem', marginBottom: '12px', boxSizing: 'border-box' }}
                    />
                    <input
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        placeholder="4-Digit PIN"
                        type="password"
                        maxLength={4}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '15px', marginBottom: '20px', boxSizing: 'border-box' }}
                    />
                    {error && <div style={{ color: '#D92027', fontSize: '0.8rem', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{ width: '100%', padding: '16px', background: loading ? 'rgba(217,32,39,0.3)' : 'linear-gradient(135deg, #D92027, #a01820)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(217,32,39,0.3)' }}
                    >
                        {loading ? 'SIGNING IN...' : 'SIGN IN'}
                    </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                    Powered by RevHunter AI
                </div>
            </div>
        </div>
    );
}

// ── MARKETING HUB VIEW ────────────────────────────
// ── MARKETING HUB VIEW ────────────────────────────
function MarketingHub({ agent, inventory, fbSettings, onUpdateSettings, apiUrl, tenant }) {
    const [subView, setSubView] = useState('inventory'); // 'inventory' | 'settings'
    const [postingCar, setPostingCar] = useState(null);
    const [organizedListing, setOrganizedListing] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [status, setStatus] = useState(null);

    const handlePost = async () => {
        if (!postingCar) return;
        setIsPosting(true);
        setStatus(null);
        try {
            const res = await fetch(`${apiUrl}/marketing/facebook/post-marketplace`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenant?.id || 'filcan' },
                body: JSON.stringify({
                    car_id: postingCar.id,
                    agent_id: agent.id,
                    custom_caption: organizedListing?.description || undefined
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', msg: data.message });
                setPostingCar(null);
                setOrganizedListing(null);
            } else {
                setStatus({ type: 'error', msg: data.detail || 'Failed to post' });
            }
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', msg: 'Connection error. Check backend.' });
        }
        setIsPosting(false);
    };

    const handleOrganize = async (car) => {
        setPostingCar(car);
        setIsGenerating(true);
        setOrganizedListing(null);
        try {
            const res = await fetch(`${apiUrl}/marketing/facebook/marketplace-helper/${car.id}`, {
                headers: { 'x-tenant-id': tenant?.id || 'filcan' }
            });
            const data = await res.json();
            setOrganizedListing(data);
        } catch (err) {
            console.error(err);
        }
        setIsGenerating(false);
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copied!`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Marketing Tabs */}
            <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '12px', width: 'fit-content' }}>
                <button 
                    onClick={() => setSubView('inventory')}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', background: subView === 'inventory' ? 'rgba(217,32,39,0.15)' : 'transparent', color: subView === 'inventory' ? '#D92027' : 'rgba(255,255,255,0.4)' }}
                >
                    <Share2 size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> INVENTORY
                </button>
                <button 
                    onClick={() => setSubView('settings')}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', background: subView === 'settings' ? 'rgba(217,32,39,0.15)' : 'transparent', color: subView === 'settings' ? '#D92027' : 'rgba(255,255,255,0.4)' }}
                >
                    <Settings size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> FB SETTINGS
                </button>
            </div>

            {status && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: status.type === 'success' ? 'rgba(0,184,148,0.1)' : 'rgba(217,32,39,0.1)', color: status.type === 'success' ? '#00b894' : '#D92027', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${status.type === 'success' ? 'rgba(0,184,148,0.2)' : 'rgba(217,32,39,0.2)'}` }}>
                    {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {status.msg}
                    <button onClick={() => setStatus(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {subView === 'inventory' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    {inventory.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)' }}>No inventory found.</div>}
                    {inventory.map(car => (
                        <div key={car.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', gap: '15px', padding: '12px' }}>
                                <div style={{ width: '100px', height: '70px', borderRadius: '10px', background: '#111', flexShrink: 0, overflow: 'hidden' }}>
                                    {car.image ? <img src={car.image} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} style={{ margin: '23px 38px', opacity: 0.1 }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{car.year} {car.make} {car.model}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>${car.price.toLocaleString()} • {car.mileage.toLocaleString()} km</div>
                                    <button 
                                        onClick={() => handleOrganize(car)}
                                        style={{ marginTop: '10px', padding: '6px 12px', background: 'rgba(217,32,39,0.1)', color: '#D92027', border: '1px solid rgba(217,32,39,0.2)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        🚀 MARKETPLACE ORGANIZER
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {subView === 'settings' && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '24px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>Account Integration</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Facebook Email / Phone</label>
                            <input 
                                type="text"
                                placeholder="Email or phone"
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Facebook Password</label>
                            <input 
                                type="password"
                                placeholder="Required for direct app link"
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        
                        <button 
                            onClick={() => alert('Elliot is initializing Facebook App Link...')}
                            style={{ width: '100%', padding: '16px', background: '#1877F2', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(24,119,242,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}
                        >
                            <Share2 size={20} /> CONNECT TO FB APP
                        </button>

                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', lineHeight: '1.5', textAlign: 'center' }}>
                            By connecting, Elliot will automatically monitor your Marketplace posts and lead inquiries directly within the Facebook app.
                        </p>
                    </div>
                </div>
            )}

            {/* Marketplace Organizer Modal */}
            {postingCar && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ width: '100%', maxWidth: '420px', background: '#1a1a2e', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: '900', fontSize: '1rem' }}>MKTPLACE ORGANIZER</div>
                            <button onClick={() => { setPostingCar(null); setOrganizedListing(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
                             {isGenerating ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '2rem', animation: 'pulse 1s infinite' }}>🧠</div>
                                    <div style={{ fontWeight: 'bold', marginTop: '10px' }}>Elliot is organizing the listing...</div>
                                </div>
                             ) : organizedListing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>OPTIMIZED TITLE</span>
                                            <button onClick={() => copyToClipboard(organizedListing.title, 'Title')} style={{ background: 'none', border: 'none', color: '#00b894', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer' }}>COPY</button>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{organizedListing.title}</div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>PRICE</span>
                                            <button onClick={() => copyToClipboard(organizedListing.price, 'Price')} style={{ background: 'none', border: 'none', color: '#00b894', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer' }}>COPY</button>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fdcb6e' }}>${Number(organizedListing.price).toLocaleString()}</div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>LISTING DESCRIPTION</span>
                                            <button onClick={() => copyToClipboard(organizedListing.description, 'Description')} style={{ background: 'none', border: 'none', color: '#00b894', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer' }}>COPY ALL</button>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>{organizedListing.description}</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {organizedListing.tags?.map((tag, i) => (
                                            <span key={i} style={{ fontSize: '0.6rem', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                             ) : (
                                <div style={{ textAlign: 'center', padding: '20px' }}>Failed to organize listing.</div>
                             )}
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <a 
                                href="https://www.facebook.com/marketplace/create/item" 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ width: '100%', padding: '16px', background: '#D92027', color: 'white', textDecoration: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textAlign: 'center' }}
                            >
                                <Share2 size={18} /> OPEN FB MARKETPLACE
                            </a>
                            <button 
                                onClick={handlePost}
                                disabled={isPosting || !fbSettings.fb_access_token}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                                {isPosting ? 'POSTING TO PAGE...' : '🚀 ALSO POST TO PAGE FEED'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── ENGAGEMENT HISTORY MODAL ──────────────────────
function EngagementHistoryModal({ lead, onClose }) {
    if (!lead) return null;
    let history = [];
    try {
        history = JSON.parse(lead.interaction_history || "[]");
    } catch {
        history = [];
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
            <div style={{ width: '100%', maxWidth: '450px', background: '#111', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', height: '85vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Header */}
                <div style={{ padding: '25px', background: 'linear-gradient(135deg, #1A1A2E 0%, #111 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#D92027', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '4px' }}>LEAD DNA TIMELINE</div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{lead.name}</h2>
                    </div>
                    <button onClick={onClose} style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                </div>

                {/* Timeline */}
                <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {lead.vapi_recording_url && (
                        <div style={{ padding: '20px', background: 'rgba(217,32,39,0.1)', borderRadius: '20px', border: '1px solid rgba(217,32,39,0.2)', marginBottom: '10px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#D92027', fontWeight: '900', marginBottom: '10px' }}>🎙️ AI CALL RECORDING</div>
                            <audio controls src={lead.vapi_recording_url} style={{ width: '100%', filter: 'invert(1) hue-rotate(180deg)' }} />
                            <div style={{ fontSize: '0.6rem', color: 'rgba(217,32,39,0.5)', marginTop: '8px', textAlign: 'center' }}>Elliot Voice Outbound Link • Completed</div>
                        </div>
                    )}

                    {history.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.3 }}>
                            <div style={{ fontSize: '2rem' }}>📡</div>
                            <p style={{ fontSize: '0.8rem' }}>Waiting for interaction data...</p>
                        </div>
                    ) : history.map((msg, i) => {
                        const isAI = msg.role?.toLowerCase().includes('ai');
                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end', gap: '4px' }}>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>{msg.role?.toUpperCase()}</div>
                                <div style={{ 
                                    maxWidth: '85%', padding: '12px 16px', borderRadius: '18px', fontSize: '0.9rem', lineHeight: '1.4',
                                    background: isAI ? 'rgba(255,255,255,0.08)' : '#D92027',
                                    color: 'white',
                                    borderBottomLeftRadius: isAI ? '4px' : '18px',
                                    borderBottomRightRadius: isAI ? '18px' : '4px'
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    Relentless AI is 24/7 monitoring this lead DNA chain.
                </div>
            </div>
        </div>
    );
}
export default function AgentDashboard() {
    const { tenant } = useTenant();
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const [agent, setAgent] = useState(() => {
        const saved = localStorage.getItem('revhunter_agent');
        return saved ? JSON.parse(saved) : null;
    });
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('leads');
    const [nudging, setNudging] = useState(null);
    const [newLeadAlert, setNewLeadAlert] = useState(null);
    const [importedLeads, setImportedLeads] = useState([]);
    const [importStatus, setImportStatus] = useState(null); // null | 'preview' | 'importing' | 'done'
    const [importFileName, setImportFileName] = useState('');
    const [inventory, setInventory] = useState([]);
    const [fbSettings, setFbSettings] = useState({ fb_access_token: '', fb_page_id: '' });
    const [dialing, setDialing] = useState(null);
    const [selectedDNA, setSelectedDNA] = useState(null);
    const [isStrategistOpen, setIsStrategistOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleLogin = (agentData) => {
        setAgent(agentData);
        localStorage.setItem('revhunter_agent', JSON.stringify(agentData));
        requestNotificationPermission();
    };

    const handleLogout = () => {
        setAgent(null);
        localStorage.removeItem('revhunter_agent');
    };

    const fetchLeads = useCallback(async () => {
        if (!agent) return;
        try {
            const res = await fetch(`${apiUrl}/agents/${encodeURIComponent(agent.name)}/leads`, {
                headers: { 'x-tenant-id': tenant?.id || 'filcan' }
            });
            const data = await res.json();
            const newLeads = data.leads || data || [];

            setLeads(prevLeads => {
                if (prevLeads.length > 0 && newLeads.length > prevLeads.length) {
                    const newest = newLeads.find(nl => !prevLeads.some(ol => ol.id === nl.id));
                    if (newest) {
                        sendPushNotification(
                            '🔥 New Lead Assigned!',
                            `${newest.name} (Score: ${newest.quality_score || '??'}%) has been assigned to you.`
                        );
                        setNewLeadAlert(newest);
                        setTimeout(() => setNewLeadAlert(null), 5000);
                    }
                }
                return newLeads;
            });
        } catch {
            // Demo fallback
            setLeads([
                { id: 1, name: 'Jan Marc Santos', car: '2024 VW Atlas', quality_score: 92, status: 'Hot', source: 'CRM', last_action_time: '2 hrs ago', follow_up_streak: 3, assigned_agent: agent.name },
                { id: 2, name: 'Leo Valdez', car: '2023 Honda CR-V', quality_score: 98, status: 'Hot', source: 'Facebook', last_action_time: '30 min ago', follow_up_streak: 5, assigned_agent: agent.name },
                { id: 3, name: 'Maria Cruz', car: '2022 Toyota RAV4', quality_score: 85, status: 'Warm', source: 'Google Ads', last_action_time: '1 hr ago', follow_up_streak: 2, assigned_agent: agent.name },
                { id: 4, name: 'Piper McLean', car: '2024 Mazda CX-5', quality_score: 78, status: 'Warm', source: 'Website', last_action_time: '3 hrs ago', follow_up_streak: 1, assigned_agent: agent.name },
                { id: 5, name: 'Jason Grace', car: '2023 Ford F-150', quality_score: 95, status: 'Hot', source: 'CRM', last_action_time: '15 min ago', follow_up_streak: 4, assigned_agent: agent.name }
            ]);
        }
        setLoading(false);
    }, [agent, apiUrl, tenant?.id]);

    const fetchMarketingData = useCallback(async () => {
        if (!agent) return;
        try {
            // Fetch Inventory
            const invRes = await fetch(`${apiUrl}/inventory`, {
                headers: { 'x-tenant-id': tenant?.id || 'filcan' }
            });
            const invData = await invRes.json();
            setInventory(invData);

            // Fetch Agent Settings
            const settingsRes = await fetch(`${apiUrl}/agents/${agent.id}/settings`);
            const settingsData = await settingsRes.json();
            setFbSettings({
                fb_access_token: settingsData.fb_access_token || '',
                fb_page_id: settingsData.fb_page_id || ''
            });
        } catch (err) {
            console.error("fetchMarketingData error:", err);
        }
    }, [agent, apiUrl, tenant?.id]);

    useEffect(() => {
        if (agent) {
            fetchLeads();
            fetchMarketingData();
            requestNotificationPermission();
            // Poll for new leads every 30 seconds
            const interval = setInterval(fetchLeads, 30000);
            return () => clearInterval(interval);
        }
    }, [agent, fetchLeads, fetchMarketingData]);

    const handleUpdateSettings = async (newSettings) => {
        setFbSettings(newSettings);
        try {
            await fetch(`${apiUrl}/agents/${agent.id}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleNudge = (leadId) => {
        setNudging(leadId);
        setTimeout(() => {
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, follow_up_streak: (l.follow_up_streak || 0) + 1, last_action_time: 'Just now' } : l));
            setNudging(null);
        }, 1500);
    };

    const handleAutoDial = async (leadId) => {
        setDialing(leadId);
        try {
            const res = await fetch(`${apiUrl}/vapi/outbound-call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenant?.id || 'filcan' },
                body: JSON.stringify({ lead_id: leadId })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`📞 ${data.message}\n\n(AI Assistant is now rapidly dialing the lead via PSTN)`);
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, last_action_time: 'AI Dialing...' } : l));
            } else {
                alert(`⚠️ Dialing Error: ${data.detail}`);
            }
        } catch (err) {
            alert('⚠️ Network Connection Error: Could not reach dialing server.');
        }
        setDialing(null);
    };

    if (!agent) {
        return <AgentLogin onLogin={handleLogin} />;
    }

    if (agent.subscription_status === 'expired') {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif" }}>
                <div style={{ width: '100%', maxWidth: '400px', padding: '0 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔒</div>
                    <h2 style={{ fontWeight: '900', marginBottom: '10px' }}>Subscription Required</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '30px' }}>
                        Your 14-day free trial has officially expired. To continue using the RevHunter AI Agent Edition and accessing your pipelines, please activate your subscription.
                    </p>
                    <button 
                        onClick={() => alert(`Billing Provider: ${agent.provider || 'Stripe'}\n\nCheckout Portal will open here!`)}
                        style={{ width: '100%', padding: '16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(99,102,241,0.3)', marginBottom: '15px' }}
                    >
                        PAY $99/MO TO UNLOCK
                    </button>
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Sign Out</button>
                </div>
            </div>
        );
    }

    const hotLeads = leads.filter(l => (l.quality_score || 0) >= 80);
    const warmLeads = leads.filter(l => (l.quality_score || 0) >= 50 && (l.quality_score || 0) < 80);
    const totalFollowUps = leads.reduce((s, l) => s + (l.follow_up_streak || 0), 0);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⚡</div>
                    <div style={{ fontWeight: 'bold' }}>Loading your leads, {agent.name.split(' ')[0]}...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)', color: 'white', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            
            {/* New Lead Alert Banner */}
            {newLeadAlert && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'linear-gradient(135deg, #D92027, #a01820)', padding: '15px 5%', display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideDown 0.3s ease' }}>
                    <Bell size={20} />
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>🔥 New Lead Assigned!</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{newLeadAlert.name} — Score: {newLeadAlert.quality_score || '??'}%</div>
                    </div>
                </div>
            )}

            {/* Trial Banner */}
            {agent.subscription_status === 'trialing' && agent.trial_ends && (
                <div style={{ background: '#fdcb6e', color: '#000', padding: '8px 15px', textAlign: 'center', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    ⚡ 14-DAY TRIAL ACTIVE — Expires {new Date(agent.trial_ends).toLocaleDateString()}
                </div>
            )}

            {/* Header */}
            <div style={{ padding: '20px 5%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'linear-gradient(135deg, #D92027, #D9202788)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>{agent.avatar || agent.name.charAt(0)}</div>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '1.2rem', color: 'white' }}>{agent.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.73)', fontWeight: '600' }}>
                                {agent.role} • {tenant?.name || 'FilCan Cars'} {agent.subscription_status === 'active' && '⭐'}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00b894', boxShadow: '0 0 8px #00b894' }} />
                            <span style={{ fontSize: '0.65rem', color: '#00b894' }}>ELLIOT LIVE</span>
                        </div>
                        <button onClick={() => setIsStrategistOpen(true)} style={{ background: 'rgba(217,32,39,0.15)', border: '1px solid rgba(217,32,39,0.3)', color: '#D92027', borderRadius: '10px', padding: '10px', cursor: 'pointer', boxShadow: '0 0 10px rgba(217,32,39,0.2)' }} title="Elliot Strategist">
                            <Mic size={18} />
                        </button>
                        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)', borderRadius: '10px', padding: '8px', cursor: 'pointer' }} title="Sign Out">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '20px 5%' }}>
                {[
                    { icon: <Users size={18} />, label: 'My Leads', value: leads.length, color: '#6c5ce7' },
                    { icon: <Star size={18} />, label: 'Hot Leads', value: hotLeads.length, color: '#D92027' },
                    { icon: <Zap size={18} />, label: 'AI Follow-Ups', value: totalFollowUps, color: '#fdcb6e' },
                    { icon: <TrendingUp size={18} />, label: 'Close Rate', value: leads.length > 0 ? Math.round((hotLeads.length / leads.length) * 100) + '%' : '0%', color: '#00b894' }
                ].map((stat, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ color: stat.color, marginBottom: '8px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px', fontWeight: '600' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '5px', padding: '0 5%', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {[
                    { id: 'leads', icon: '🎯', label: 'My Leads' },
                    { id: 'marketing', icon: '🚀', label: 'Marketing' },
                    { id: 'import', icon: '📥', label: 'Import' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        style={{
                            padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap',
                            background: activeView === tab.id ? 'rgba(217,32,39,0.2)' : 'rgba(255,255,255,0.03)',
                            color: activeView === tab.id ? '#D92027' : 'rgba(255,255,255,0.4)',
                            border: activeView === tab.id ? '1px solid rgba(217,32,39,0.3)' : '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div style={{ padding: '0 5%', paddingBottom: '80px' }}>
                {activeView === 'leads' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {leads.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
                                <Bell size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                                <div style={{ fontWeight: '700', marginBottom: '8px' }}>No Leads Assigned Yet</div>
                                <div style={{ fontSize: '0.8rem' }}>When leads are assigned to you, they'll appear here with a push notification.</div>
                            </div>
                        )}

                        {/* Hot Leads Section */}
                        {hotLeads.length > 0 && (
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#D92027', marginBottom: '12px', letterSpacing: '2px' }}>🔥 READY TO CLOSE ({hotLeads.length})</div>
                                {hotLeads.map(lead => (
                                    <div key={lead.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '18px', marginBottom: '10px', border: '1px solid rgba(217,32,39,0.15)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(217,32,39,0.15)', color: '#D92027', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem' }}>{lead.name.charAt(0)}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{lead.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{lead.car || lead.conversation_summary || 'Interested'} • {lead.source}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.65rem', background: 'rgba(0,184,148,0.15)', color: '#00b894', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>SCORE: {lead.quality_score}%</span>
                                                    <span style={{ fontSize: '0.65rem', background: 'rgba(253,203,110,0.15)', color: '#fdcb6e', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                                                        <Clock size={10} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{lead.last_action_time}
                                                    </span>
                                                    {(lead.follow_up_streak || 0) > 0 && (
                                                        <span style={{ fontSize: '0.65rem', background: 'rgba(108,92,231,0.15)', color: '#a29bfe', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>⚡ {lead.follow_up_streak}x nudged</span>
                                                    )}
                                                    {lead.phone && (
                                                        <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', padding: '3px 10px', borderRadius: '20px' }}>📞 {lead.phone}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button title="Engagement DNA" onClick={() => setSelectedDNA(lead)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(217,32,39,0.1)', border: 'none', color: '#D92027', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <MessageSquare size={18} />
                                                </button>
                                                <button title="AI Auto-Dial via Vapi" onClick={() => handleAutoDial(lead.id)} disabled={dialing === lead.id} style={{ width: '40px', height: '40px', borderRadius: '12px', background: dialing === lead.id ? 'rgba(255,255,255,0.05)' : 'rgba(217,32,39,0.15)', border: 'none', color: '#D92027', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {dialing === lead.id ? '...' : '🤖'}
                                                </button>
                                                <button title="AI Auto-Nudge" onClick={() => handleNudge(lead.id)} disabled={nudging === lead.id} style={{ width: '40px', height: '40px', borderRadius: '12px', background: nudging === lead.id ? 'rgba(255,255,255,0.05)' : 'rgba(108,92,231,0.15)', border: 'none', color: '#a29bfe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Zap size={18} />
                                                </button>
                                                <a href={lead.phone ? `tel:${lead.phone}` : '#'} title="Manual Phone Call" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,184,148,0.15)', border: 'none', color: '#00b894', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                                                    <Phone size={18} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Warm Leads Section */}
                        {warmLeads.length > 0 && (
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fdcb6e', marginBottom: '12px', letterSpacing: '2px' }}>🟡 WARMING UP ({warmLeads.length})</div>
                                {warmLeads.map(lead => (
                                    <div key={lead.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(253,203,110,0.1)', color: '#fdcb6e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.75rem' }}>{lead.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{lead.name}</div>
                                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{lead.car || 'Browsing'} • Score: {lead.quality_score}%</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button onClick={() => setSelectedDNA(lead)} style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.7rem' }}>
                                                    DNA
                                                </button>
                                                <button onClick={() => handleNudge(lead.id)} disabled={nudging === lead.id} style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(253,203,110,0.1)', border: 'none', color: '#fdcb6e', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Zap size={14} /> NUDGE
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'marketing' && (
                    <MarketingHub 
                        agent={agent}
                        inventory={inventory}
                        fbSettings={fbSettings}
                        onUpdateSettings={handleUpdateSettings}
                        apiUrl={apiUrl}
                        tenant={tenant}
                    />
                )}

                {activeView === 'import' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Upload Zone */}
                        {importStatus !== 'done' && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '40px 20px', border: '2px dashed rgba(255,255,255,0.1)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setImportFileName(file.name);
                                        const reader = new FileReader();
                                        reader.onload = (evt) => {
                                            try {
                                                const data = new Uint8Array(evt.target.result);
                                                const workbook = XLSX.read(data, { type: 'array' });
                                                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                                                const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
                                                const parsed = rows.map((row, i) => {
                                                    const name = row['Name'] || row['name'] || row['Customer'] || row['customer'] || row['Contact'] || Object.values(row)[0] || `Lead ${i+1}`;
                                                    const phone = row['Phone'] || row['phone'] || row['Mobile'] || row['mobile'] || row['Cell'] || Object.values(row)[1] || '';
                                                    const email = row['Email'] || row['email'] || '';
                                                    const notes = row['Notes'] || row['notes'] || row['Status'] || row['status'] || row['Category'] || '';
                                                    const car = row['Vehicle'] || row['vehicle'] || row['Car'] || row['Interest'] || '';
                                                    return { id: Date.now() + i, name: String(name).trim(), phone: String(phone).trim(), email: String(email).trim(), notes: String(notes).trim(), car: String(car).trim(), quality_score: 75, status: 'Discovery', source: 'CRM Import', assigned_agent: agent.name, follow_up_streak: 0, last_action_time: 'Just imported' };
                                                }).filter(l => l.name && l.name !== 'Lead 1' && l.name.length > 1);
                                                setImportedLeads(parsed);
                                                setImportStatus('preview');
                                            } catch {
                                                alert('Could not parse file. Please use a .csv or .xlsx file.');
                                            }
                                        };
                                        reader.readAsArrayBuffer(file);
                                        e.target.value = '';
                                    }}
                                />
                                <FileSpreadsheet size={40} style={{ color: 'rgba(217,32,39,0.5)', marginBottom: '15px' }} />
                                <h3 style={{ margin: '0 0 8px', fontWeight: '800', color: 'white', fontSize: '1rem' }}>Tap to Upload Your Leads</h3>
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: '0 0 15px' }}>Upload <strong>any</strong> Excel or CSV file — your own leads, CRM exports, or DealerSocket reports</p>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(217,32,39,0.1)', padding: '10px 20px', borderRadius: '12px', color: '#D92027', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                    <Upload size={16} /> CHOOSE FILE
                                </div>
                                <div style={{ marginTop: '15px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>Supports: .xlsx, .xls, .csv • Columns auto-detected (Name, Phone, Email, Vehicle)</div>
                            </div>
                        )}

                        {/* Preview Table */}
                        {importStatus === 'preview' && importedLeads.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'white' }}>📋 Preview: {importFileName}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>{importedLeads.length} leads found</div>
                                    </div>
                                    <button onClick={() => { setImportedLeads([]); setImportStatus(null); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem' }}>✕ Clear</button>
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {importedLeads.slice(0, 20).map((lead, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'white' }}>{lead.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{lead.phone || 'No phone'}{lead.car ? ` • ${lead.car}` : ''}</div>
                                            </div>
                                            <div style={{ fontSize: '0.6rem', color: '#00b894', background: 'rgba(0,184,148,0.1)', padding: '3px 8px', borderRadius: '6px' }}>Ready</div>
                                        </div>
                                    ))}
                                    {importedLeads.length > 20 && (
                                        <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>...and {importedLeads.length - 20} more</div>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setImportStatus('importing');
                                        setTimeout(() => {
                                            setLeads(prev => [...importedLeads, ...prev]);
                                            setImportStatus('done');
                                            sendPushNotification('📥 Import Complete!', `${importedLeads.length} leads loaded. Elliot is now working them.`);
                                        }, 2000);
                                    }}
                                    style={{ width: '100%', marginTop: '15px', padding: '16px', background: 'linear-gradient(135deg, #D92027, #a01820)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 8px 25px rgba(217,32,39,0.3)' }}
                                >
                                    ⚡ IMPORT {importedLeads.length} LEADS → LET ELLIOT WORK THEM
                                </button>
                            </div>
                        )}

                        {/* Importing Animation */}
                        {importStatus === 'importing' && (
                            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '40px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '15px', animation: 'pulse 1s infinite' }}>⚡</div>
                                <div style={{ fontWeight: '800', color: 'white', marginBottom: '8px' }}>Importing {importedLeads.length} Leads...</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>Elliot is preparing to contact each lead</div>
                            </div>
                        )}

                        {/* Import Complete */}
                        {importStatus === 'done' && (
                            <div style={{ background: 'rgba(0,184,148,0.05)', borderRadius: '20px', padding: '40px', border: '1px solid rgba(0,184,148,0.15)', textAlign: 'center' }}>
                                <CheckCircle size={40} style={{ color: '#00b894', marginBottom: '15px' }} />
                                <div style={{ fontWeight: '800', color: 'white', marginBottom: '8px', fontSize: '1.1rem' }}>Import Complete! 🎉</div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>{importedLeads.length} leads are now in your pipeline. Elliot is contacting them.</div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button onClick={() => { setActiveView('leads'); }} style={{ padding: '12px 25px', background: 'rgba(0,184,148,0.15)', color: '#00b894', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>VIEW MY LEADS</button>
                                    <button onClick={() => { setImportStatus(null); setImportedLeads([]); }} style={{ padding: '12px 25px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>IMPORT MORE</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Bar */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 5%', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00b894' }} />
                    Elliot is monitoring {leads.length} leads for {agent.name.split(' ')[0]} • Polling every 30s
                </div>
                {/* DNA Engagement Modal */}
            <EngagementHistoryModal lead={selectedDNA} onClose={() => setSelectedDNA(null)} />
        </div>

            <style>{`
                @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
            `}</style>

            {/* Strategist Modal (Properly Placed) */}
            <StrategistModal isOpen={isStrategistOpen} onClose={() => setIsStrategistOpen(false)} />
        </div>
    );
}
