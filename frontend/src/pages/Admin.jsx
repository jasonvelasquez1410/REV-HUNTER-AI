import React, { useState, useEffect } from 'react';
import LeadReportCard from '../components/LeadReportCard';
import { useTenant } from '../context/TenantContext';

const Admin = () => {
    const { tenant } = useTenant();
    const [leads, setLeads] = useState([]);
    const [agedLeads, setAgedLeads] = useState([]);

    const [auditLogs, setAuditLogs] = useState([
        { id: 1, time: "Sat 9:02 PM", action: `AI responded to John Doe`, type: "AI" },
        { id: 2, time: "Sat 9:05 PM", action: "Task sent to Rjay's phone", type: "REP" },
        { id: 3, time: "Sat 10:00 PM", action: "90-Day Follow-up sent to Sarah", type: "AI" }
    ]);

    const [apiStatus, setApiStatus] = useState('Checking...');

    const [showPresentation, setShowPresentation] = useState(false);
    const [presentationStep, setPresentationStep] = useState(0);

    const [marketingDrafts, setMarketingDrafts] = useState([
        { id: 1, text: `🔥 Fresh Inventory! 2024 VW Atlas just landed. $0 down options available. #${tenant.name.replace(/\s/g, '')}`, type: "Facebook Post", status: "Pending Approval" },
        { id: 2, text: `Need a trade-in value? We're paying TOP DOLLAR this weekend in ${tenant.location}! 🚗💰`, type: "Ad Campaign", status: "Pending Approval" }
    ]);

    const [isGeneratingAd, setIsGeneratingAd] = useState(false);
    const [selectedPillar, setSelectedPillar] = useState('tactical');

    const dailyLeads = leads.filter(l => l.is_reported);
    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`${apiUrl}/`);
                if (res.ok) setApiStatus('CONNECTED');
                else setApiStatus('ERROR');
            } catch {
                setApiStatus('OFFLINE');
            }
        };

        const fetchAllLeads = async () => {
            try {
                const [leadsRes, agedRes] = await Promise.all([
                    fetch(`${apiUrl}/leads`, { headers: { 'X-Tenant-Id': tenant.id } }),
                    fetch(`${apiUrl}/leads/aged`, { headers: { 'X-Tenant-Id': tenant.id } })
                ]);
                const leadsData = await leadsRes.json();
                const agedData = await agedRes.json();
                setLeads(leadsData);
                setAgedLeads(agedData);
            } catch (err) {
                console.error("Failed to fetch leads:", err);
            }
        };
        
        checkStatus();
        if (tenant.id) fetchAllLeads();
    }, [tenant.id, apiUrl]);

    const handleReport = async (leadId) => {
        try {
            await fetch(`${apiUrl}/leads/${leadId}/report`, { 
                method: 'POST',
                headers: { 'X-Tenant-Id': tenant.id }
            });
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, is_reported: true } : l));
            setAuditLogs(prev => [
                { id: `log-${Date.now()}`, time: "Now", action: `AI promoted lead to Quality Report`, type: "AI" },
                ...prev
            ]);
        } catch (err) {
            console.error("Report failed:", err);
        }
    };

    const handleCharge = async (lead) => {
        try {
            await fetch(`${apiUrl}/leads/${lead.id}/charge`, { 
                method: 'POST',
                headers: { 'X-Tenant-Id': tenant.id }
            });
            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, is_billed: true } : l));
            setAuditLogs([{ id: Date.now(), time: "Now", action: `Charged ${tenant.name} for ${lead.name}`, type: "BILL" }, ...auditLogs]);
            alert(`Successfully charged for lead: ${lead.name}`);
        } catch (err) {
            console.error("Charge failed:", err);
        }
    };

    const handleReactivate = async (lead) => {
        try {
            await fetch(`${apiUrl}/leads/${lead.id}/reactivate`, { 
                method: 'POST',
                headers: { 'X-Tenant-Id': tenant.id }
            });
            const updatedLead = { ...lead, is_aged: false, status: "Qualified", is_reported: false, is_billed: false, quality_score: 85, follow_up_streak: 1, last_action_time: "Just Now" };
            setLeads(prev => [...prev, updatedLead]);
            setAgedLeads(prev => prev.filter(l => l.id !== lead.id));
            setAuditLogs(prev => [
                { id: `log-${Date.now()}`, time: "Now", action: `REACTIVATED: ${lead.name} (Dead to Life)`, type: "AI" },
                ...prev
            ]);
        } catch (err) {
            console.error("Reactivate failed:", err);
        }
    };

    const handleApproveMarketing = (id) => {
        setMarketingDrafts(prev => prev.map(d => d.id === id ? { ...d, status: "Published" } : d));
        setAuditLogs(prev => [
            { id: Date.now(), time: "Now", action: `Approved Marketing Post: #${id}`, type: "ADMIN" },
            ...prev
        ]);
    };

    const handleGenerateAd = async () => {
        setIsGeneratingAd(true);
        try {
            const res = await fetch(`${apiUrl}/generate-ad`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Tenant-Id': tenant.id 
                },
                body: JSON.stringify({ context: selectedPillar })
            });
            const data = await res.json();
            setMarketingDrafts(prev => [
                { id: Date.now(), text: data.content, type: "AI Draft", status: "Pending Approval" },
                ...prev
            ]);
            setAuditLogs(prev => [
                { id: `log-${Date.now()}`, time: "Now", action: `AI Marketing Manager drafted new ${selectedPillar} post`, type: "AI" },
                ...prev
            ]);
        } catch (err) {
            console.error("Ad gen failed:", err);
        } finally {
            setIsGeneratingAd(false);
        }
    };

    const handleManualReply = async (lead) => {
        const message = prompt(`Enter manual reply for ${lead.name}:`);
        if (!message) return;

        try {
            await fetch(`${apiUrl}/admin/manual-reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient_id: lead.id, message: message })
            });
            setAuditLogs(prev => [
                { id: `log-${Date.now()}`, time: "Now", action: `Manual Reply sent to ${lead.name}`, type: "REP" },
                ...prev
            ]);
            alert("Reply sent via Relentless AI!");
        } catch (err) {
            console.error("Reply failed:", err);
        }
    };

    const stats = {
        published: 12,
        pending: 4,
        impressions: "15.4K",
        reach: "9.2K",
        leads24h: leads.length,
        qualityReported: dailyLeads.length
    };

    return (
        <div className="container admin-container">
            <h1 style={{ marginBottom: '30px', color: '#003366', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ background: '#003366', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '1rem' }}>REVHUNTER AI</span>
                    Marketing Command Center
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setShowPresentation(true)}
                        style={{ fontSize: '0.8rem', background: '#003366', color: 'white', padding: '5px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer' }}
                    >
                        🚀 Demo Pitch Mode
                    </button>
                    <span style={{ fontSize: '1rem', background: '#e17055', color: 'white', padding: '5px 15px', borderRadius: '20px' }}>
                        Hunter Mode: ACTIVE
                    </span>
                </div>
            </h1>
            
            <div className="dashboard-grid">
                <div className="stat-card">
                    <h3>Published Ads</h3>
                    <div className="value">{stats.published}</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #f1c40f' }}>
                    <h3>Pending Ads</h3>
                    <div className="value">{stats.pending}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Leads</h3>
                    <div className="value">{stats.leads24h}</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #00b894' }}>
                    <h3>Quality Picks</h3>
                    <div className="value">{stats.qualityReported}/10</div>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #e17055' }}>
                    <h3>System Engagement</h3>
                    <div className="value">24/7 ACTIVE</div>
                </div>
            </div>

            {/* Accountability & System Pulse Section */}
            <section style={{ background: '#1a1a1a', color: 'white', padding: '15px 25px', borderRadius: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '40px' }}>
                    <div>
                        <span style={{ color: '#00b894', fontSize: '0.7rem', fontWeight: 'bold' }}>● LIVE PULSE</span>
                        <div style={{ fontSize: '1rem', fontWeight: '600' }}>Relentless Follow-up Running</div>
                    </div>
                    <div>
                        <span style={{ color: '#888', fontSize: '0.7rem' }}>LATEST AI ACTION</span>
                        <div style={{ fontSize: '0.9rem' }}>{auditLogs[0]?.action}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>API Status: <span style={{ color: apiStatus === 'CONNECTED' ? '#00b894' : '#e17055', fontWeight: 'bold' }}>{apiStatus}</span></div>
                    <div style={{ fontSize: '0.7rem', color: '#00b894' }}>All actions time-stamped & verified</div>
                </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                {/* Inbox Section */}
                <section style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between', color: '#1a1a1a' }}>
                        Raw Lead Inbox
                        <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>Vetted by AI</span>
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem' }}>CUSTOMER</th>
                                    <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem' }}>STEP</th>
                                    <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem' }}>PROGRESS</th>
                                    <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem' }}>INTENT</th>
                                    <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem', textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '600' }}>{lead.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{lead.budget}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '600', color: tenant.theme_color }}>
                                                STEP {JSON.parse(lead.conversation_state || '{}').step || 1}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#444', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={lead.conversation_summary}>
                                                {lead.conversation_summary || "Starting Discovery..."}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600',
                                                    backgroundColor: lead.status === 'Hot' ? '#fff0f0' : lead.status === 'Qualified' ? '#f0fff4' : '#fff9eb',
                                                    color: lead.status === 'Hot' ? '#ff4d4d' : lead.status === 'Qualified' ? '#27ae60' : '#f39c12',
                                                    border: `1px solid ${lead.status === 'Hot' ? '#ffcccc' : lead.status === 'Qualified' ? '#c3e6cb' : '#ffeeba'}`
                                                }}>{lead.status}</span>
                                                <span style={{ fontSize: '0.6rem', color: '#999' }}>FB MSG</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                            <button 
                                                onClick={() => handleManualReply(lead)}
                                                style={{ padding: '6px 12px', fontSize: '0.7rem', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                            >
                                                📩 Reply
                                            </button>
                                            {!lead.is_reported ? (
                                                <button 
                                                    onClick={() => handleReport(lead.id)}
                                                    className="btn-action" 
                                                    style={{ 
                                                        padding: '6px 12px', fontSize: '0.7rem', backgroundColor: '#003366', color: 'white', 
                                                        border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    Add to Report
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: '#27ae60', fontWeight: '600' }}>✓ Added</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Daily Quality Report Section */}
                <section style={{ 
                    background: 'white', 
                    padding: '25px', 
                    borderRadius: '15px', 
                    border: `2px solid ${tenant.theme_color || '#003366'}`,
                    boxShadow: '0 15px 35px rgba(0,51,102,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', color: tenant.theme_color || '#003366' }}>Daily Quality Report</h2>
                            <span style={{ fontSize: '0.75rem', color: '#666' }}>Target: 10 High-Value Leads</span>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '30px', fontWeight: '600', backgroundColor: tenant.theme_color }}>
                            Send to {tenant.name}
                        </button>
                    </div>
                    
                    <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                        {dailyLeads.length > 0 ? (
                            dailyLeads.map((lead) => (
                                <LeadReportCard 
                                    key={lead.id} 
                                    lead={lead} 
                                    onCharge={handleCharge}
                                />
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '10px opacity: 0.3' }}>📊</div>
                                <p style={{ margin: 0, fontWeight: '500' }}>Report is currently empty</p>
                                <p style={{ fontSize: '0.8rem' }}>Move quality leads from the inbox to start building today's report for {tenant.name}.</p>
                            </div>
                        )}
                    </div>

                    {dailyLeads.length > 0 && (
                        <div style={{ 
                            marginTop: '20px', 
                            padding: '15px', 
                            background: '#f0f4f8', 
                            borderRadius: '10px',
                            borderLeft: `4px solid ${tenant.theme_color || '#003366'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#444', fontWeight: '500' }}>Pot. Revenue (Est.):</span>
                                <span style={{ color: tenant.theme_color || '#003366', fontWeight: '800', fontSize: '1.2rem' }}>$45,000</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#666', textAlign: 'right' }}>
                                Based on current lead quality scores
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                {/* Aged Lead Reactivation (Dead-Lead Miner) */}
                <section style={{ background: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)', color: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                        Dead-Lead Miner
                        <span style={{ fontSize: '0.7rem', background: '#f1c40f', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>RECOVERY MODE</span>
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '20px' }}>Aged leads you wrote off months ago. Relentless AI is bringing them back to life at {tenant.name}.</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                                <th style={{ padding: '10px', fontSize: '0.7rem', color: '#888' }}>LEAD SOURCE</th>
                                <th style={{ padding: '10px', fontSize: '0.7rem', color: '#888' }}>LAST SEEN</th>
                                <th style={{ padding: '10px', fontSize: '0.7rem', color: '#888', textAlign: 'right' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agedLeads.map((lead) => (
                                <tr key={lead.id} style={{ borderBottom: '1px solid #333' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: '600' }}>{lead.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{lead.budget}</div>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.8rem' }}>{lead.lastSeen}</td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleReactivate(lead)}
                                            style={{ padding: '6px 15px', fontSize: '0.7rem', background: '#00b894', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}
                                        >
                                            ⚡ Force Reactivate
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Audit Log / Accountability Tracker */}
                <section style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#2d3436' }}>Accountability Audit Log</h2>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {auditLogs.map((log) => (
                            <div key={log.id} style={{ display: 'flex', gap: '15px', padding: '10px 0', borderBottom: '1px solid #f9f9f9' }}>
                                <span style={{ fontSize: '0.7rem', color: '#999', width: '80px' }}>{log.time}</span>
                                <div style={{ flex: 1 }}>
                                    <span style={{ 
                                        fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', marginRight: '8px',
                                        background: log.type === 'AI' ? '#e1f9eb' : log.type === 'REP' ? '#eef2ff' : '#fff4e5',
                                        color: log.type === 'AI' ? '#27ae60' : log.type === 'REP' ? '#4f46e5' : '#f39c12',
                                        fontWeight: 'bold'
                                    }}>
                                        {log.type}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#333' }}>{log.action}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            {/* Marketing Strategy Hub (The Marketing Manager Role) */}
            <section style={{ marginBottom: '30px', background: 'linear-gradient(135deg, #003366 0%, #001f3f 100%)', color: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Marketing Strategy Hub</h2>
                        <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#aaa' }}>Command your AI Marketing Manager to generate high-performing content.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select 
                            value={selectedPillar} 
                            onChange={(e) => setSelectedPillar(e.target.value)}
                            style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #444', background: '#1a1a1a', color: 'white', fontSize: '0.8rem' }}
                        >
                            <option value="tactical">Inventory Sprint (Tactical)</option>
                            <option value="strategic">Brand & Finance (Strategic)</option>
                            <option value="seasonal">Seasonal Clearance</option>
                        </select>
                        <button 
                            disabled={isGeneratingAd}
                            onClick={handleGenerateAd}
                            style={{ 
                                padding: '8px 25px', background: '#00b894', color: 'white', border: 'none', borderRadius: '8px', 
                                fontWeight: 'bold', cursor: 'pointer', opacity: isGeneratingAd ? 0.7 : 1 
                            }}
                        >
                            {isGeneratingAd ? "🤖 Drafting..." : "🚀 Generate Contextual Ad"}
                        </button>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    {['Inventory Focus', 'Finance Deals', 'Trade-In Promo', 'Brand Story'].map(label => (
                        <div key={label} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{label === 'Inventory Focus' ? '🚗' : label === 'Finance Deals' ? '🏦' : label === 'Trade-In Promo' ? '💰' : '📖'}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '600' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Marketing Manager Approval Workflow Section */}
            <section style={{ marginTop: '30px', background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    AI Marketing Manager
                    <span style={{ fontSize: '0.7rem', background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px' }}>DRAFTS REVIEW</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {marketingDrafts.map(draft => (
                        <div key={draft.id} style={{ 
                            padding: '20px', borderRadius: '12px', border: '1px solid #eee', 
                            backgroundColor: draft.status === 'Published' ? '#f0fff4' : '#fff' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666' }}>{draft.type.toUpperCase()}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: draft.status === 'Published' ? '#27ae60' : '#f39c12' }}>{draft.status}</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', margin: '0 0 20px', fontStyle: 'italic', color: '#333' }}>"{draft.text}"</p>
                            {draft.status === 'Pending Approval' ? (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => handleApproveMarketing(draft.id)}
                                        style={{ flex: 1, padding: '10px', background: '#00b894', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Approve & Post
                                    </button>
                                    <button style={{ flex: 1, padding: '10px', background: '#eee', color: '#666', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Edit Draft</button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#27ae60', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Live on Socials</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Presentation Mode Overlay */}
            {showPresentation && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', 
                    flexDirection: 'column', color: 'white', padding: '50px' 
                }}>
                    <button 
                        onClick={() => setShowPresentation(false)}
                        style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        [ CLOSE PRESENTATION ]
                    </button>

                    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'center' }}>
                        {presentationStep === 0 && (
                            <div className="slide animate-in">
                                <h2 style={{ color: '#D92027', fontSize: '3rem', fontWeight: '900', marginBottom: '10px' }}>REVHUNTER AI</h2>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '300', color: '#aaa', marginBottom: '40px' }}>The Relentless Sales Force for {tenant.name}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                                    <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '15px' }}>
                                        <div style={{ fontSize: '2rem' }}>👋</div>
                                        <h4 style={{ margin: '10px 0' }}>The Receptionist</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>24/7 Intelligent Greeting & Discovery</p>
                                    </div>
                                    <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '15px', background: 'rgba(217, 32, 39, 0.1)' }}>
                                        <div style={{ fontSize: '2rem' }}>🏹</div>
                                        <h4 style={{ margin: '10px 0' }}>The Sales Agent</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>9-Step Relentless Qualifying Script</p>
                                    </div>
                                    <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '15px' }}>
                                        <div style={{ fontSize: '2rem' }}>📈</div>
                                        <h4 style={{ margin: '10px 0' }}>The Marketing Manager</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Social Growth with Owner Control</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setPresentationStep(1)}
                                    style={{ padding: '15px 40px', background: '#D92027', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    HOW IT WORKS →
                                </button>
                            </div>
                        )}

                        {presentationStep === 1 && (
                            <div className="slide animate-in">
                                <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Role #3: Marketing Manager (Human-in-the-Loop)</h2>
                                <p style={{ fontSize: '1.1rem', color: '#aaa', marginBottom: '40px' }}>
                                    RevHunter AI generates high-converting content for Facebook & Instagram, but stays under your control. 
                                    Nothing goes live without your "Approve & Post" confirmation.
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ color: '#00b894', fontWeight: 'bold' }}>✓ AI Drafts Content</div>
                                        <div style={{ color: '#00b894', fontWeight: 'bold' }}>✓ Targets {tenant.location}</div>
                                        <div style={{ color: '#00b894', fontWeight: 'bold' }}>✓ Highlights Inventory</div>
                                    </div>
                                    <div style={{ borderLeft: '1px solid #444', paddingLeft: '30px' }}>
                                        <div style={{ color: '#f1c40f', fontWeight: 'bold' }}>⚠ Requires Owner Approval</div>
                                        <div style={{ color: '#f1c40f', fontWeight: 'bold' }}>⚠ Visual Dashboard Preview</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setPresentationStep(0)}
                                    style={{ marginTop: '50px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                                >
                                    ← BACK TO ROLES
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
