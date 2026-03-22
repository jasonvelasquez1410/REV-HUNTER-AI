import React, { useState } from 'react';
import LeadReportCard from '../components/LeadReportCard';

const Admin = () => {
    const [leads, setLeads] = useState([
        { id: 0, name: "John Doe", email: "john@example.com", phone: "555-0199", credit: "Excellent", budget: "$500/mo", trade: "2015 Honda Civic", status: "Qualified", is_reported: true, is_billed: false, quality_score: 95, follow_up_streak: 15, last_action_time: "Sat 9:00 PM" },
        { id: 1, name: "Sarah Smith", email: "sarah@gmail.com", phone: "555-0123", credit: "Fair", budget: "$400/mo", trade: "None", status: "Pending", is_reported: false, is_billed: false, quality_score: 60, follow_up_streak: 5, last_action_time: "Fri 2:00 PM" },
        { id: 2, name: "Mike Johnson", email: "mike@icloud.com", phone: "555-9876", credit: "Good", budget: "$600/mo", trade: "2018 Ford Escape", status: "Hot", is_reported: true, is_billed: true, quality_score: 98, follow_up_streak: 45, last_action_time: "Thu 10:00 AM" }
    ]);

    const [ageOffset, setAgeOffset] = useState(10);

    const [agedLeads, setAgedLeads] = useState([
        { id: 103, name: "Old Prospect", email: "old@demo.com", budget: "$300/mo", lastSeen: "Oct 2025", status: "Aged" }
    ]);

    const [auditLogs, setAuditLogs] = useState([
        { id: 1, time: "Sat 9:02 PM", action: "AI responded to John Doe", type: "AI" },
        { id: 2, time: "Sat 9:05 PM", action: "Task sent to Rjay's phone", type: "REP" },
        { id: 3, time: "Sat 10:00 PM", action: "90-Day Follow-up sent to Sarah", type: "AI" }
    ]);

    const [showPresentation, setShowPresentation] = useState(false);
    const [presentationStep, setPresentationStep] = useState(0);

    const [marketingDrafts, setMarketingDrafts] = useState([
        { id: 1, text: "🔥 Fresh Inventory! 2024 VW Atlas just landed. $0 down options available. #FilCanCars", type: "Facebook Post", status: "Pending Approval" },
        { id: 2, text: "Need a trade-in value? We're paying TOP DOLLAR this weekend in Sherwood Park! 🚗💰", type: "Ad Campaign", status: "Pending Approval" }
    ]);

    const dailyLeads = leads.filter(l => l.is_reported);

    const handleReport = (index) => {
        setLeads(prev => {
            const next = [...prev];
            next[index] = { 
                ...next[index], 
                is_reported: true, 
                quality_score: 90 + Math.floor(Math.random() * 10) 
            };
            return next;
        });
        setAuditLogs(prev => [
            { id: `log-${Date.now()}`, time: "Now", action: `AI promoted lead to Quality Report`, type: "AI" },
            ...prev
        ]);
    };

    const handleCharge = (lead) => {
        const newLeads = leads.map(l => l.id === lead.id ? { ...l, is_billed: true } : l);
        setLeads(newLeads);
        setAuditLogs([{ id: Date.now(), time: "Now", action: `Charged FilCan for ${lead.name}`, type: "BILL" }, ...auditLogs]);
        alert(`Successfully charged for lead: ${lead.name}`);
    };

    const handleReactivate = (lead) => {
        setLeads(prev => [
            ...prev, 
            { ...lead, id: prev.length + ageOffset, status: "Qualified", is_reported: false, is_billed: false, quality_score: 85, follow_up_streak: 1, last_action_time: "Just Now" }
        ]);
        setAgedLeads(prev => prev.filter(l => l.id !== lead.id));
        setAuditLogs(prev => [
            { id: `log-${Date.now()}`, time: "Now", action: `REACTIVATED: ${lead.name} (Dead to Life)`, type: "AI" },
            ...prev
        ]);
        setAgeOffset(prev => prev + 1);
    };

    const handleApproveMarketing = (id) => {
        setMarketingDrafts(prev => prev.map(d => d.id === id ? { ...d, status: "Published" } : d));
        setAuditLogs(prev => [
            { id: Date.now(), time: "Now", action: `Approved Marketing Post: #${id}`, type: "ADMIN" },
            ...prev
        ]);
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
                Marketing Command Center
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
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Accountability Audit Log</div>
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
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600',
                                                backgroundColor: lead.status === 'Hot' ? '#fff0f0' : lead.status === 'Qualified' ? '#f0fff4' : '#fff9eb',
                                                color: lead.status === 'Hot' ? '#ff4d4d' : lead.status === 'Qualified' ? '#27ae60' : '#f39c12',
                                                border: `1px solid ${lead.status === 'Hot' ? '#ffcccc' : lead.status === 'Qualified' ? '#c3e6cb' : '#ffeeba'}`
                                            }}>{lead.status}</span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            {!lead.is_reported ? (
                                                <button 
                                                    onClick={() => handleReport(i)}
                                                    className="btn-action" 
                                                    style={{ 
                                                        padding: '6px 12px', fontSize: '0.7rem', backgroundColor: '#003366', color: 'white', 
                                                        border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    Select for Report
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
                    border: '2px solid #003366',
                    boxShadow: '0 15px 35px rgba(0,51,102,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#003366' }}>Daily Quality Report</h2>
                            <span style={{ fontSize: '0.75rem', color: '#666' }}>Target: 10 High-Value Leads</span>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '30px', fontWeight: '600' }}>
                            Send to FilCan
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
                                <p style={{ fontSize: '0.8rem' }}>Move quality leads from the inbox to start building today's report for FilCan.</p>
                            </div>
                        )}
                    </div>

                    {dailyLeads.length > 0 && (
                        <div style={{ 
                            marginTop: '20px', 
                            padding: '15px', 
                            background: '#f0f4f8', 
                            borderRadius: '10px',
                            borderLeft: '4px solid #003366'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#444', fontWeight: '500' }}>Pot. Revenue (Est.):</span>
                                <span style={{ color: '#003366', fontWeight: '800', fontSize: '1.2rem' }}>$45,000</span>
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
                    <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '20px' }}>Aged leads you wrote off months ago. Relentless AI is bringing them back to life.</p>
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
                                <h2 style={{ color: '#D92027', fontSize: '3rem', fontWeight: '900', marginBottom: '10px' }}>OMNI HUNTER</h2>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '300', color: '#aaa', marginBottom: '40px' }}>The Relentless Automotive Sales Force</h3>
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
                                    Omni Hunter generates high-converting content for Facebook & Instagram, but stays under your control. 
                                    Nothing goes live without your "Approve & Post" confirmation.
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ color: '#00b894', fontWeight: 'bold' }}>✓ AI Drafts Content</div>
                                        <div style={{ color: '#00b894', fontWeight: 'bold' }}>✓ Targets Sherwood Park</div>
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
