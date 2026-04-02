import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Phone, TrendingUp, Users, Clock, Star, ChevronRight, Upload } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

const AGENT_PROFILE = {
    name: 'R-Jay Velasquez',
    role: 'Senior Sales Consultant',
    avatar: 'RJ',
    color: '#D92027'
};

export default function AgentDashboard() {
    const { tenant } = useTenant();
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('leads');
    const [nudging, setNudging] = useState(null);

    const fetchLeads = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/leads`, { headers: { 'x-tenant-id': tenant?.id || 'filcan' } });
            const data = await res.json();
            setLeads(data.leads || data || []);
        } catch {
            setLeads([
                { id: 1, name: 'Jan Marc Santos', car: '2024 VW Atlas', quality_score: 92, status: 'Hot', source: 'CRM', last_action_time: '2 hrs ago', follow_up_streak: 3 },
                { id: 2, name: 'Leo Valdez', car: '2023 Honda CR-V', quality_score: 98, status: 'Hot', source: 'Facebook', last_action_time: '30 min ago', follow_up_streak: 5 },
                { id: 3, name: 'Maria Cruz', car: '2022 Toyota RAV4', quality_score: 85, status: 'Warm', source: 'Google Ads', last_action_time: '1 hr ago', follow_up_streak: 2 },
                { id: 4, name: 'Piper McLean', car: '2024 Mazda CX-5', quality_score: 78, status: 'Warm', source: 'Website', last_action_time: '3 hrs ago', follow_up_streak: 1 },
                { id: 5, name: 'Jason Grace', car: '2023 Ford F-150', quality_score: 95, status: 'Hot', source: 'CRM', last_action_time: '15 min ago', follow_up_streak: 4 }
            ]);
        }
        setLoading(false);
    }, [apiUrl, tenant?.id]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleNudge = (leadId) => {
        setNudging(leadId);
        setTimeout(() => {
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, follow_up_streak: (l.follow_up_streak || 0) + 1, last_action_time: 'Just now' } : l));
            setNudging(null);
        }, 1500);
    };

    const hotLeads = leads.filter(l => l.quality_score >= 80);
    const warmLeads = leads.filter(l => l.quality_score >= 50 && l.quality_score < 80);
    const totalFollowUps = leads.reduce((s, l) => s + (l.follow_up_streak || 0), 0);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⚡</div>
                    <div style={{ fontWeight: 'bold' }}>Loading your leads...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)', color: 'white', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Header */}
            <div style={{ padding: '20px 5%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: `linear-gradient(135deg, ${AGENT_PROFILE.color}, ${AGENT_PROFILE.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>{AGENT_PROFILE.avatar}</div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{AGENT_PROFILE.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{AGENT_PROFILE.role} • {tenant?.name || 'FilCan Cars'}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00b894', boxShadow: '0 0 8px #00b894' }} />
                        <span style={{ fontSize: '0.7rem', color: '#00b894' }}>ELLIOT ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '20px 5%' }}>
                {[
                    { icon: <Users size={18} />, label: 'My Leads', value: leads.length, color: '#6c5ce7' },
                    { icon: <Star size={18} />, label: 'Hot Leads', value: hotLeads.length, color: '#D92027' },
                    { icon: <Zap size={18} />, label: 'AI Follow-Ups', value: totalFollowUps, color: '#fdcb6e' },
                    { icon: <TrendingUp size={18} />, label: 'Close Rate', value: '34%', color: '#00b894' }
                ].map((stat, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ color: stat.color, marginBottom: '8px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '5px', padding: '0 5%', marginBottom: '20px' }}>
                {['leads', 'import'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveView(tab)}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px',
                            background: activeView === tab ? 'rgba(217,32,39,0.2)' : 'rgba(255,255,255,0.03)',
                            color: activeView === tab ? '#D92027' : 'rgba(255,255,255,0.4)',
                            border: activeView === tab ? '1px solid rgba(217,32,39,0.3)' : '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        {tab === 'leads' ? '🎯 My Leads' : '📥 Import'}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div style={{ padding: '0 5%', paddingBottom: '40px' }}>
                {activeView === 'leads' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Hot Leads Section */}
                        {hotLeads.length > 0 && (
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#D92027', marginBottom: '12px', letterSpacing: '2px' }}>🔥 READY TO CLOSE ({hotLeads.length})</div>
                                {hotLeads.map(lead => (
                                    <div key={lead.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '18px', marginBottom: '10px', border: '1px solid rgba(217,32,39,0.15)', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(217,32,39,0.15)', color: '#D92027', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem' }}>{lead.name.charAt(0)}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{lead.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{lead.car || 'Interested'} • {lead.source}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                                    <span style={{ fontSize: '0.65rem', background: 'rgba(0,184,148,0.15)', color: '#00b894', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>SCORE: {lead.quality_score}%</span>
                                                    <span style={{ fontSize: '0.65rem', background: 'rgba(253,203,110,0.15)', color: '#fdcb6e', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                                                        <Clock size={10} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{lead.last_action_time}
                                                    </span>
                                                    {lead.follow_up_streak > 0 && (
                                                        <span style={{ fontSize: '0.65rem', background: 'rgba(108,92,231,0.15)', color: '#a29bfe', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>⚡ {lead.follow_up_streak}x nudged</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    title="AI Auto-Nudge: Elliot sends a follow-up text"
                                                    onClick={() => handleNudge(lead.id)}
                                                    disabled={nudging === lead.id}
                                                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: nudging === lead.id ? 'rgba(255,255,255,0.05)' : 'rgba(108,92,231,0.15)', border: 'none', color: '#a29bfe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Zap size={18} />
                                                </button>
                                                <button
                                                    title="Call this lead"
                                                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,184,148,0.15)', border: 'none', color: '#00b894', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Phone size={18} />
                                                </button>
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
                                            <button
                                                onClick={() => handleNudge(lead.id)}
                                                disabled={nudging === lead.id}
                                                style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(253,203,110,0.1)', border: 'none', color: '#fdcb6e', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Zap size={14} /> NUDGE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'import' && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '30px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                        <Upload size={40} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '15px' }} />
                        <h3 style={{ margin: '0 0 10px', fontWeight: '800' }}>Import Your Leads</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '25px' }}>Upload your DealerSocket or CRM export and let Elliot start working them.</p>
                        <button
                            onClick={() => alert('CRM Import triggered! Elliot will begin qualifying your imported leads.')}
                            style={{ padding: '15px 35px', background: 'linear-gradient(135deg, #D92027, #a01820)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 8px 25px rgba(217,32,39,0.3)' }}
                        >
                            📥 SYNC FROM DEALERSOCKET
                        </button>
                        <div style={{ marginTop: '20px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>Supports: .xlsx, .csv (Revenue Radar format)</div>
                    </div>
                )}
            </div>

            {/* Bottom Bar */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 5%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00b894' }} />
                    Elliot is monitoring {leads.length} leads • Last sync: Just now
                </div>
            </div>
        </div>
    );
}
