import React, { useState, useEffect, useRef } from 'react';
import VapiNamed from '@vapi-ai/web';
import VapiDefault from '@vapi-ai/web';
import ChatWidget from '../components/ChatWidget';
import { useTenant } from '../context/TenantContext';

// Presentation Keys (Shared across the platform for the demo)
const VAPI_PUBLIC_KEY = '012fbe2f-192f-44f3-a1b3-76db83ce299c';
const VAPI_ASSISTANT_ID = '5921ac52-3ea4-443f-a531-993b5e43fddf';

const FacebookDemo = () => {
    const { tenant } = useTenant();
    const [isCalling, setIsCalling] = useState(false);
    const vapi = useRef(null);

    useEffect(() => {
        try {
            // Robust constructor resolution for Vapi Web SDK v2.x
            const VapiBase = VapiNamed || VapiDefault;
            let constructor = null;
            if (typeof VapiBase === 'function') {
                constructor = VapiBase;
            } else if (VapiBase?.default && typeof VapiBase.default === 'function') {
                constructor = VapiBase.default;
            } else if (VapiBase && typeof VapiBase === 'object') {
                const found = Object.values(VapiBase).find(v => typeof v === 'function');
                if (found) constructor = found;
            }

            if (constructor) {
                vapi.current = new constructor(VAPI_PUBLIC_KEY);
                vapi.current.on('call-start', () => setIsCalling(true));
                vapi.current.on('call-end', () => setIsCalling(false));
                vapi.current.on('error', (e) => {
                    console.error('Vapi SDK Error:', e);
                    setIsCalling(false);
                    // Use a generic alert or state if needed, but keeping console log for diagnostics
                });
            }
        } catch (err) {
            console.error("Vapi Init Error:", err);
        }
    }, []);

    const initials = tenant.name.split(' ').map(w => w[0]).join('');

    const [messages] = useState([
        { id: 1, user: tenant.name, text: `New arrival! 2024 VW Atlas. Financing available for all credit levels! #${initials}`, time: "2h ago", isPost: true },
        { id: 2, user: "John Doe", text: "How much is this per month?", time: "1h ago" },
        { id: 3, user: `FilCan Digital Specialist`, text: `Hi John! 👋 I'm the Digital Sales Specialist for ${tenant.name}. I'll send you a private message to get you the lowest possible rate!`, time: "59m ago", isAI: true }
    ]);

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
            {/* FB Header */}
            <div style={{ backgroundColor: '#fff', padding: '10px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ backgroundImage: 'linear-gradient(#1877f2, #0056b3)', width: '40px', height: '40px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>f</div>
                    <input type="text" placeholder="Search Facebook" style={{ backgroundColor: '#f0f2f5', border: 'none', padding: '10px 20px', borderRadius: '20px', width: '250px' }} />
                </div>
            </div>

            {/* FB Profile Cover */}
            <div style={{ maxWidth: '940px', margin: '0 auto', backgroundColor: '#fff', overflow: 'hidden', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                <div style={{ height: '350px', backgroundColor: '#ddd', backgroundImage: 'url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80")', backgroundSize: 'cover' }}></div>
                <div style={{ padding: '0 50px 30px', position: 'relative' }}>
                    <div style={{ 
                        width: '180px', height: '180px', borderRadius: '50%', backgroundColor: '#fff', padding: '5px', 
                        position: 'absolute', top: '-90px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
                    }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '2rem' }}>
                            {initials}
                        </div>
                    </div>
                    <div style={{ marginLeft: '200px', paddingTop: '15px' }}>
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>{tenant.name} {tenant.location}</h1>
                        <span style={{ color: '#65676b', fontWeight: '600' }}>3.2K followers • 12 following</span>
                    </div>
                </div>
            </div>

            {/* FB Feed Content */}
            <div style={{ maxWidth: '940px', margin: '20px auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                <aside>
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0 }}>Intro</h3>
                        <p>📍 {tenant.address}, {tenant.location}</p>
                        <p>📞 587.860.1770</p>
                        <p>🌐 {tenant.name.toLowerCase().replace(/\s/g, '')}.ca</p>
                    </div>
                </aside>
                <main>
                    {/* Simulated Post */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{initials}</div>
                            <div>
                                <div style={{ fontWeight: '600' }}>{tenant.name} {tenant.location}</div>
                                <div style={{ fontSize: '0.8rem', color: '#65676b' }}>2 hours ago • 🌎</div>
                            </div>
                        </div>
                        <div style={{ padding: '0 15px 15px' }}>
                            Fresh inventory alert! 🚨 This 2024 VW Atlas is waiting for its new home. DM us to see how easy it is to drive this home today!
                        </div>
                        <img src="https://images.unsplash.com/photo-1594976612316-401266a4cc44?auto=format&fit=crop&w=800&q=80" alt="post" style={{ width: '100%' }} />
                        
                        {/* Comments with the Hunter */}
                        <div style={{ padding: '15px', borderTop: '1px solid #f0f2f5' }}>
                            {messages.filter(m => !m.isPost).map(m => (
                                <div key={m.id} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <div style={{ 
                                        width: '32px', height: '32px', borderRadius: '50%', 
                                        backgroundColor: m.isAI ? tenant.theme_color || '#D92027' : '#ced4da', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold' 
                                    }}>{m.user.charAt(0)}</div>
                                    <div style={{ backgroundColor: '#f0f2f5', padding: '8px 12px', borderRadius: '18px', position: 'relative' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{m.user} {m.isAI && <span style={{ color: '#1877f2', fontSize: '0.7rem' }}>✔ Digital Specialist</span>}</div>
                                        <div style={{ fontSize: '0.9rem' }}>{m.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Floating AI Call Button (Simulated for FB) */}
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 2000 }}>
                <button 
                    onClick={async () => {
                        if (isCalling) {
                            vapi.current.stop();
                        } else {
                            // MOBILE/PWA OPTIMIZATION: Explicitly resume audio context on user gesture
                            if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
                                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                                const context = new AudioCtx();
                                if (context.state === 'suspended') {
                                    await context.resume();
                                }
                            }

                            if (!window.isSecureContext) {
                                alert("Voice calls require a secure connection (HTTPS).");
                                return;
                            }

                            vapi.current.start(VAPI_ASSISTANT_ID, {
                                firstMessage: "Hi! This is Elliot, the Digital Sales Specialist for FilCan Cars. I saw you were looking at our Facebook post. How can I help you today?",
                                 transcriber: {
                                    provider: "deepgram",
                                    model: "nova-2",
                                    language: "multi",
                                    smartFormat: true
                                },
                                model: {
                                    provider: "openai",
                                    model: "gpt-4o",
                                    messages: [
                                        {
                                            role: "system",
                                            content: `You are Elliot, the Digital Sales Specialist for FilCan Cars. 
                                            NATURAL MODE: ALWAYS be conversational. NEVER mention step numbers or step names (e.g., Do NOT say 'Step 1' or 'Discovery').
                                            STRICT ENGLISH-ONLY RULE: You must communicate EXCLUSIVELY in English. Use a professional, friendly, and relentless dealership tone. 
                                            RELELENTLESS SALES PERSONA: You MUST lead the customer through our proven 9-Step Sales Process (Greeting, Discovery, Lifestyle, Must-Haves, Current Car, Trade-in, Finance, Inventory Match, Booking).`
                                        }
                                    ]
                                }
                            });
                        }
                    }}
                    style={{ 
                        width: '60px', height: '60px', borderRadius: '50%', 
                        background: isCalling ? '#fa3e3e' : '#1877f2', 
                        color: 'white', border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', transition: 'all 0.3s',
                        animation: isCalling ? 'pulse-red-fb 1.5s infinite' : 'none'
                    }}
                    title={isCalling ? "End Call" : "Call Specialist"}
                >
                    {isCalling ? '🛑' : '📞'}
                </button>
                {!isCalling && (
                    <div style={{
                        position: 'absolute', right: '70px', top: '15px', 
                        background: 'white', padding: '5px 15px', borderRadius: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', whiteSpace: 'nowrap',
                        fontSize: '0.8rem', fontWeight: 'bold', color: '#333'
                    }}>
                        Call Elliot 🌟
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse-red-fb {
                    0% { box-shadow: 0 0 0 0 rgba(250, 62, 62, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(250, 62, 62, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(250, 62, 62, 0); }
                }
            `}</style>

            {/* Messenger Integration Overlay - Hidden to prioritize Voice Call Demo */}
            {/* <ChatWidget defaultOpen={false} placeholder={`Message ${tenant.name} AI Hunter...`} /> */}
        </div>
    );
};

export default FacebookDemo;
