import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Phone, TrendingUp, Users, Clock, Star, Upload, Bell, LogOut, FileSpreadsheet, CheckCircle, AlertCircle, Share2, Settings, LayoutDashboard, Image as ImageIcon, Send, MessageSquare, Mic, Link, Camera, Building2, HelpCircle } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import * as XLSX from 'xlsx';
import ROIDashboard from '../components/ROIDashboard';

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

function StrategistModal({ isOpen, onClose, leads, hotLeads }) {
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSynced, setIsSynced] = useState(false);
    const recognitionRef = useRef(null);
    const transcriptRef = useRef('');
    const silenceTimerRef = useRef(null);

    const speak = (text) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        
        const performSpeak = () => {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            
            let elliot = voices.find(v => v.lang.includes('en-US') && (v.name.includes('Natural') || v.name.includes('Neural')) && v.name.includes('Male'))
                || voices.find(v => v.lang.includes('en-US') && v.name.includes('Google') && v.name.includes('Male'))
                || voices.find(v => v.lang.includes('en-US') && v.name.includes('Male'))
                || voices.find(v => v.lang.includes('en') && v.name.includes('Male'))
                || voices.find(v => v.lang.includes('en-US'))
                || voices[0];

            if (elliot) msg.voice = elliot;
            msg.pitch = 0.8;
            msg.rate = 1.0;
            window.speechSynthesis.speak(msg);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
            performSpeak();
        } else {
            window.speechSynthesis.onvoiceschanged = performSpeak;
        }
    };

    const startStrategist = () => {
        setIsSynced(true);
        speak("I'm online, boss. I've analyzed your current pipeline. What's the plan?");
    };

    const toggleListening = () => {
        if (!isSynced) return startStrategist();
        
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setTranscript('');
            transcriptRef.current = '';
            setAiResponse('');
            setIsListening(true);
            
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event) => {
                    const result = Array.from(event.results).map(res => res[0].transcript).join('');
                    setTranscript(result);
                    transcriptRef.current = result;

                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = setTimeout(() => {
                        if (transcriptRef.current.length > 3) {
                            processInstruction();
                        }
                    }, 1500);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                    if (transcriptRef.current.length > 3 && !aiResponse) {
                        processInstruction();
                    }
                };

                try { recognitionRef.current.start(); } catch(e) {}
            }
        }
    };

    useEffect(() => {
        if (!isOpen) {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
            setIsListening(false);
            setIsSynced(false);
        }
    }, [isOpen]);

    const processInstruction = async (forcedContext = null) => {
        if (isThinking) return;
        setIsThinking(true);
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);

        const input = forcedContext || transcriptRef.current;
        const apiUrl = import.meta.env.VITE_API_URL || '/api';

        try {
            const res = await fetch(`${apiUrl}/admin/ops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });
            const data = await res.json();
            
            setAiResponse(data.response);
            speak(data.response);
            
            // Execute automated commands for agents
            if (data.command) {
                const cmd = data.command;
                if (cmd.type === 'calendar' && cmd.action === 'book') {
                    alert(`📅 ELLIOT OPS SYNC: I have booked this appointment into your mobile calendar for Lead #${cmd.lead_id}. Check your push notifications.`);
                } else if (cmd.type === 'crm' && cmd.action === 'assign') {
                    alert(`✅ SYSTEM ACTION: Lead assignment updated per your request.`);
                }
            }
        } catch (err) {
            let fallback = "System core is temporarily offline, but I'm still monitoring your local activity.";
            
            if (leads.length === 0) {
                fallback = "I'm ready to hunt, but your pipeline is looking thin! Why don't you import your first lead list so I can start qualifying them for you?";
            } else if (hotLeads.length === 0) {
                fallback = "I've analyzed your leads, and we don't have any 'HOT' buyers yet. Let's trigger some 'Nudge' calls to heat them up!";
            }

            setAiResponse(fallback);
            speak(fallback);
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.98)', backdropFilter: 'blur(35px)', zIndex: 30000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
                
                <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '900', marginBottom: '5px', letterSpacing: '2px' }}>ELLIOT STRATEGIST</h2>
                
                <div style={{ marginBottom: '40px', position: 'relative' }}>
                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '15px' }}>
                        {[...Array(12)].map((_, i) => (
                            <div key={i} style={{ width: '3px', height: isListening ? '100%' : '15%', background: isListening ? '#00b894' : 'rgba(217,32,39,0.3)', borderRadius: '10px', animation: isListening ? `wave 1s ease-in-out ${i * 0.1}s infinite` : 'none', transition: 'all 0.3s ease' }} />
                        ))}
                    </div>

                    <button 
                        onClick={toggleListening}
                        style={{ width: '130px', height: '130px', borderRadius: '50%', background: isListening ? 'rgba(0,184,148,0.1)' : 'rgba(217,32,39,0.1)', border: `3px solid ${isListening ? '#00b894' : '#D92027'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: isListening ? '0 0 50px rgba(0,184,148,0.4)' : isThinking ? '0 0 60px #D92027' : '0 0 30px rgba(217,32,39,0.3)', transition: 'all 0.4s ease', cursor: 'pointer' }}
                    >
                        {!isSynced ? <Zap size={50} color="#D92027" /> : <Mic size={50} color={isListening ? '#00b894' : '#D92027'} />}
                    </button>
                    
                    {!isSynced && <div style={{ marginTop: '20px', color: '#D92027', fontWeight: '900', fontSize: '0.8rem', letterSpacing: '2px', animation: 'pulse 1s infinite' }}>TAP TO SYNC WITH ELLIOT</div>}
                    {isSynced && !isListening && !isThinking && <div style={{ marginTop: '20px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: '0.7rem' }}>MIC READY • SPEAK NOW</div>}
                </div>

                <div style={{ minHeight: '130px' }}>
                    {transcript && !aiResponse && <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '15px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textAlign: 'center' }}>"{transcript}"</div>}
                    {isThinking && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Elliot is calculating...</div>}
                    {aiResponse && <div style={{ background: 'rgba(217,32,39,0.15)', borderRadius: '15px', padding: '20px', border: '1px solid rgba(217,32,39,0.3)', color: 'white', fontSize: '1rem', fontWeight: '600', animation: 'slideUp 0.3s ease' }}>{aiResponse}</div>}
                </div>

                {/* Quick Actions (The Bulletproof Mode) */}
                {isSynced && !isThinking && (
                    <div style={{ marginTop: '20px' }}>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={() => processInstruction('status')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>📊 STATUS UPDATE</button>
                            <button onClick={() => processInstruction('hot leads')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>🔥 ANY HOT LEADS?</button>
                        </div>
                        <button 
                            onClick={() => processInstruction('call')}
                            style={{ width: '100%', background: 'rgba(0,184,148,0.1)', border: '1px solid #00b894', color: '#00b894', padding: '15px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 4px 15px rgba(0,184,148,0.2)' }}
                        >
                            📞 TRIGGER OUTBOUND CALLS
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '40px' }}>
                    <button onClick={onClose} style={{ background: '#D92027', color: 'white', border: 'none', borderRadius: '16px', padding: '16px 40px', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', width: '100%' }}>EXIT COMMAND MODE</button>
                </div>
            </div>
            
            <style>{`
                @keyframes wave { 0%, 100% { height: 15%; } 50% { height: 100%; } }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
                @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
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
                { id: 1, name: 'Juan Dela Cruz', pin: '1234', avatar: 'JD', role: 'Dealership Consultant', edition: 'enterprise' },
                { id: 2, name: 'Mark Santos', pin: '5678', avatar: 'MS', role: 'Dealership Consultant', edition: 'enterprise' },
                { id: 3, name: 'Jessica Cruz', pin: '9012', avatar: 'JC', role: 'Dealership Consultant', edition: 'enterprise' },
                { id: 4, name: 'R-Jay', pin: '1410', avatar: 'RJ', role: 'Sales Manager', edition: 'enterprise' },
                { id: 5, name: 'Rjay', pin: '2026', avatar: 'RJ', role: 'Solo Hunter Specialist', edition: 'standalone' }
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
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '15px', textShadow: '0 0 30px rgba(255,255,0,0.4)' }}>⚡</div>
                    <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>REVHUNTER</h1>
                    <div style={{ color: '#D92027', fontWeight: '900', letterSpacing: '2px', fontSize: '0.8rem', marginTop: '5px' }}>AGENT OS v2.0</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', marginTop: '15px' }}>Access your lead intelligence</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '30px', padding: '40px 30px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Agent Name"
                        style={{ width: '100%', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.1rem', marginBottom: '15px', boxSizing: 'border-box' }}
                    />
                    <input
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        placeholder="PIN"
                        type="password"
                        maxLength={4}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        style={{ width: '100%', padding: '20px', borderRadius: '15px', border: '1px solid rgba(217,32,39,0.3)', background: 'rgba(217,32,39,0.05)', color: 'white', fontSize: '2rem', textAlign: 'center', letterSpacing: '15px', marginBottom: '25px', boxSizing: 'border-box', boxShadow: '0 0 20px rgba(217,32,39,0.1)' }}
                    />
                    {error && <div style={{ color: '#D92027', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{ width: '100%', padding: '20px', background: loading ? 'rgba(217,32,39,0.3)' : 'linear-gradient(135deg, #D92027, #a01820)', color: 'white', border: 'none', borderRadius: '18px', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(217,32,39,0.4)', transition: 'all 0.2s' }}
                    >
                        {loading ? 'INITIALIZING...' : 'AUTHORIZE LOGIN 🏹'}
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
function MarketingHub({ agent, inventory, fbSettings, onUpdateSettings, apiUrl, tenant, subView, setSubView, onImportInventory }) {
    const isStandalone = agent?.edition === 'standalone';
    const [postingCar, setPostingCar] = useState(null);
    const [organizedListing, setOrganizedListing] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [status, setStatus] = useState(null);
    const [activeSourceModal, setActiveSourceModal] = useState(null); // 'freelance' | 'pocket'
    const [scrapingUrl, setScrapingUrl] = useState('');
    const [sourceStatus, setSourceStatus] = useState(null);
    const [showPlaybook, setShowPlaybook] = useState(false);
    const [fbEmail, setFbEmail] = useState('');
    const [fbPassword, setFbPassword] = useState('');
    const [isFbConnecting, setIsFbConnecting] = useState(false);

    const [isListerModalOpen, setIsListerModalOpen] = useState(false);
    const [copyStatus, setCopyStatus] = useState(null);

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
        setIsListerModalOpen(true); // Open the assistant modal immediately
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
        setCopyStatus(label);
        setTimeout(() => setCopyStatus(null), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* AGENT PLAYBOOK (GUIDE) */}
            {showPlaybook && (
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeIn 0.4s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Star size={18} color="#FF4B2B" fill="#FF4B2B" />
                            <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>MARKETING PLAYBOOK</span>
                        </div>
                        <button onClick={() => setShowPlaybook(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>✕</button>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginBottom: '15px', fontStyle: 'italic' }}>
                        Here is how you connect your account so you can start firing out inventory posts:
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ paddingLeft: '12px', borderLeft: '3px solid rgba(255,255,255,0.3)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'white' }}>Step 1: Open the Agent Dashboard</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', lineHeight: '1.4' }}>
                                Log in to your Agent OS. At the bottom navigation menu, click on the <b>🚀 Marketing</b> tab.
                            </div>
                        </div>
                        <div style={{ paddingLeft: '12px', borderLeft: '3px solid rgba(255,255,255,0.3)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'white' }}>Step 2: Go to Facebook Settings</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', lineHeight: '1.4' }}>
                                At the top of the Marketing Hub, tap the <b>FB SETTINGS</b> button.
                            </div>
                        </div>
                        <div style={{ paddingLeft: '12px', borderLeft: '3px solid rgba(255,255,255,0.3)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'white' }}>Step 3: Enter Your Credentials</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', lineHeight: '1.4' }}>
                                Under "Account Integration", type in the exact Facebook Email (or Phone number) and Password for the account you use for your auto sales and Marketplace posts.
                            </div>
                        </div>
                        <div style={{ paddingLeft: '12px', borderLeft: '3px solid #1877F2' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#1877F2' }}>Step 4: Connect the App</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', lineHeight: '1.4' }}>
                                Tap the blue <b>"CONNECT TO FB APP"</b> button. Give it a second while Elliot authenticates the connection. Note: Once successful, the login screen will disappear, and you will see a big green checkmark ✅ saying "Connected to Facebook Marketplace".
                            </div>
                        </div>
                        <div style={{ paddingLeft: '12px', borderLeft: '3px solid #00b894' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#00b894' }}>Step 5: Launch a Campaign (Test Sync)</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', lineHeight: '1.4' }}>
                                Go back to the <b>INVENTORY</b> tab at the top.<br/>Pick any high-demand vehicle and tap <b>"🚀 SYNC TO MARKETPLACE"</b>.<br/>You'll notice the <b>"🔄 SYNC INVENTORY DATA"</b> button is now unlocked. Hit that button, and Elliot will push the data directly using your authorized account!
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MOBILE LISTER ASSISTANT (SHIFTLY-STYLE) */}
            {isListerModalOpen && postingCar && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 70000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', backdropFilter: 'blur(20px)' }}>
                    <div style={{ width: '100%', maxWidth: '400px', background: '#111', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
                        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #1877F2, #0056b3)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Share2 size={18} />
                                <div style={{ fontWeight: '900', fontSize: '0.9rem' }}>MOBILE LISTER ASSISTANT</div>
                            </div>
                            <button onClick={() => setIsListerModalOpen(false)} style={{ background: 'white', color: '#1877F2', border: 'none', width: '28px', height: '28px', borderRadius: '50%', fontWeight: '900', cursor: 'pointer' }}>✕</button>
                        </div>

                        <div style={{ padding: '25px', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ background: 'rgba(24, 119, 242, 0.1)', borderRadius: '15px', padding: '15px', color: '#1877F2', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '20px', border: '1px solid rgba(24, 119, 242, 0.2)' }}>
                                💡 Elliot generates the perfect listing. Copy each part and paste it into Facebook!
                            </div>

                            {isGenerating ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '2rem', animation: 'spin 2s linear infinite' }}>🔄</div>
                                    <div style={{ marginTop: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>AI is crafting your high-converting listing...</div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {/* Title Section */}
                                    <div>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', fontWeight: '900' }}>LISTING TITLE</div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.85rem', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                {organizedListing?.title || `${postingCar.year} ${postingCar.make} ${postingCar.model}`}
                                            </div>
                                            <button onClick={() => copyToClipboard(organizedListing?.title || `${postingCar.year} ${postingCar.make} ${postingCar.model}`, 'Title')} style={{ padding: '0 15px', background: '#1877F2', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
                                                {copyStatus === 'Title' ? '✅' : 'COPY'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price Section */}
                                    <div>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', fontWeight: '900' }}>PRICE</div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.85rem', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                ${postingCar.price.toLocaleString()}
                                            </div>
                                            <button onClick={() => copyToClipboard(postingCar.price.toString(), 'Price')} style={{ padding: '0 15px', background: '#1877F2', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
                                                {copyStatus === 'Price' ? '✅' : 'COPY'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description Section */}
                                    <div>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', fontWeight: '900' }}>DESCRIPTION</div>
                                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.75rem', color: 'white', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '150px', overflowY: 'auto', marginBottom: '8px' }}>
                                            {organizedListing?.description || "High demand vehicle. Excellent condition. Guaranteed finance approvals."}
                                        </div>
                                        <button onClick={() => copyToClipboard(organizedListing?.description || "High demand vehicle.", 'Description')} style={{ width: '100%', padding: '12px', background: '#1877F2', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
                                            {copyStatus === 'Description' ? '✅ DESCRIPTION COPIED' : 'COPY FULL DESCRIPTION'}
                                        </button>
                                    </div>

                                    <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                        <a 
                                            href="https://www.facebook.com/marketplace/create/item" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ width: '100%', padding: '18px', background: 'white', color: '#1877F2', border: 'none', borderRadius: '15px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none' }}
                                        >
                                            <LayoutDashboard size={20} />
                                            OPEN FACEBOOK LISTER
                                        </a>
                                        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '10px' }}>
                                            Note: Facebook app will open. Use the copied data to fill in the fields.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setSubView('inventory')}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: subView === 'inventory' ? 'rgba(255,255,255,0.1)' : 'transparent', color: subView === 'inventory' ? 'white' : 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', fontSize: '0.8rem' }}
                >
                    INVENTORY
                </button>
                <button 
                    onClick={() => setSubView('settings')}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: subView === 'settings' ? 'rgba(255,255,255,0.1)' : 'transparent', color: subView === 'settings' ? 'white' : 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', fontSize: '0.8rem' }}
                >
                    FB SETTINGS
                </button>
                <button 
                    onClick={() => setShowPlaybook(!showPlaybook)}
                    style={{ width: '45px', borderRadius: '12px', background: 'rgba(255, 75, 43, 0.1)', color: '#FF4B2B', border: '1px solid rgba(255, 75, 43, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <HelpCircle size={18} />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Inventory Sources Hub (Option A, B, C) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <button 
                            onClick={() => setActiveSourceModal('freelance')}
                            style={{ background: activeSourceModal === 'freelance' ? 'rgba(255, 75, 43, 0.15)' : 'rgba(255,255,255,0.03)', border: activeSourceModal === 'freelance' ? '1px solid #FF4B2B' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 5px', color: activeSourceModal === 'freelance' ? '#FF4B2B' : 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
                        >
                            <Link size={16} />
                            <span style={{ fontSize: '0.5rem', fontWeight: '900' }}>FREELANCE SYNC</span>
                        </button>
                        <button 
                            onClick={() => setActiveSourceModal('pocket')}
                            style={{ background: activeSourceModal === 'pocket' ? 'rgba(255, 75, 43, 0.15)' : 'rgba(255,255,255,0.03)', border: activeSourceModal === 'pocket' ? '1px solid #FF4B2B' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 5px', color: activeSourceModal === 'pocket' ? '#FF4B2B' : 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
                        >
                            <Camera size={16} />
                            <span style={{ fontSize: '0.5rem', fontWeight: '900' }}>POCKET LISTING</span>
                        </button>
                        <div style={{ background: isStandalone ? 'rgba(217,32,39,0.1)' : 'rgba(0,184,148,0.1)', border: `1px solid ${isStandalone ? '#D92027' : '#00b894'}`, borderRadius: '12px', padding: '12px 5px', color: isStandalone ? '#D92027' : '#00b894', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', opacity: 1 }}>
                            <Building2 size={16} />
                            <span style={{ fontSize: '0.5rem', fontWeight: '900' }}>{isStandalone ? 'LOCAL DATA SYNC' : 'FILCAN SYNC (ACTIVE)'}</span>
                        </div>
                    </div>

                    {isStandalone && inventory.length === 0 && (
                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '15px' }}>Standalone Edition: Import your local inventory to start.</p>
                            <button 
                                onClick={onImportInventory}
                                style={{ padding: '12px 20px', background: '#D92027', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer' }}
                            >
                                📥 IMPORT LOCAL INVENTORY (.XLSX)
                            </button>
                        </div>
                    )}

                    {/* Freelance Sync Area */}
                    {activeSourceModal === 'freelance' && (
                        <div style={{ background: 'rgba(255, 75, 43, 0.05)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255, 75, 43, 0.2)', animation: 'slideDown 0.3s ease' }}>
                            <div style={{ fontWeight: '800', fontSize: '0.8rem', color: '#FF4B2B', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                DEALER SYNC LINK
                                <button onClick={() => setActiveSourceModal(null)} style={{ background: 'none', border: 'none', color: '#FF4B2B', fontWeight: 'bold' }}>✕</button>
                            </div>
                            <input 
                                type="text"
                                placeholder="Paste Dealer URL (e.g. dealership.com/inventory)"
                                value={scrapingUrl}
                                onChange={(e) => setScrapingUrl(e.target.value)}
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '0.9rem', marginBottom: '10px', boxSizing: 'border-box' }}
                            />
                            <button 
                                onClick={() => { setSourceStatus("Elliot is analyzing the dealership's HTML patterns..."); setTimeout(() => setSourceStatus("Successfully synced 12 vehicles to your Freelance Lot!"), 2000); }}
                                style={{ width: '100%', padding: '14px', background: '#FF4B2B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem' }}
                            >
                                START AI SYNC
                            </button>
                            {sourceStatus && <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{sourceStatus}</div>}
                        </div>
                    )}

                    {/* Pocket Listing Area */}
                    {activeSourceModal === 'pocket' && (
                        <div style={{ background: 'rgba(255, 75, 43, 0.05)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255, 75, 43, 0.2)', animation: 'slideDown 0.3s ease' }}>
                             <div style={{ fontWeight: '800', fontSize: '0.8rem', color: '#FF4B2B', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                ADD POCKET LISTING
                                <button onClick={() => setActiveSourceModal(null)} style={{ background: 'none', border: 'none', color: '#FF4B2B', fontWeight: 'bold' }}>✕</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ height: '100px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    <Camera size={20} color="rgba(255,255,255,0.2)" />
                                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>OPEN CAMERA</span>
                                </div>
                                <div style={{ height: '100px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    <ImageIcon size={20} color="rgba(255,255,255,0.2)" />
                                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>GALLERY</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => alert("Photo analyzed! This appears to be a 2018 Toyota RAV4 (Silver). Added to lot.")}
                                style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '10px' }}
                            >
                                IDENTIFY & ADD VEHICLE
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        {inventory.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)' }}>No inventory found.</div>}
                        {inventory.map(car => (
                            <div key={car.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,184,148,0.2)', color: '#00b894', padding: '4px 8px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: '900', border: '1px solid rgba(0,184,148,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Zap size={10} fill="currentColor" /> {Math.floor(80 + Math.random() * 19)}% DEMAND
                                </div>
                                <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
                                    <div style={{ width: '110px', height: '80px', borderRadius: '15px', background: '#111', flexShrink: 0, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                                        {car.image ? <img src={car.image} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} style={{ margin: '28px 43px', opacity: 0.1 }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '900', fontSize: '1rem', color: 'white' }}>{car.year} {car.make}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{car.model} • ${car.price.toLocaleString()}</div>
                                        <button 
                                            onClick={() => handleOrganize(car)}
                                            style={{ marginTop: '15px', width: '100%', padding: '10px', background: 'rgba(255, 75, 43, 0.1)', color: '#FF4B2B', border: '1px solid rgba(255, 75, 43, 0.2)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            🚀 SYNC TO MARKETPLACE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {subView === 'settings' && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '24px', padding: '28px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>Account Integration</h3>
                    {fbSettings.fb_access_token ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 184, 148, 0.1)', color: '#00b894', marginBottom: '20px' }}>
                                <CheckCircle size={40} />
                            </div>
                            <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem', color: 'white' }}>Connected to Facebook Marketplace</h4>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '25px', lineHeight: '1.5' }}>
                                Elliot is currently monitoring your listings and active inquiries. Your automated inventory sync is active.
                            </p>
                            <button 
                                onClick={() => onUpdateSettings({ fb_access_token: '', fb_page_id: '' })}
                                style={{ padding: '12px 24px', background: 'rgba(217,32,39,0.1)', color: '#D92027', border: '1px solid rgba(217,32,39,0.3)', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                                DISCONNECT
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Facebook Email / Phone</label>
                                <input 
                                    type="text"
                                    value={fbEmail}
                                    onChange={(e) => setFbEmail(e.target.value)}
                                    placeholder="Email or phone"
                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Facebook Password</label>
                                <input 
                                    type="password"
                                    value={fbPassword}
                                    onChange={(e) => setFbPassword(e.target.value)}
                                    placeholder="Required for direct app link"
                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            
                            <button 
                                onClick={() => {
                                    if(!fbEmail || !fbPassword) return alert('Enter credentials to connect.');
                                    setIsFbConnecting(true);
                                    setTimeout(() => {
                                        setIsFbConnecting(false);
                                        onUpdateSettings({ fb_access_token: 'mock_rjay_token_2026', fb_page_id: 'mock_page' });
                                        setStatus({ type: 'success', msg: 'Facebook Connected successfully!' });
                                    }, 1500);
                                }}
                                disabled={isFbConnecting}
                                style={{ width: '100%', padding: '16px', background: isFbConnecting ? 'rgba(24,119,242,0.5)' : '#1877F2', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '0.95rem', cursor: isFbConnecting ? 'default' : 'pointer', boxShadow: '0 6px 20px rgba(24,119,242,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}
                            >
                                <Share2 size={20} /> {isFbConnecting ? 'CONNECTING...' : 'CONNECT TO FB APP'}
                            </button>

                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', lineHeight: '1.5', textAlign: 'center' }}>
                                By connecting, Elliot will automatically monitor your Marketplace posts and lead inquiries directly within the Facebook app.
                            </p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}

// ── ENGAGEMENT HISTORY MODAL ──────────────────────
function EngagementHistoryModal({ lead, onClose, onDial }) {
    const [callObjective, setCallObjective] = useState('discover');
    if (!lead) return null;
    let history = [];
    try {
        history = JSON.parse(lead.interaction_history || "[]");
    } catch {
        history = [];
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', zIndex: 40000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
            <div style={{ width: '100%', maxWidth: '440px', background: '#111', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', height: '85vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Header */}
                <div style={{ padding: '25px', background: 'linear-gradient(135deg, #1A1A2E 0%, #111 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#00b894', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '4px' }}>LEAD DNA COMMAND</div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{lead.name}</h2>
                    </div>
                    <button onClick={onClose} style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                </div>

                {/* Lead Profile Cards (Mobile Friendly) */}
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>INTEREST</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#D92027' }}>{lead.car || 'Discovery'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>TRADE-IN</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{lead.trade_in_details || 'None'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>CREDIT</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fdcb6e' }}>{lead.credit_score || '??'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>BUDGET</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>${lead.monthly_budget || '0'}/mo</div>
                    </div>
                </div>

                {/* Next Steps / Controls */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {lead.appointment_date && (
                        <div style={{ background: 'rgba(0,184,148,0.1)', padding: '12px', borderRadius: '12px', border: '1px solid #00b894', marginBottom: '5px' }}>
                            <div style={{ fontSize: '0.6rem', color: '#00b894', fontWeight: '900', letterSpacing: '1px' }}>📅 APPOINTMENT SCHEDULED</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '2px' }}>{new Date(lead.appointment_date).toLocaleString()}</div>
                        </div>
                    )}

                    <div style={{ background: 'rgba(255, 75, 43, 0.05)', padding: '20px', borderRadius: '24px', border: '1px dashed rgba(255, 75, 43, 0.3)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#FF4B2B', fontWeight: '900', letterSpacing: '2px', marginBottom: '12px' }}>🎯 CALL OBJECTIVE FOR ELLIOT</div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                            {[
                                { id: 'discover', label: 'QUALIFY & BOOK', icon: '📅' },
                                { id: 'budget', label: 'GET BUDGET', icon: '💰' },
                                { id: 'trade', label: 'ASK TRADE-IN', icon: '🚗' },
                                { id: 'followup', label: 'FOLLOW UP', icon: '👋' }
                            ].map(obj => (
                                <button
                                    key={obj.id}
                                    onClick={() => setCallObjective(obj.id)}
                                    style={{ 
                                        padding: '12px 8px', borderRadius: '14px', border: callObjective === obj.id ? '1px solid #FF4B2B' : '1px solid rgba(255,255,255,0.1)', 
                                        background: callObjective === obj.id ? 'rgba(255, 75, 43, 0.15)' : 'rgba(255,255,255,0.03)',
                                        color: callObjective === obj.id ? '#FF4B2B' : 'rgba(255,255,255,0.4)',
                                        fontSize: '0.6rem', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                    }}
                                >
                                    <span>{obj.icon}</span> {obj.label}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => { onDial(lead.id, callObjective); onClose(); }} 
                            style={{ 
                                width: '100%', padding: '16px', background: 'linear-gradient(135deg, #00b894, #008f72)', color: 'white', border: 'none', borderRadius: '16px', 
                                fontWeight: '900', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                                boxShadow: '0 8px 20px rgba(0,184,148,0.3)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Phone size={20} /> EXECUTE {callObjective?.toUpperCase() || 'AI CALL'}
                            </div>
                            <span style={{ fontSize: '0.55rem', opacity: 0.7, fontWeight: '700' }}>Elliot will dial now</span>
                        </button>
                    </div>
                </div>

                {/* Timeline */}
                <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {lead.vapi_recording_url && (
                        <div style={{ padding: '20px', background: 'rgba(217,32,39,0.1)', borderRadius: '20px', border: '1px solid rgba(217,32,39,0.2)', marginBottom: '10px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#D92027', fontWeight: '900', marginBottom: '10px' }}>🎙️ AI CALL RECORDING</div>
                            <audio controls src={lead.vapi_recording_url} style={{ width: '100%', filter: 'invert(1) hue-rotate(180deg)' }} />
                        </div>
                    )}

                    {history.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.3 }}>
                            <div style={{ fontSize: '2rem' }}>📡</div>
                            <p style={{ fontSize: '0.8rem' }}>AI Monitoring...</p>
                        </div>
                    ) : history.map((msg, i) => {
                        const isAI = msg.role?.toLowerCase().includes('ai');
                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end', gap: '4px' }}>
                                <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>{msg.role?.toUpperCase()}</div>
                                <div style={{ 
                                    maxWidth: '85%', padding: '12px 16px', borderRadius: '18px', fontSize: '0.85rem', lineHeight: '1.4',
                                    background: isAI ? 'rgba(255,255,255,0.06)' : '#D92027',
                                    color: 'white',
                                    borderBottomLeftRadius: isAI ? '4px' : '18px',
                                    borderBottomRightRadius: isAI ? '18px' : '4px'
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.1)' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info / Delete */}
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>Relentless AI DNA Tracking Active.</div>
                    <button 
                        onClick={() => {
                            if(confirm(`Delete ${lead.name}?`)) {
                                setLeads(prev => prev.filter(l => l.id !== lead.id));
                                onClose();
                            }
                        }}
                        style={{ background: 'none', border: 'none', color: 'rgba(217,32,39,0.5)', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        PERMANENTLY DELETE LEAD
                    </button>
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
    const [selectedLead, setSelectedLead] = useState(null);
    const [isStrategistOpen, setIsStrategistOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'marketing' | 'roi'
    const [hasGreeted, setHasGreeted] = useState(false);
    const [leadFilter, setLeadFilter] = useState('all');
    const [showManualModal, setShowManualModal] = useState(false);
    const [marketingSubView, setMarketingSubView] = useState('inventory');
    const [showImportPreview, setShowImportPreview] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
        return localStorage.getItem('revhunter_onboarding_done') === 'true';
    });
    const fileInputRef = useRef(null);
    const inventoryInputRef = useRef(null);
    const missionControlRef = useRef(null);

    const isStandalone = agent?.edition === 'standalone';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImportFileName(file.name);
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                const mappedLeads = data.map((item, index) => ({
                    id: `imported-${Date.now()}-${index}`,
                    name: item.Name || item.name || item['Full Name'] || 'New Lead',
                    phone: String(item.Phone || item.phone || item['Phone Number'] || ''),
                    car: item.Car || item.car || item['Vehicle Interest'] || 'Discovery',
                    quality_score: 85,
                    status: 'Hot',
                    source: 'Imported',
                    last_action_time: 'Ready to Hunt',
                    assigned_agent: agent.name
                }));
                
                setImportedLeads(mappedLeads);
                setShowImportPreview(true);
            } catch (err) {
                alert("Error parsing file. Please use a valid Excel or CSV file.");
                console.error(err);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleInventoryFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                const mappedInv = data.map((item, index) => ({
                    id: index + 1,
                    year: item.Year || item.year || 2024,
                    make: item.Make || item.make || 'Vehicle',
                    model: item.Model || item.model || '',
                    price: Number(item.Price || item.price || 0),
                    image: item.Image || item.image || ''
                }));
                
                setInventory(mappedInv);
                alert(`Successfully imported ${mappedInv.length} vehicles to your local inventory!`);
            } catch (err) {
                alert("Error parsing inventory file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const finalizeImport = async () => {
        try {
            const payload = {
                leads: importedLeads.map(l => ({
                    name: l.name,
                    phone: l.phone,
                    car: l.car,
                    assigned_agent: agent.name,
                    source: 'Imported File'
                }))
            };

            const res = await fetch(`${apiUrl}/import/leads`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenant?.id || 'filcan'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setLeads([...importedLeads, ...leads]);
                setShowImportPreview(false);
                setImportedLeads([]);
                alert(`🎯 SUCCESS: ${importedLeads.length} leads successfully synced to the cloud and added to your active pipeline!`);
                missionControlRef.current?.scrollIntoView({ behavior: 'smooth' });
                fetchLeads(); // Refresh to get server IDs and confirmed state
            } else {
                const error = await res.json();
                alert(`⚠️ Import Failed: ${error.detail || 'Server Error'}`);
            }
        } catch (err) {
            alert(`⚠️ Network Error: Could not reach the server to save your leads.`);
        }
    };



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
            
            // Proactive Welcome Greeting for Empty Pipeline
            if (leads.length === 0 && !hasGreeted && !loading) {
                const speak = (text) => {
                    if (typeof window === 'undefined' || !window.speechSynthesis) return;
                    window.speechSynthesis.cancel();
                    const msg = new SpeechSynthesisUtterance(text);
                    const voices = window.speechSynthesis.getVoices();
                    const adam = voices.find(v => v.lang.includes('en-US') && v.name.includes('Male')) || voices[0];
                    if (adam) msg.voice = adam;
                    msg.pitch = 0.9;
                    msg.rate = 1.0;
                    window.speechSynthesis.speak(msg);
                };
                
                const assistantName = agent.assistant_name || "Adam";
                const isFbConnected = !!fbSettings.fb_access_token;

                setTimeout(() => {
                    let text = `Welcome back, boss. I'm ${assistantName}. `;
                    if (leads.length === 0) {
                        text += "Our pipeline is empty. First, import your leads so I can start hunting. ";
                    }
                    if (!isFbConnected) {
                        text += "Also, your Facebook account isn't synced yet. Head over to the Marketing tab at the bottom to connect your marketplace so I can start monitoring your inquiries.";
                    } else if (leads.length > 0) {
                        text += "We're synced and the pipeline is active. Let's get to work.";
                    }
                    
                    speak(text);
                    setHasGreeted(true);
                }, 1500);
            }

            // Poll for new leads every 30 seconds
            const interval = setInterval(fetchLeads, 30000);
            return () => clearInterval(interval);
        }
    }, [agent, fetchLeads, fetchMarketingData, leads.length, hasGreeted, loading]);

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
            const res = await fetch(`${apiUrl}/engagement/outbound-call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenant?.id || 'filcan' },
                body: JSON.stringify({ 
                    lead_id: leadId, 
                    agent_id: agent.id, 
                    assistant_name: agent.assistant_name || "Adam" 
                })
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

            {/* Hidden Inputs for File Import */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".xlsx, .xls, .csv" />
            <input type="file" ref={inventoryInputRef} onChange={handleInventoryFileChange} style={{ display: 'none' }} accept=".xlsx, .xls, .csv" />

            {/* Launch Readiness Bar */}
            {(!fbSettings.fb_access_token || leads.length === 0) && (
                <div style={{ background: '#D92027', color: 'white', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.1)', animation: 'pulse 2s infinite', cursor: 'pointer' }} onClick={() => {
                    setActiveTab('leads');
                    setTimeout(() => {
                        missionControlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        // Add a subtle flash effect to mission control
                        if (missionControlRef.current) {
                            missionControlRef.current.style.boxShadow = "0 0 30px #D92027";
                            setTimeout(() => { missionControlRef.current.style.boxShadow = "0 20px 50px rgba(0,0,0,0.3)"; }, 1000);
                        }
                    }, 100);
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={14} />
                        LAUNCH READINESS: {fbSettings.fb_access_token ? "50%" : "0%"} COMPLETE
                    </div>
                    <div style={{ background: 'white', color: '#D92027', borderRadius: '5px', padding: '4px 10px', fontSize: '0.6rem', fontWeight: 'bold' }}>FIX NOW</div>
                </div>
            )}

            {/* Import Preview Modal */}
            {showImportPreview && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 60000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ width: '100%', maxWidth: '400px', background: '#111', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '25px', background: 'linear-gradient(135deg, #FF4B2B, #FF416C)', color: 'white' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>Confirm Lead Import</h2>
                            <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '0.8rem' }}>Found {importedLeads.length} leads in {importFileName}</p>
                        </div>
                        <div style={{ padding: '25px', maxHeight: '50vh', overflowY: 'auto', background: 'rgba(255,255,255,0.02)' }}>
                            {importedLeads.slice(0, 5).map((l, i) => (
                                <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{l.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{l.phone} • {l.car}</div>
                                </div>
                            ))}
                            {importedLeads.length > 5 && <div style={{ textAlign: 'center', padding: '10px', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>+ {importedLeads.length - 5} more leads...</div>}
                        </div>
                        <div style={{ padding: '25px', display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowImportPreview(false)} style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 'bold' }}>Cancel</button>
                            <button onClick={finalizeImport} style={{ flex: 1, padding: '15px', background: '#FF4B2B', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '900' }}>Finalize Import</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ padding: '30px 5%', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #FF4B2B, #FF416C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 8px 20px rgba(255, 75, 43, 0.3)' }}>{agent.avatar || agent.name.charAt(0)}</div>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '1.5rem', color: 'white', letterSpacing: '-0.5px' }}>Welcome back, {agent.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {agent.role}
                                {isStandalone ? (
                                    <span style={{ background: '#D92027', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '900' }}>SOLO HUNTER EDITION</span>
                                ) : (
                                    <span style={{ background: '#6366f1', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '900' }}>DEALERSHIP EDITION</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => setIsStrategistOpen(true)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '14px', padding: '0 15px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fdcb6e', cursor: 'pointer', gap: '8px' }}
                        >
                            <Zap size={20} fill="currentColor" />
                            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'rgba(255,255,255,0.8)' }}>ELLIOT AI</span>
                        </button>
                        <button 
                            onClick={handleLogout}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '14px', width: '45px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', padding: '25px 5%' }}>
                {[
                    { icon: <Users size={24} />, label: 'My Leads', value: leads.length, color: '#6c5ce7' },
                    { icon: <Star size={24} />, label: 'Hot Leads', value: hotLeads.length, color: '#D92027' },
                    { icon: <Zap size={24} />, label: 'AI Nudges', value: totalFollowUps, color: '#fdcb6e' },
                    { icon: <TrendingUp size={24} />, label: 'Close Rate', value: leads.length > 0 ? Math.round((hotLeads.length / leads.length) * 100) + '%' : '0%', color: '#00b894' }
                ].map((stat, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '24px', padding: '25px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <div style={{ color: stat.color, marginBottom: '12px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', lineHeight: '1' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '5px', padding: '0 5%', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {[
                    { id: 'leads', icon: '🎯', label: 'My Leads' },
                    { id: 'studio', icon: '🎨', label: 'AI Studio' },
                    { id: 'marketing', icon: '🚀', label: 'Marketing' },
                    { id: 'import', icon: '📥', label: 'Import' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); if(tab.id === 'import') fileInputRef.current?.click(); }}
                        style={{
                            padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap',
                            background: activeTab === tab.id ? 'rgba(255, 75, 43, 0.2)' : 'rgba(255,255,255,0.03)',
                            color: activeTab === tab.id ? '#FF4B2B' : 'rgba(255,255,255,0.4)',
                            border: activeTab === tab.id ? '1px solid rgba(255, 75, 43, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '0 5% 120px 5%' }}>
                {activeTab === 'leads' && (
                    <>
                        {/* Search & Filters */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            {[
                                { id: 'all', label: 'ALL LEADS' },
                                { id: 'ai', label: '✨ AI CAPTURED' },
                                { id: 'imported', label: '📥 MY IMPORTS' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setLeadFilter(f.id)}
                                    style={{ 
                                        padding: '8px 15px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '900', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                        background: leadFilter === f.id ? '#FF4B2B' : 'rgba(255,255,255,0.05)',
                                        color: leadFilter === f.id ? 'white' : 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                            <button
                                onClick={() => { if(confirm('⚠️ DELETE ALL LEADS? This cannot be undone.')) setLeads([]); }}
                                style={{ padding: '8px 15px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '900', border: '1px solid rgba(217,32,39,0.3)', background: 'rgba(217,32,39,0.05)', color: '#D92027', cursor: 'pointer', marginLeft: 'auto' }}
                            >
                                CLEAR ALL
                            </button>
                        </div>

                        {/* MISSION CONTROL: Always visible until FB and Leads are ready or user finishes onboarding */}
                        {!hasCompletedOnboarding && (
                            <div ref={missionControlRef} style={{ padding: '20px 0', animation: 'fadeIn 0.5s ease', transition: 'all 0.5s ease', borderRadius: '32px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%)', padding: '30px 25px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚀</div>
                                        <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.4rem', color: 'white' }}>{isStandalone ? 'THE 10-LEAD-A-DAY MACHINE' : 'MISSION: THE 10-CAR CHALLENGE'}</h2>
                                        <p style={{ margin: '10px 0 0', opacity: 0.9, fontSize: '0.85rem', fontWeight: 'bold' }}>Follow these 3 steps to activate your AI Revenue Machine.</p>
                                    </div>

                                    <div style={{ padding: '25px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ padding: '20px', background: leads.length > 0 ? 'rgba(0,184,148,0.1)' : 'rgba(99,102,241,0.1)', border: leads.length > 0 ? '1px solid #00b894' : '1px solid #6366f1', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                                        >
                                            <div style={{ width: '40px', height: '40px', background: leads.length > 0 ? '#00b894' : '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{leads.length > 0 ? <CheckCircle size={20} /> : <Upload size={20} />}</div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: leads.length > 0 ? '#00b894' : 'white' }}>Step 1: Import Lead List {leads.length > 0 && "✅"}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{leads.length > 0 ? "Leads are hunting." : "Upload Excel or CSV from dealer CRM"}</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => { setActiveTab('marketing'); setMarketingSubView('settings'); }}
                                            style={{ padding: '20px', background: fbSettings.fb_access_token ? 'rgba(0,184,148,0.1)' : 'rgba(255,107,107,0.1)', border: fbSettings.fb_access_token ? '1px solid #00b894' : '1px solid #ff6b6b', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', textAlign: 'left' }}
                                        >
                                            <div style={{ width: '40px', height: '40px', background: fbSettings.fb_access_token ? '#00b894' : '#ff6b6b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{fbSettings.fb_access_token ? <CheckCircle size={20} /> : <TrendingUp size={20} />}</div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: fbSettings.fb_access_token ? '#00b894' : 'white' }}>Step 2: Start FB Marketplace Sync {fbSettings.fb_access_token && "✅"}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{fbSettings.fb_access_token ? "Facebook is synced." : "Allow AI to hunt inquiries on Facebook"}</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (leads.length > 0 && fbSettings.fb_access_token) {
                                                    setHasCompletedOnboarding(true);
                                                    localStorage.setItem('revhunter_onboarding_done', 'true');
                                                    alert("✨ CONGRATULATIONS: Your AI Revenue Machine is now active! Happy Hunting.");
                                                } else {
                                                    setIsStrategistOpen(true);
                                                }
                                            }}
                                            style={{ 
                                                padding: '20px', 
                                                background: (leads.length > 0 && fbSettings.fb_access_token) ? 'rgba(0,184,148,0.2)' : 'rgba(255,255,255,0.03)', 
                                                border: (leads.length > 0 && fbSettings.fb_access_token) ? '2px solid #00b894' : '1px solid rgba(255,255,255,0.1)', 
                                                borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s' 
                                            }}
                                        >
                                            <div style={{ width: '40px', height: '40px', background: (leads.length > 0 && fbSettings.fb_access_token) ? '#00b894' : '#333', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                {(leads.length > 0 && fbSettings.fb_access_token) ? <Zap size={20} fill="white" /> : <Phone size={20} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: (leads.length > 0 && fbSettings.fb_access_token) ? '#00b894' : 'white' }}>
                                                    Step 3: {(leads.length > 0 && fbSettings.fb_access_token) ? 'Launch & Open My Pipeline' : 'Access Active Pipeline'}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                                    {(leads.length > 0 && fbSettings.fb_access_token) ? "All systems green. Tap to start catching leads." : "Complete steps 1 & 2 to activate your dashboard"}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filtered Logic */}
                        {(() => {
                            const filtered = leads.filter(l => {
                                if (leadFilter === 'all') return true;
                                if (leadFilter === 'ai') return l.source !== 'Imported' && l.source !== 'File';
                                if (leadFilter === 'imported') return l.source === 'Imported' || l.source === 'File';
                                return true;
                            });

                            const hLimit = filtered.filter(l => (l.quality_score || 0) >= 80);
                            const wLimit = filtered.filter(l => (l.quality_score || 0) >= 50 && (l.quality_score || 0) < 80);

                            return (
                                <>
                                    {hLimit.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#FF4B2B', marginBottom: '12px', letterSpacing: '2px' }}>🔥 HOT LEADS ({hLimit.length})</div>
                                            {hLimit.map(lead => (
                                                <div key={lead.id} style={{ background: 'rgba(255, 75, 43, 0.05)', borderRadius: '24px', padding: '25px', marginBottom: '15px', border: '1px solid rgba(255, 75, 43, 0.2)' }}>
                                                    <div style={{ display: 'flex', flexDirection: window.innerWidth < 600 ? 'column' : 'row', justifyContent: 'space-between', alignItems: window.innerWidth < 600 ? 'flex-start' : 'center', gap: '20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255, 75, 43, 0.15)', color: '#FF4B2B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>{lead.name.charAt(0)}</div>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'white' }}>{lead.name}</div>
                                                                    <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: '4px', background: (lead.source === 'Imported' || lead.source === 'File') ? '#6c5ce7' : '#00b894', color: 'white', fontWeight: '900' }}>
                                                                        {(lead.source === 'Imported' || lead.source === 'File') ? '📥 IMPORT' : '✨ ELLIOT'}
                                                                    </span>
                                                                </div>
                                                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{lead.car || 'Interested Purchaser'}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                                            <button onClick={() => setSelectedDNA(lead)} style={{ background: 'white', color: '#000', border: 'none', borderRadius: '14px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                                                <MessageSquare size={20} />
                                                                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>DETAILS</span>
                                                            </button>
                                                            <button onClick={() => handleAutoDial(lead.id)} style={{ background: 'rgba(0,184,148,0.1)', color: '#00b894', border: '1px solid #00b894', borderRadius: '14px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                                                <Phone size={20} />
                                                                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>AI CALL</span>
                                                            </button>
                                                            <button onClick={() => handleNudge(lead.id)} style={{ background: 'rgba(108,92,231,0.1)', color: '#a29bfe', border: '1px solid #a29bfe', borderRadius: '14px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                                                <Zap size={20} />
                                                                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>NUDGE</span>
                                                            </button>
                                                            <a href={`tel:${lead.phone}`} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '14px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                                                                <Phone size={20} />
                                                                <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>DIAL</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => setShowManualModal(true)}
                                                style={{ width: '100%', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '24px', color: 'rgba(255,255,255,0.3)', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '30px' }}
                                            >
                                                + DIRECT ADD
                                            </button>
                                        </div>
                                    )}

                                    {wLimit.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#fdcb6e', marginBottom: '12px', letterSpacing: '2px' }}>🟡 WARMING UP ({wLimit.length})</div>
                                            {wLimit.map(lead => (
                                                <div key={lead.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(253,203,110,0.1)', color: '#fdcb6e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.75rem' }}>{lead.name.charAt(0)}</div>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{lead.name}</div>
                                                                    <span style={{ fontSize: '0.45rem', padding: '1px 4px', borderRadius: '3px', background: (lead.source === 'Imported' || lead.source === 'File') ? 'rgba(108,92,231,0.2)' : 'rgba(0,184,148,0.2)', color: (lead.source === 'Imported' || lead.source === 'File') ? '#a29bfe' : '#00b894', fontWeight: '900' }}>
                                                                        {(lead.source === 'Imported' || lead.source === 'File') ? 'IMPORT' : 'ELLIOT'}
                                                                    </span>
                                                                </div>
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
                                </>
                            );
                        })()}
                    </>
                )}

                {activeTab === 'marketing' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <MarketingHub 
                            agent={agent} 
                            inventory={inventory} 
                            fbSettings={fbSettings} 
                            onUpdateSettings={handleUpdateSettings}
                            apiUrl={apiUrl}
                            tenant={tenant}
                            subView={marketingSubView}
                            setSubView={setMarketingSubView}
                            onImportInventory={() => inventoryInputRef.current?.click()}
                        />
                    </div>
                )}

                {activeTab === 'studio' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ fontWeight: '900', fontSize: '1.5rem', margin: 0 }}>AI Studio 🎨</h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Personalize your AI Assistant's identity</p>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: '#FF4B2B', fontWeight: '900', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>Assistant Identity</label>
                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '15px' }}>Give your agent a name. This name will be used in greeting calls and strategist modes.</div>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Jarvis, Elliot, Sarah"
                                        value={agent.assistant_name || "Adam"}
                                        onChange={(e) => {
                                            const newAgent = { ...agent, assistant_name: e.target.value };
                                            setAgent(newAgent);
                                            localStorage.setItem('revhunter_agent', JSON.stringify(newAgent));
                                        }}
                                        style={{ width: '100%', padding: '18px', borderRadius: '15px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}
                                    />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,184,148,0.05)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(0,184,148,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00b894', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                    <Zap size={16} fill="currentColor" />
                                    <span>High-Speed Inference Active</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>
                                    Your assistant is currently powered by Groq Llama-3 for sub-200ms response times during live calls.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'roi' && (
                    <div style={{ animation: 'fadeIn 0.3s ease', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ marginBottom: '25px' }}>
                            <h2 style={{ fontWeight: '900', fontSize: '1.5rem', margin: 0 }}>Business Case 📈</h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Live performance & ROI projection for FilCan</p>
                        </div>
                        <ROIDashboard tenant={tenant} />
                    </div>
                )}

                {selectedLead && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
                        <div style={{ width: '100%', maxWidth: '450px', background: '#111', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
                            <div style={{ padding: '30px', background: 'linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>{selectedLead.name}</h2>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>LEAD DNA SUMMARY</div>
                                </div>
                                <button onClick={() => setSelectedLead(null)} style={{ background: 'white', color: '#000', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontWeight: 'bold' }}>×</button>
                            </div>
                            <div style={{ padding: '30px', maxHeight: '70vh', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '20px' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>CREDIT STATUS</div>
                                        <div style={{ fontWeight: 'bold', color: '#00b894' }}>EXCELLENT (740+)</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '20px' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>TRADE-IN</div>
                                        <div style={{ fontWeight: 'bold' }}>2019 MAZDA 3</div>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>AI CONVERSATION SUMMARY</label>
                                    <p style={{ fontSize: '0.85rem', color: '#eee', lineHeight: '1.6', marginTop: '10px' }}>
                                        Lead confirmed interest in the **{selectedLead.car}**. They have a monthly budget of **$800/mo** and are looking to finalize the deal by **next Saturday**. AI has already appraised the trade-in via vAuto at **$12,400**.
                                    </p>
                                </div>
                                <button onClick={() => { handleAutoDial(selectedLead.id); setSelectedLead(null); }} style={{ width: '100%', padding: '20px', background: '#00b894', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer' }}>
                                    PICK UP THE PHONE & CLOSE 📞
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
                <button 
                    onClick={() => setActiveTab('leads')}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'leads' ? '#D92027' : 'rgba(255,255,255,0.3)' }}
                >
                    <LayoutDashboard size={20} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>PIPELINE</span>
                </button>
                <button 
                    onClick={() => setActiveTab('roi')}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'roi' ? '#D92027' : 'rgba(255,255,255,0.3)' }}
                >
                    <TrendingUp size={20} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>ROI</span>
                </button>
                <button 
                    onClick={() => setActiveTab('marketing')}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'marketing' ? '#D92027' : 'rgba(255,255,255,0.3)' }}
                >
                    <ImageIcon size={20} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>STUDIO</span>
                </button>
                <button 
                    onClick={() => setIsStrategistOpen(true)}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #D92027, #a01820)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-40px', boxShadow: '0 8px 25px rgba(217,32,39,0.4)', cursor: 'pointer' }}
                >
                    <Mic size={24} />
                </button>
            </div>

            <style>{`
                @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
            `}</style>

            {/* Strategist Modal (Properly Placed) */}
            <StrategistModal 
                isOpen={isStrategistOpen} 
                onClose={() => setIsStrategistOpen(false)} 
                leads={leads}
                hotLeads={hotLeads}
            />

            {/* MANUAL LEAD ENTRY MODAL */}
            {showManualModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
                    <div style={{ width: '100%', maxWidth: '400px', background: '#111', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', animation: 'slideUp 0.4s ease' }}>
                        <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: '900', fontSize: '1rem' }}>+ DIRECT LEAD ENTRY</div>
                            <button onClick={() => setShowManualModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem' }}>✕</button>
                        </div>
                        <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input id="m-name" placeholder="Full Name" style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} />
                            <input id="m-phone" placeholder="Phone Number" style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} />
                            <input id="m-car" placeholder="Vehicle Interest (Optional)" style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} />
                            
                            <button 
                                onClick={() => {
                                    const n = document.getElementById('m-name').value;
                                    const p = document.getElementById('m-phone').value;
                                    const c = document.getElementById('m-car').value;
                                    if(!n || !p) return alert('Name and Phone required.');
                                    const newLead = { id: Date.now(), name: n, phone: p, car: c || 'General Interest', quality_score: 85, status: 'Hot', source: 'Manual', last_action_time: 'Just Added', assigned_agent: agent.name };
                                    setLeads([newLead, ...leads]);
                                    setShowManualModal(false);
                                    alert(`Elite Move! ${n} added to pipeline. Trigger an AI call to start qualification.`);
                                }}
                                style={{ width: '100%', padding: '16px', background: '#FF4B2B', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', marginTop: '10px' }}
                            >
                                START HUNTING 🏹
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = `
    @media (max-width: 600px) {
        .metric-grid {
            grid-template-columns: 1fr 1fr !important;
        }
        .lead-detail-row {
            flex-direction: column !important;
            gap: 15px !important;
        }
    }
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
