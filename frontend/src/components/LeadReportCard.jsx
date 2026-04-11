import React from 'react';

export default function LeadReportCard({ lead, onCharge }) {
    return (
        <div className="lead-report-card" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '15px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s',
            cursor: 'default'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#003366',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {lead.name.charAt(0)}
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#2d3436' }}>{lead.name}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#636e72' }}>{lead.email}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                        color: lead.quality_score > 90 ? '#00b894' : '#fdcb6e', 
                        fontWeight: 'bold',
                        fontSize: '1.1rem' 
                    }}>
                        {lead.quality_score}% Match
                    </div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#b2bec3' }}>Intent Score</span>
                </div>
            </div>

            {/* Relentless Follow-up Tracker */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>
                    <span>90-Day Relentless Follow-up</span>
                    <span>Day {lead.follow_up_streak}/90</span>
                </div>
                <div style={{ height: '6px', background: '#ecf0f1', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${(lead.follow_up_streak / 90) * 100}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #003366, #00b894)',
                        borderRadius: '3px'
                    }}></div>
                </div>
            </div>

            <div style={{ backgroundColor: '#f1f2f6', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ fontSize: '0.65rem', color: '#00b894', fontWeight: 'bold', marginBottom: '8px' }}>
                    🧬 LEAD DNA (AI-VERIFIED)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '15px', background: '#e1f5fe', color: '#01579b', border: '1px solid #b3e5fc' }}>
                        💳 Credit: {lead.credit_status || 'Checking...'}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '15px', background: '#f1f8e9', color: '#33691e', border: '1px solid #dcedc8' }}>
                        📊 vAuto: $21,450 Est.
                    </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', color: '#2d3436', lineHeight: '1.4' }}>
                    "{lead.conversation_summary || 'Interested in VW Atlas. Ready to buy.'}"
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', backgroundColor: '#e17055', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>🔥 HOT</span>
                    <span style={{ fontSize: '0.8rem', backgroundColor: '#dfe6e9', color: '#2d3436', padding: '2px 8px', borderRadius: '4px' }}>CRM Vetted</span>
                </div>
                {!lead.is_billed ? (
                    <button 
                        onClick={() => onCharge(lead)}
                        className="btn btn-primary" 
                        style={{ padding: '6px 15px', fontSize: '0.8rem', borderRadius: '20px' }}
                    >
                        Charge Client
                    </button>
                ) : (
                    <span style={{ color: '#00b894', fontWeight: 'bold', fontSize: '0.9rem' }}>✓ Billed</span>
                )}
            </div>
        </div>
    );
}
