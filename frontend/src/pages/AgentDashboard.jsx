import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Phone, TrendingUp, Users, Clock, Star, Upload, Bell, LogOut, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
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

// ── MAIN AGENT DASHBOARD ──────────────────────────
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

            // Check for new leads and trigger notification
            if (leads.length > 0 && newLeads.length > leads.length) {
                const newest = newLeads.find(nl => !leads.some(ol => ol.id === nl.id));
                if (newest) {
                    sendPushNotification(
                        '🔥 New Lead Assigned!',
                        `${newest.name} (Score: ${newest.quality_score || '??'}%) has been assigned to you.`
                    );
                    setNewLeadAlert(newest);
                    setTimeout(() => setNewLeadAlert(null), 5000);
                }
            }
            setLeads(newLeads);
        } catch {
            // Demo fallback: show sample leads assigned to this agent
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

    useEffect(() => {
        if (agent) {
            fetchLeads();
            requestNotificationPermission();
            // Poll for new leads every 30 seconds
            const interval = setInterval(fetchLeads, 30000);
            return () => clearInterval(interval);
        }
    }, [agent, fetchLeads]);

    const handleNudge = (leadId) => {
        setNudging(leadId);
        setTimeout(() => {
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, follow_up_streak: (l.follow_up_streak || 0) + 1, last_action_time: 'Just now' } : l));
            setNudging(null);
        }, 1500);
    };

    // ── RENDER LOGIN IF NOT AUTHENTICATED ─────────
    if (!agent) {
        return <AgentLogin onLogin={handleLogin} />;
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

            {/* Header */}
            <div style={{ padding: '20px 5%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'linear-gradient(135deg, #D92027, #D9202788)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>{agent.avatar || agent.name.charAt(0)}</div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{agent.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{agent.role} • {tenant?.name || 'FilCan Cars'}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00b894', boxShadow: '0 0 8px #00b894' }} />
                            <span style={{ fontSize: '0.65rem', color: '#00b894' }}>ELLIOT LIVE</span>
                        </div>
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
                                                <button title="AI Auto-Nudge" onClick={() => handleNudge(lead.id)} disabled={nudging === lead.id} style={{ width: '40px', height: '40px', borderRadius: '12px', background: nudging === lead.id ? 'rgba(255,255,255,0.05)' : 'rgba(108,92,231,0.15)', border: 'none', color: '#a29bfe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Zap size={18} />
                                                </button>
                                                <a href={lead.phone ? `tel:${lead.phone}` : '#'} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,184,148,0.15)', border: 'none', color: '#00b894', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
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
                                            <button onClick={() => handleNudge(lead.id)} disabled={nudging === lead.id} style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(253,203,110,0.1)', border: 'none', color: '#fdcb6e', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: '0 0 15px' }}>Upload your <strong>Revenue Radar</strong> export or any CSV/Excel file</p>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(217,32,39,0.1)', padding: '10px 20px', borderRadius: '12px', color: '#D92027', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                    <Upload size={16} /> CHOOSE FILE
                                </div>
                                <div style={{ marginTop: '15px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>Supports: .xlsx, .csv • Revenue Radar format auto-detected</div>
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
            </div>

            <style>{`
                @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
            `}</style>
        </div>
    );
}
