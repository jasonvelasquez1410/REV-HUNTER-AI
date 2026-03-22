import React, { useState } from 'react';
import ChatWidget from '../components/ChatWidget';

const FacebookDemo = () => {
    const [messages] = useState([
        { id: 1, user: "FilCan Cars", text: "New arrival! 2024 VW Atlas. Financing available for all credit levels! #FCC", time: "2h ago", isPost: true },
        { id: 2, user: "John Doe", text: "How much is this per month?", time: "1h ago" },
        { id: 3, user: "FilCan AI Hunter", text: "Hi John! 👋 Our AI Receptionist is ready to help. I'll send you a private message to get you the lowest possible rate!", time: "59m ago", isAI: true }
    ]);

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
            {/* FB Header */}
            <div style={{ backgroundColor: '#fff', padding: '10px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ backgroundImage: 'linear-gradient(#1877f2, #0056b3)', width: '40px', height: '40px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>f</div>
                    <input type="text" placeholder="Search Facebook" style={{ backgroundColor: '#f0f2f5', border: 'none', padding: '10px 20px', borderRadius: '20px', width: '250px' }} />
                </div>
                <div style={{ display: 'flex', gap: '20px', color: '#65676b' }}>
                    <span>Home</span>
                    <span>Videos</span>
                    <span>Marketplace</span>
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
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '2rem' }}>FCC</div>
                    </div>
                    <div style={{ marginLeft: '200px', paddingTop: '15px' }}>
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>FilCan Cars Sherwood Park</h1>
                        <span style={{ color: '#65676b', fontWeight: '600' }}>3.2K followers • 12 following</span>
                    </div>
                </div>
            </div>

            {/* FB Feed Content */}
            <div style={{ maxWidth: '940px', margin: '20px auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                <aside>
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0 }}>Intro</h3>
                        <p>📍 983 Fir St, Sherwood Park, AB</p>
                        <p>📞 587.860.1770</p>
                        <p>🌐 filcancars.ca</p>
                    </div>
                </aside>
                <main>
                    {/* Simulated Post */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>FCC</div>
                            <div>
                                <div style={{ fontWeight: '600' }}>FilCan Cars Sherwood Park</div>
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
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: m.isAI ? '#D92027' : '#ced4da', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold' }}>{m.user.charAt(0)}</div>
                                    <div style={{ backgroundColor: '#f0f2f5', padding: '8px 12px', borderRadius: '18px', position: 'relative' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{m.user} {m.isAI && <span style={{ color: '#1877f2', fontSize: '0.7rem' }}>✔ Hunter Agent</span>}</div>
                                        <div style={{ fontSize: '0.9rem' }}>{m.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Messenger Integration Overlay */}
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <ChatWidget defaultOpen={false} placeholder="Message FilCan AI Hunter..." />
                <div style={{ 
                    position: 'absolute', top: '-10px', left: '-10px', backgroundColor: '#D92027', 
                    color: 'white', padding: '4px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                    1 NEW MESSAGE
                </div>
            </div>
        </div>
    );
};

export default FacebookDemo;
