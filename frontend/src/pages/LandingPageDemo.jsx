import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import ChatWidget from '../components/ChatWidget';
import { useTenant } from '../context/TenantContext';

// Presentation Keys (Shared across the platform for the demo)
const VAPI_PUBLIC_KEY = '012fbe2f-192f-44f3-a1b3-76db83ce299c';
const VAPI_ASSISTANT_ID = '5921ac52-3ea4-443f-a531-993b5e43fddf';

const LandingPageDemo = () => {
    const { tenant } = useTenant();
    const [cars, setCars] = useState([]);
    const [showNudge, setShowNudge] = useState(true);
    const [nudgeStep, setNudgeStep] = useState('initial'); 
    const [isCalling, setIsCalling] = useState(false);
    const [vin, setVin] = useState('');
    const [creditRange, setCreditRange] = useState('');
    const vapi = useRef(null);

    useEffect(() => {
        try {
            // Robust constructor resolution for Vapi Web SDK v2.x
            let constructor = null;
            if (typeof Vapi === 'function') {
                constructor = Vapi;
            } else if (Vapi?.default && typeof Vapi.default === 'function') {
                constructor = Vapi.default;
            } else if (Vapi && typeof Vapi === 'object') {
                const found = Object.values(Vapi).find(v => typeof v === 'function');
                if (found) constructor = found;
            }

            if (constructor) {
                vapi.current = new constructor(VAPI_PUBLIC_KEY);
                
                vapi.current.on('call-start', () => setIsCalling(true));
                vapi.current.on('call-end', () => setIsCalling(false));
                vapi.current.on('error', (e) => {
                    console.error('Vapi SDK Error:', e);
                    setVapiError && setVapiError(e.message || "Vapi Error: Check Secure Context/API Key");
                    setIsCalling(false);
                });
            }
        } catch (err) {
            console.error("Vapi Init Error:", err);
        }

        const fetchCars = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || '/api';
                const response = await fetch(`${apiUrl}/inventory`, {
                    headers: { 'X-Tenant-Id': tenant.id }
                });
                const data = await response.json();
                setCars(data);
            } catch (error) {
                console.error("Failed to fetch cars:", error);
            }
        };
        if (tenant) fetchCars();
    }, [tenant]);

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <header style={{ 
                backgroundColor: '#000', 
                color: '#fff', 
                padding: '15px 5%', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '5px', borderRadius: '4px' }}>
                        <span style={{ color: tenant.theme_color || '#D92027', fontWeight: '900', fontSize: '1.2rem' }}>
                            {tenant.name.split(' ').map(w => w[0]).join('')}
                        </span>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{tenant.name.toUpperCase()}</div>
                        <div style={{ fontSize: '0.6rem', color: '#aaa' }}>POWERED BY REVHUNTER AI</div>
                    </div>
                </div>
                <nav style={{ display: 'flex', gap: '25px', fontSize: '0.9rem', fontWeight: '600' }}>
                    <span>INVENTORY</span>
                    <span>FINANCING</span>
                    <span>TRADE-IN</span>
                    <span>ABOUT</span>
                </nav>
                <div style={{ color: tenant.theme_color || '#D92027', fontWeight: 'bold' }}>587.860.1770</div>
            </header>

            {/* Hero Section */}
            <section style={{ 
                height: '500px', 
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.themes.mazda.ca/2024/02/05/1707153401763_2024-mazda-cx-5-hero-mobile.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center'
            }}>
                <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px' }}>YOUR DRIVE, REIMAGINED.</h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '30px' }}>Premium pre-owned vehicles in {tenant.location}. Approved financing for every credit level.</p>
                <button style={{ 
                    backgroundColor: tenant.theme_color || '#D92027', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '15px 40px', 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>SEARCH INVENTORY</button>
            </section>

            {/* Content & Inventory */}
            <div className="main-content-section" style={{ padding: '40px 5%', display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                {/* Search Bar & Filters */}
                <aside className="search-aside" style={{ flex: '0 0 250px' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '15px', borderLeft: `4px solid ${tenant.theme_color || '#D92027'}`, paddingLeft: '10px' }}>SEARCH</h3>
                        <input type="text" placeholder="Year, Make, Model..." style={{ width: '100%', padding: '10px', border: '1px solid #ddd' }} />
                    </div>
                </aside>

                {/* Grid */}
                <main style={{ flex: '1 1 500px', minWidth: '0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                        {cars.map(car => (
                            <div key={car.id} style={{ border: '1px solid #eee', transition: 'box-shadow 0.3s' }} className="car-card">
                                <img src={car.image} alt={car.model} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                <div style={{ padding: '20px' }}>
                                    <div style={{ fontSize: '0.8rem', color: tenant.theme_color || '#D92027', fontWeight: 'bold' }}>{car.year}</div>
                                    <h3 style={{ margin: '5px 0', fontSize: '1.2rem' }}>{car.make} {car.model}</h3>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '900', margin: '15px 0' }}>${car.price.toLocaleString()}</div>
                                    <button style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold' }}>VIEW DETAILS</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Floating AI Call Button */}
            <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 2000 }}>
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
                                firstMessage: "Hi! This is Elliot, the Digital Sales Specialist for FilCan Cars. I saw you were looking at our inventory. How can I help you today?",
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
                        background: isCalling ? '#D92027' : '#00b894', 
                        color: 'white', border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', transition: 'all 0.3s',
                        animation: isCalling ? 'pulse-red 1.5s infinite' : 'none'
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
                        Speak with Elliot 🌟
                    </div>
                )}
            </div>

            {/* Smart VDP Nudge Simulation */}
            {showNudge && (
                <div style={{ position: 'fixed', left: '20px', bottom: '100px', maxWidth: '320px', background: '#fff', borderRadius: '15px', padding: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', borderLeft: `5px solid ${tenant.theme_color || '#D92027'}`, zIndex: 1500 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: tenant.theme_color || '#D92027' }}>ELLIOT (PREMIUM QUALIFIER) 🤖</div>
                        <button onClick={() => setShowNudge(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>✕</button>
                    </div>
                    
                    {nudgeStep === 'initial' && (
                        <>
                            <div style={{ fontSize: '0.85rem', color: '#333', lineHeight: '1.4' }}>
                                Want a <b>"Fast-Pass"</b> trade-in value for your car while you browse? Our AI uses <b>vAuto</b> to give you a real number in seconds.
                            </div>
                            <div style={{ marginTop: '12px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Enter VIN (Optional)" 
                                    value={vin}
                                    onChange={(e) => setVin(e.target.value)}
                                    style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.8rem' }}
                                />
                                <button 
                                    onClick={() => setNudgeStep('credit')}
                                    style={{ width: '100%', padding: '10px', background: tenant.theme_color || '#D92027', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    GET APPRAISAL
                                </button>
                            </div>
                        </>
                    )}

                    {nudgeStep === 'credit' && (
                        <>
                            <div style={{ fontSize: '0.85rem', color: '#333', marginBottom: '10px' }}>
                                To match you with the best bank, what is your estimated credit score?
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {[
                                    { l: 'Excellent (740+)', v: '740' },
                                    { l: 'Good (680-739)', v: '700' },
                                    { l: 'Fair (580-679)', v: '600' },
                                    { l: 'Need Help', v: 'rebuild' }
                                ].map(r => (
                                    <button 
                                        key={r.v}
                                        onClick={() => {
                                            setCreditRange(r.l);
                                            setNudgeStep('loading');
                                            setTimeout(() => setNudgeStep('result'), 2500);
                                        }}
                                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px', background: '#fff', fontSize: '0.65rem', cursor: 'pointer' }}
                                    >
                                        {r.l}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {nudgeStep === 'loading' && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ width: '30px', height: '30px', border: `3px solid ${tenant.theme_color || '#D92027'}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>AI is checking vAuto & DealerTrack...</div>
                        </div>
                    )}

                    {nudgeStep === 'result' && (
                        <>
                            <div style={{ fontSize: '0.85rem', color: '#333', lineHeight: '1.4' }}>
                                ✅ **Qualification Success!**
                                <br/><br/>
                                📊 vAuto Appraisal: **$${vin ? '23,450' : '21,100'}**
                                <br/>
                                🏦 Credit Tier: **{creditRange}**
                                <br/><br/>
                                Should I sync this "Lead DNA" to the Sales Manager?
                            </div>
                            <button 
                                onClick={() => {
                                    setShowNudge(false);
                                    alert("Lead DNA Synced! Agents now see your Credit Score and Trade-in Value.");
                                }}
                                style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#00b894', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                YES, SEND TO CRM
                            </button>
                        </>
                    )}
                </div>
            )}

            <style>{`
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(217,32,39, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(217,32,39, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(217,32,39, 0); }
                }
                @keyframes slideRight {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @media (max-width: 768px) {
                    .hero h1 { font-size: 2.2rem !important; }
                    .main-content-section { flex-direction: column !important; }
                    .search-aside { flex: 1 1 auto !important; width: 100% !important; }
                    header nav { display: none !important; }
                    header { padding: 10px 15px !important; }
                }
            `}</style>

            {/* Omni Hunter Widget - Hidden to prioritize Voice Call Demo as requested */}
            {/* <ChatWidget /> */}
        </div>
    );
};

export default LandingPageDemo;
