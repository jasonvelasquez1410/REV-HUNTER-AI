import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Target, Mic, MessageSquare, HelpCircle } from 'lucide-react';
import { Vapi as VapiNamed } from '@vapi-ai/web';
import VapiDefault from '@vapi-ai/web';
import ChatModal from '../components/ChatModal';
import CommandModal from '../components/CommandModal';
import ROIDashboard from '../components/ROIDashboard';
import SettingsPortal from '../components/SettingsPortal';
import SEOModule from '../components/SEOModule';
import BillingDashboard from '../components/BillingDashboard';
import { useTenant } from '../context/TenantContext';
import { MOCK_FALLBACK_LEADS, MOCK_APPOINTMENTS, PRESENTATION_INSIGHTS, MOCK_AGENTS } from '../utils/mockData';

const VAPI_PUBLIC_KEY = '012fbe2f-192f-44f3-a1b3-76db83ce299c';
const VAPI_ASSISTANT_ID = '5921ac52-3ea4-443f-a531-993b5e43fddf';

export default function Admin() {
    const { tenant } = useTenant();
    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    // State Declarations
    const [leads, setLeads] = useState([]);
    const [auditLogs, setAuditLogs] = useState([
        { id: 'init', time: "System", action: "Admin Hub Security Clear: OK", type: "Security" },
        { id: 'ready', time: "AI", action: "Relentless Sales Agent Elliot: STANDBY", type: "AI" }
    ]);
    const [selectedLeadChat, setSelectedLeadChat] = useState(null);
    const [isCommanding, setIsCommanding] = useState(null);
    const [activeTab, setActiveTab] = useState('inbox');
    const [vapiError, setVapiError] = useState(null);
    const [isCalling, setIsCalling] = useState(false);
    const [presentationMode, setPresentationMode] = useState(false);
    const [presentationStep, setPresentationStep] = useState(0);
    const [activeHuntLog, setActiveHuntLog] = useState([]);
    const [isHunting, setIsHunting] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [isVoiceDemoPlaying, setIsVoiceDemoPlaying] = useState(false);
    const [showAdModal, setShowAdModal] = useState(false);
    const [pendingAd, setPendingAd] = useState(null);
    const [isGeneratingAd, setIsGeneratingAd] = useState(false);

    // Refs
    const vapi = useRef(null);
    const prevLeadsCount = useRef(0);

    // --- HOISTED FUNCTIONS ---

    function parseState(stateStr) {
        try { return JSON.parse(stateStr || '{}'); } 
        catch { return { step: 1 }; }
    }

    function getBestVoice(gender = 'female', excludeVoice = null) {
        if (availableVoices.length === 0) return null;
        const femaleNames = ['aria', 'jenny', 'samantha', 'victoria', 'google us english', 'shannon', 'zira', 'hazel', 'elena'];
        const maleNames = ['guy', 'andrew', 'david', 'mark', 'stefan', 'george', 'google uk english male', 'google us english male'];
        const preferredNames = gender === 'female' ? femaleNames : maleNames;
        const candidates = excludeVoice ? availableVoices.filter(v => v.name !== excludeVoice.name) : availableVoices;
        
        let best = candidates.find(v => (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online') || v.name.toLowerCase().includes('neural')) && preferredNames.some(n => v.name.toLowerCase().includes(n)));
        if (!best) best = candidates.find(v => v.name.toLowerCase().includes('google') && preferredNames.some(n => v.name.toLowerCase().includes(n)));
        if (!best) best = candidates.find(v => preferredNames.some(n => v.name.toLowerCase().includes(n)));
        return best || candidates[0] || availableVoices[0];
    }

    const fetchLeads = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/leads`, { headers: { 'X-Tenant-Id': tenant.id } });
            if (!res.ok) throw new Error("API Failure");
            const data = await res.json();
            setLeads(data);
        } catch {
            setLeads(MOCK_FALLBACK_LEADS);
        }
    }, [apiUrl, tenant.id]);

    function handleVoiceDemo() {
        if (isVoiceDemoPlaying || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        
        const rileyVoice = getBestVoice('female');
        const customerVoice = getBestVoice('male', rileyVoice);
        
        const script = [
            { text: "Hi! This is Riley from FilCan Cars. I saw you were looking at our 2024 VW Atlas online. Are you looking for a family vehicle or something for your commute?", voice: rileyVoice },
            { text: "Oh, hi! Yeah, actually looking for my wife. We have 3 kids so definitely need the space.", voice: customerVoice },
            { text: "Perfect! The Atlas is actually our top safety pick for families this year. Speaking of safety, are you trading in your current car? We're currently offering a $1,500 bonus for trade-ins this week.", voice: rileyVoice }
        ];

        setIsVoiceDemoPlaying(true);
        let current = 0;

        function speakNext() {
            if (current >= script.length) {
                setIsVoiceDemoPlaying(false);
                return;
            }
            const utterance = new SpeechSynthesisUtterance(script[current].text);
            if (script[current].voice) utterance.voice = script[current].voice;
            utterance.pitch = script[current].voice === rileyVoice ? 1.1 : 0.9;
            utterance.rate = 1.0;
            utterance.onend = () => {
                current++;
                setTimeout(speakNext, 600);
            };
            window.speechSynthesis.speak(utterance);
        }
        speakNext();
    }

    function runHuntSimulation() {
        setIsHunting(true);
        setActiveHuntLog([]);
        const logs = [
            "Scanning Facebook Marketplace for 'VW Atlas' interest...",
            "Detected high-intent comment from 'Marvin Raymundo' on 2024 model...",
            "Sentiment: 92% Buying Intent. Triggering Relentless Hook...",
            "AI Agent Elliot engaged: Private message sent with monthly payment nudge.",
            "Marvin responded! 'DNA' extraction in progress...",
            "HUNT SUCCESS: Lead 'Marvin Raymundo' qualified for showroom Monday 2PM."
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            if (i >= logs.length) {
                clearInterval(interval);
                setIsHunting(false);
                setLeads(prev => [MOCK_FALLBACK_LEADS[0], ...prev]);
                return;
            }
            setActiveHuntLog(prev => [...prev, logs[i]]);
            i++;
        }, 1500);
    }

    async function handleGenerateAd() {
        setIsGeneratingAd(true);
        setAuditLogs(prev => [{ id: `ad-start-${Date.now()}`, time: "Now", action: "MARKETING: AI is analyzing current inventory for high-converting hooks...", type: "Marketing" }, ...prev]);
        
        try {
            const res = await fetch(`${apiUrl}/generate-ad`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenant.id },
                body: JSON.stringify({ context: 'tactical' })
            });
            
            let content = "";
            if (res.ok) {
                const data = await res.json();
                content = data.content;
            } else {
                throw new Error("API Failure");
            }

            setTimeout(() => {
                setPendingAd({
                    content: content || "🚀 MASSIVE TRADE-IN EVENT! Get up to $1,500 over book value for your ride this week only at FilCan Cars. DM us to lock in your appraisal! #RevHunter #SherwoodPark",
                    imagePrompt: "A high-end car dealership showroom at sunset with a 'TRADE-IN BONUS' glowing neon sign, cinematic lighting, 8k resolution.",
                    id: Math.floor(Math.random() * 10000)
                });
                setIsGeneratingAd(false);
                setShowAdModal(true);
                setAuditLogs(prev => [{ id: `ad-gen-${Date.now()}`, time: "Now", action: "MARKETING: Elite Ad draft generated (AI Fallback Active). Awaiting human approval...", type: "Marketing" }, ...prev]);
            }, 2000);
        } catch (err) {
            // RELENTLESS DEMO FALLBACK: Never show an error in the demo
            setTimeout(() => {
                setPendingAd({
                    content: "🔥 SHARP PRICE ALERT! The 2024 VW Atlas has arrived at FilCan Cars. Premium features, unmatched space. ✅ $0 Down Lease Options ✅ All Trade-ins Welcome. Message us for the 'Family Pack' pricing! #FilCanCars #RevHunter",
                    imagePrompt: "Close-up of a modern SUV steering wheel and dashboard, luxury interior, soft bokeh background, professional automotive photography.",
                    id: 9999
                });
                setIsGeneratingAd(false);
                setShowAdModal(true);
                setAuditLogs(prev => [{ id: `ad-fallback-${Date.now()}`, time: "Now", action: "MARKETING: AI Offline Mode engaged. Generated tactical content from local core.", type: "Marketing" }, ...prev]);
            }, 2000);
        }
    }

    function handleInjectLead() {
        const names = ["Marcus Aurelius", "Tony Stark"];
        const name = names[Math.floor(Math.random() * names.length)];
        const newLead = { id: Date.now(), name: name, status: "Discovery", quality_score: 50, last_action_time: "JUST NOW" };
        setLeads(prev => [newLead, ...prev]);
        setAuditLogs(prev => [{ id: `sim-${Date.now()}`, time: "Now", action: `PITCH MODE: Simulated lead '${name}' injected`, type: "AI" }, ...prev]);
    }

    function handleAutoNudge(leadId) {
        fetch(`${apiUrl}/admin/simulate-nudge`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ recipient_id: leadId, message: "SIMULATED NUDGE" }) 
        }).then(() => {
            setAuditLogs(prev => [{ id: `nudge-${Date.now()}`, time: "Now", action: `RELENTLESS: AI sent automated nudge to lead ID #${leadId}`, type: "AI" }, ...prev]);
            fetchLeads();
        }).catch(err => console.error("Nudge failed:", err));
    }

    function handleVoiceCall(lead) {
        try {
            const VapiBase = VapiNamed || VapiDefault;
            if (!vapi.current) {
                let constructor = null;
                if (typeof VapiBase === 'function') constructor = VapiBase;
                else if (VapiBase?.default && typeof VapiBase.default === 'function') constructor = VapiBase.default;
                else if (VapiBase && typeof VapiBase === 'object') constructor = Object.values(VapiBase).find(v => typeof v === 'function');
                
                if (constructor) vapi.current = new constructor(VAPI_PUBLIC_KEY);
            }
            if (!vapi.current) throw new Error("Vapi SDK not found.");
            if (!window.isSecureContext) throw new Error("Voice calls require HTTPS.");
            
            let greeting = `Hi ${lead.name.split(' ')[0]}! This is Elliot from FilCan Cars.`;
            if (lead.name.includes('Marvin')) greeting = `Boss, I've analyzed the lead DNA for Marvin Raymundo. He's ready for a Monday trade-in. Should we close him now?`;
            
            vapi.current.start(VAPI_ASSISTANT_ID, {
                firstMessage: greeting,
                variableValues: { customerName: lead.name.split(' ')[0], carModel: lead.car || 'vehicle' },
                model: { provider: "openai", model: "gpt-4o", messages: [{ role: "system", content: "You are Elliot, the Digital Sales Specialist... " }] }
            });
        } catch (err) {
            setVapiError("Manual Failure: " + err.message);
        }
    }

    // --- EFFECTS ---

    useEffect(() => {
        if (tenant.id) fetchLeads();
        // Relentless polling: Update leads every 30s to catch new "hunters"
        const interval = setInterval(() => {
            if (tenant.id) fetchLeads();
        }, 30000);
        return () => clearInterval(interval);
    }, [tenant.id, fetchLeads]);

    useEffect(() => {
        if (leads.length > prevLeadsCount.current && prevLeadsCount.current > 0) {
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("🔥 NEW HOT LEAD!", { body: `${leads[0].name} is interested in ${leads[0].car || 'a vehicle'}! Effortless conversion initiated.`, icon: "/icon-192.png" });
            }
        }
        prevLeadsCount.current = leads.length;
    }, [leads]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) setAvailableVoices(voices);
            else {
                window.speechSynthesis.onvoiceschanged = () => setAvailableVoices(window.speechSynthesis.getVoices());
            }
        }
    }, []);

    useEffect(() => {
        // Robust constructor resolution for Vapi Web SDK v2.x
        const VapiBase = VapiNamed || VapiDefault;
        try {
            let constructor = null;
            if (typeof VapiBase === 'function') constructor = VapiBase;
            else if (VapiBase?.default && typeof VapiBase.default === 'function') constructor = VapiBase.default;
            else if (VapiBase && typeof VapiBase === 'object') {
                constructor = Object.values(VapiBase).find(v => typeof v === 'function');
            }

            if (constructor) {
                vapi.current = new constructor(VAPI_PUBLIC_KEY);
                vapi.current.on('call-start', () => setIsCalling(true));
                vapi.current.on('call-end', () => setIsCalling(false));
                vapi.current.on('error', (e) => setVapiError(e.message || "Vapi Error"));
            }
        } catch (err) { console.error("Vapi Init Error:", err); }
        
        return () => { if (vapi.current) vapi.current.stop(); };
    }, []);

    const dailyLeads = leads.filter(l => l.is_reported);
    const stats = { published: 12, pending: 4, impressions: "15.4K", reach: "9.2K", leads24h: leads.length, qualityReported: dailyLeads.length };

    const queryParams = new URLSearchParams(window.location.search);
    const isSuperAdmin = queryParams.get('sa') === 'true';

    const allTabs = ['inbox', 'analytics', 'roi', 'hunters', 'showroom', 'seo', 'billing', 'settings'];
    const visibleTabs = allTabs.filter(tab => tab !== 'billing' || isSuperAdmin);

    return (
        <div className="admin-container" style={{ padding: '30px 5%', background: '#f4f7f6', minHeight: '100vh' }}>
            <h1 style={{ marginBottom: '30px', color: '#003366', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#D92027', color: 'white', padding: '10px 20px', borderRadius: '12px', fontSize: '1.2rem' }}>REVHUNTER AI v15.0-FORCE-REFRESH [ELITE]</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>Marketing Command Center</div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => alert("RELENTLESS STRATEGY GUIDE:\n\n1. Leads arrive automatically from FB, Google Ads, Website, or CRM.\n2. AI Elliot instantly text/chats to qualify them.\n3. USE ZAP: Force Elliot to send an unprompted follow-up text.\n4. USE TARGET: Manually tell Elliot what to pitch next.\n5. USE MIC: Trigger an instant outbound AI Voice Call to the lead.")} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'rgba(0,0,0,0.05)', color: '#003366', border: '1px solid #ddd', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}><HelpCircle size={18} /> STRATEGY GUIDE</button>
                    <button onClick={() => setPresentationMode(true)} style={{ padding: '12px 25px', background: '#003366', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,51,102,0.3)' }}>🚀 DEMO PITCH MODE</button>
                    {Notification.permission !== 'granted' && (
                        <button onClick={() => Notification.requestPermission()} style={{ padding: '12px 25px', background: '#00b894', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>🔔 ENABLE NOTIFICATIONS</button>
                    )}
                </div>
            </h1>

            {vapiError && (
                <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', padding: '15px', borderRadius: '10px', marginBottom: '20px', color: '#d63031', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>⚠️ {vapiError}</span>
                    <button onClick={() => setVapiError(null)} style={{ background: 'none', border: 'none', color: '#d63031', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>
            )}

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                {visibleTabs.map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        style={{ 
                            padding: '15px 30px', 
                            background: activeTab === tab ? '#003366' : 'white', 
                            color: activeTab === tab ? 'white' : '#666',
                            border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer',
                            transition: '0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            textTransform: 'uppercase', letterSpacing: '1px'
                        }}
                    >
                        {tab} {tab === 'inbox' && leads.length > 0 && <span style={{ background: '#D92027', color: 'white', padding: '2px 8px', borderRadius: '50%', fontSize: '0.7rem', marginLeft: '8px' }}>{leads.length}</span>}
                    </button>
                ))}
            </div>


            <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                <main>
                    {activeTab === 'inbox' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h3 style={{ color: '#003366' }}>ACTIVE RELENTLESS THREADS</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={handleInjectLead} style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ INJECT TEST LEAD</button>
                                    <button onClick={fetchLeads} style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>🔄 REFRESH</button>
                                </div>
                            </div>
                            {leads.length === 0 ? (
                                <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '2px dashed #ddd', color: '#888' }}>
                                    🎯 Scanning Facebook & Website for leads... [ELIOT ACTIVE]
                                </div>
                            ) : leads.map(lead => (
                                <div key={lead.id} style={{ background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.3s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{lead.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{lead.name} {lead.status === 'Hot' && "🔥"}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{lead.car || 'New Lead'} • {lead.source || 'Website'}</div>
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                                <span style={{ fontSize: '0.7rem', background: '#e0f2f1', color: '#00796b', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                                                    DNA: STEP {parseState(lead.conversation_state).step || 1}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', background: '#fff3e0', color: '#ef6c00', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                                                    QUALITY: {lead.quality_score}%
                                                </span>
                                            </div>
                                        </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                {MOCK_AGENTS.map(agent => (
                                                    <button 
                                                        key={agent.id}
                                                        onClick={() => {
                                                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, assigned_to: agent.id, assigned_agent: agent.name } : l));
                                                            setAuditLogs(prev => [{ id: `assign-${Date.now()}`, time: "Now", action: `System: Assigned lead ${lead.name} to ${agent.name}`, type: "System" }, ...prev]);
                                                            fetch(`${apiUrl}/leads/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead_id: lead.id, agent_name: agent.name }) }).catch(() => {});
                                                        }}
                                                        title={`Assign to ${agent.name}`}
                                                        style={{ 
                                                            width: '32px', height: '32px', borderRadius: '50%', background: agent.color, color: 'white', 
                                                            border: lead.assigned_to === agent.id ? '3px solid #000' : 'none', cursor: 'pointer',
                                                            fontSize: '0.7rem', fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {agent.avatar}
                                                    </button>
                                                ))}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#999', textAlign: 'center' }}>
                                                {lead.assigned_to ? `Assigned: ${MOCK_AGENTS.find(a => a.id === lead.assigned_to)?.name}` : 'Unassigned'}
                                            </div>
                                        </div>
                                        <button title="View SMS/Chat Logs" onClick={() => setSelectedLeadChat(lead)} style={{ padding: '10px 14px', background: '#f0f2f5', border: 'none', borderRadius: '12px', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><MessageSquare size={18} /></button>
                                        <button title="Zap (Relentless Nudge): Trigger AI to send a follow-up text instantly" onClick={() => handleAutoNudge(lead.id)} style={{ padding: '10px 14px', background: '#003366', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Zap size={18} /></button>
                                        <button title="Target (Command Mode): Manually instruct the AI on the next move" onClick={() => setIsCommanding(lead)} style={{ padding: '10px 14px', background: '#D92027', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Target size={18} /></button>
                                        <button title="Mic (Voice Agent): Have AI Elliot start an outbound call to this lead" onClick={() => handleVoiceCall(lead)} style={{ padding: '10px 14px', background: '#00b894', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><Mic size={18} /></button>
                                    </div>
                                  </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'agents' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                                {MOCK_AGENTS.map(agent => {
                                    const agentLeads = leads.filter(l => l.assigned_to === agent.id);
                                    return (
                                        <div key={agent.id} style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `${agent.color}10`, borderRadius: '0 0 0 100%', zIndex: 0 }} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: agent.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900', boxShadow: `0 10px 20px ${agent.color}40` }}>
                                                    {agent.avatar}
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0, color: '#333' }}>{agent.name}</h4>
                                                    <div style={{ fontSize: '0.8rem', color: '#00b894', fontWeight: 'bold' }}>● {agent.status}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '15px' }}>
                                                    <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '5px' }}>CLOSING RATE</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: agent.color }}>{agent.closing_rate}</div>
                                                </div>
                                                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '15px' }}>
                                                    <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '5px' }}>LOAD / STATS</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{agent.deals_this_month}</div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '20px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px', color: '#666' }}>CURRENTLY HANDLING:</div>
                                                {agentLeads.length === 0 ? (
                                                    <div style={{ fontSize: '0.75rem', color: '#999', padding: '10px', border: '1px dashed #ddd', borderRadius: '10px', textAlign: 'center' }}>No leads assigned</div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        {agentLeads.map(l => (
                                                            <span key={l.id} style={{ fontSize: '0.7rem', background: '#eef', padding: '5px 12px', borderRadius: '20px', color: '#003366', fontWeight: 'bold' }}>{l.name}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)', color: 'white', padding: '30px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,51,102,0.2)' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>AUTO-DISPATCHER ACTIVE ⚡</h3>
                                    <p style={{ margin: '5px 0 0', opacity: 0.7, fontSize: '0.9rem' }}>RevHunter is currently using **Round-Robin** to assign new Facebook and Web leads.</p>
                                </div>
                                <button style={{ padding: '12px 25px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => alert("Auto-Dispatcher Setting: Round-Robin (Active)")}>CONFIGURE RULES</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                                {[
                                    { label: "AI Impressions", val: stats.impressions, trend: "+12%" },
                                    { label: "Hunter Reach", val: stats.reach, trend: "+8.4%" },
                                    { label: "Leads (24h)", val: stats.leads24h, trend: "+100%" }
                                ].map((s, i) => (
                                    <div key={i} style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>{s.label}</div>
                                        <div style={{ fontSize: '2rem', fontWeight: '900', color: '#003366' }}>{s.val}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#00b894', fontWeight: 'bold', marginTop: '5px' }}>{s.trend} ↑</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginBottom: '20px' }}>RELENTLESS ADS PERFORMANCE</h3>
                                {leads.length > 0 ? (
                                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '30px', padding: '20px' }}>
                                        {leads.map((l, i) => (
                                            <div key={i} style={{ flex: 1, background: '#003366', height: `${l.quality_score}%`, borderRadius: '10px 10px 0 0', position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{l.quality_score}%</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p>Loading market data...</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'hunters' && (
                        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div>
                                    <h2 style={{ color: '#003366', margin: 0 }}>LEAD HUNTER HUB 🎯</h2>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>AI relentless scraping & social engagement bots.</p>
                                </div>
                                <button 
                                    onClick={runHuntSimulation}
                                    disabled={isHunting}
                                    style={{ padding: '15px 30px', background: isHunting ? '#ccc' : '#D92027', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', animation: isHunting ? 'none' : 'pulse 2s infinite' }}
                                >
                                    {isHunting ? "🏹 HUNTING IN PROGRESS..." : "🔥 START LEAD HUNT"}
                                </button>
                           </div>

                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ border: '1px solid #eee', borderRadius: '15px', padding: '20px' }}>
                                    <h4 style={{ marginBottom: '15px' }}>LIVE HUNT LOG</h4>
                                    <div className="custom-scroll" style={{ height: '300px', overflowY: 'auto', background: '#000', borderRadius: '10px', padding: '15px', color: '#00ff00', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {activeHuntLog.length === 0 ? "> Standing by for hunt instruction..." : activeHuntLog.map((log, i) => (
                                            <div key={i} style={{ marginBottom: '8px' }}>
                                                <span style={{ opacity: 0.5 }}>[{new Date().toLocaleTimeString()}]</span> {log}
                                            </div>
                                        ))}
                                        {isHunting && <div className="pulse">&gt; Searching social media metadata...</div>}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '15px' }}>CAMPAIGN SNAPSHOT</h4>
                                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px' }}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '5px' }}>Active Ad: "Atlas Trade-in Hook"</div>
                                            <div style={{ height: '6px', background: '#ddd', borderRadius: '3px' }}>
                                                <div style={{ width: '85%', height: '100%', background: '#D92027', borderRadius: '3px' }}></div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span>Engagement: 8.4%</span>
                                            <span style={{ color: '#00b894' }}>ROAS: 12.5x</span>
                                        </div>
                                        <button 
                                            onClick={handleGenerateAd} 
                                            disabled={isGeneratingAd}
                                            style={{ 
                                                width: '100%', marginTop: '20px', padding: '15px', 
                                                background: isGeneratingAd ? '#ccc' : '#003366', 
                                                color: 'white', border: 'none', borderRadius: '10px', 
                                                fontWeight: 'bold', cursor: isGeneratingAd ? 'wait' : 'pointer',
                                                boxShadow: '0 5px 15px rgba(0,51,102,0.2)'
                                            }}
                                        >
                                            {isGeneratingAd ? "⏳ GENERATING ELITE AD..." : "🚀 GENERATE NEW ELITE AD"}
                                        </button>
                                        {isGeneratingAd && (
                                            <div style={{ marginTop: '15px', height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div className="shimmer" style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #003366, #D92027, #003366)', backgroundSize: '200% 100%' }}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                           </div>
                        </div>
                    )}

                    {activeTab === 'showroom' && (
                        <div style={{ background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div>
                                    <h2 style={{ color: '#003366', margin: 0 }}>SHOWROOM APPOINTMENTS</h2>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>BOOKED BY AI ELLIOT 🌟</p>
                                </div>
                                <button 
                                    onClick={handleVoiceDemo}
                                    disabled={isVoiceDemoPlaying}
                                    style={{ 
                                        padding: '12px 25px', background: isVoiceDemoPlaying ? '#ccc' : '#D92027', 
                                        color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', 
                                        cursor: 'pointer', boxShadow: '0 8px 20px rgba(217,32,39,0.3)', transition: 'all 0.2s'
                                    }}
                                >
                                    {isVoiceDemoPlaying ? "🎧 DEMO IN PROGRESS" : "🎧 LISTEN TO AI VOICE PERSONA"}
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                {MOCK_APPOINTMENTS.map(app => (
                                    <div key={app.id} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px', borderLeft: `5px solid ${app.status === 'CONFIRMED' ? '#00b894' : '#fdcb6e'}` }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{app.lead}</div>
                                        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>{app.car}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>📅 {app.time}</span>
                                            <span style={{ 
                                                fontSize: '0.7rem', padding: '4px 8px', borderRadius: '5px',
                                                backgroundColor: app.status === 'CONFIRMED' ? '#e6f4ea' : '#fff9eb',
                                                color: app.status === 'CONFIRMED' ? '#1e7e34' : '#af8702'
                                            }}>{app.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'roi' && <ROIDashboard tenant={tenant} />}
                    {activeTab === 'seo' && <SEOModule tenant={tenant} />}
                    {activeTab === 'billing' && <BillingDashboard tenant={tenant} />}
                    {activeTab === 'settings' && <SettingsPortal tenant={tenant} onUpdate={(data) => setAuditLogs(prev => [{ id: `set-${Date.now()}`, time: "Now", action: `SYSTEM: Dealer config updated (${data.name})`, type: "System" }, ...prev])} />}
                </main>

                <aside>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
                        <h4 style={{ marginBottom: '20px', color: '#003366', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>AUDIT LOG</span>
                            <span style={{ fontSize: '0.6rem', background: '#eef', padding: '4px 8px', borderRadius: '5px' }}>LIVE</span>
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }} className="custom-scroll">
                            {auditLogs.map(log => (
                                <div key={log.id} style={{ fontSize: '0.75rem', borderLeft: `3px solid ${log.type === 'AI' ? '#00b894' : log.type === 'Marketing' ? '#D92027' : '#003366'}`, paddingLeft: '12px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>{log.action}</div>
                                    <div style={{ color: '#999', fontSize: '0.65rem', marginTop: '2px' }}>{log.time} • {log.type}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Presentation Overlay */}
            {presentationMode && (
                <div className="presentation-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '40px' }}>
                    <div style={{ width: '100%', maxWidth: '1000px', textAlign: 'center', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ color: '#D92027', fontWeight: 'bold', letterSpacing: '2px' }}>DEALER PITCH MODE</div>
                                <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>
                                    {presentationStep === 0 && "The 10-Lead-A-Day Revenue Machine"}
                                    {presentationStep === 1 && "Relentless AI in Action (Live DNA)"}
                                    {presentationStep === 2 && "The RevHunter Premium Suite Investment"}
                                </h2>
                            </div>
                            <button onClick={() => setPresentationMode(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {presentationStep === 0 && (
                                <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', textAlign: 'left', width: '100%' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.8rem', color: '#D92027', marginBottom: '20px' }}>HOW IT WORKS 🏹</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                            {[
                                                { t: "1. The AI Hunter Hub", d: "Aggressively scans Facebook, Google, and your CRM for local buyers." },
                                                { t: "2. The AI Voice Specialist", d: "Elliot makes outbound calls and texts within 60 seconds of a lead arriving." },
                                                { t: "3. The Lead DNA", d: "Automatically extracts trade-in details, budget, and credit pre-approval." },
                                                { t: "4. The Agent App", d: "Your sales team gets push notifications to their phones for every hot lead." }
                                            ].map((item, i) => (
                                                <div key={i}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>{item.t}</div>
                                                    <div style={{ color: '#aaa' }}>{item.d}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setPresentationStep(1)} style={{ marginTop: '40px', padding: '20px 40px', background: '#D92027', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>SEE LIVE ANALYSIS →</button>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>💹</div>
                                        <div style={{ fontSize: '3rem', fontWeight: '900' }}>400%</div>
                                        <div style={{ fontSize: '1.2rem', color: '#00b894', fontWeight: 'bold' }}>CONVERSION LIFT</div>
                                        <p style={{ marginTop: '20px', textAlign: 'center', opacity: 0.6 }}>Eliminating lead aging by responding in seconds, not hours.</p>
                                    </div>
                                </div>
                            )}

                            {presentationStep === 1 && (
                                <div className="animate-in" style={{ width: '100%' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                                        {Object.entries(PRESENTATION_INSIGHTS).map(([name, data]) => (
                                            <div key={name} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '25px', padding: '30px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                    <h4 style={{ fontSize: '1.4rem', margin: 0 }}>{name}</h4>
                                                    <span style={{ color: '#00b894', fontWeight: 'bold' }}>QUALIFIED 🎯</span>
                                                </div>
                                                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '15px', padding: '15px', marginBottom: '20px', fontSize: '0.85rem', height: '140px', overflowY: 'auto' }}>
                                                    {data.transcript.map((t, j) => (
                                                        <div key={j} style={{ marginBottom: '8px', color: t.sender === 'ai' ? '#00b894' : 'white' }}>
                                                            <b>{t.sender === 'ai' ? "ELLIOT:" : "LEAD:"}</b> {t.text}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="nine-step-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    {Object.entries(data.dna).map(([k, v]) => (
                                                        <div key={k} style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px', fontSize: '0.75rem' }}>
                                                            <span style={{ opacity: 0.6 }}>{k}:</span> <b>{v}</b>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '50px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                        <button onClick={() => setPresentationStep(0)} style={{ padding: '15px 30px', background: 'transparent', border: '1px solid white', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>← BACK</button>
                                        <button onClick={() => setPresentationStep(2)} style={{ padding: '15px 50px', background: '#D92027', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>VIEW INVESTMENT PLAN →</button>
                                    </div>
                                </div>
                            )}

                            {presentationStep === 2 && (
                                <div className="animate-in" style={{ textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '50px', alignItems: 'center', width: '100%' }}>
                                    <div>
                                        <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#D92027', marginBottom: '10px' }}>120,000 PHP</h3>
                                        <div style={{ fontSize: '1.2rem', opacity: 0.7, marginBottom: '30px' }}>PREMIUM SUITE (ONE-TIME SETUP)</div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                                            {[
                                                "Full AI Integration (Facebook, Google, Web)",
                                                "Unlimited Agent PWA Dashboard Licenses",
                                                "Custom AI Voice Branding (Elliot)",
                                                "Automated 24/7 Lead Nudging System",
                                                "99.9% Automation Guarantee"
                                            ].map((item, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ color: '#00b894', fontSize: '1.5rem' }}>✓</div>
                                                    <div style={{ fontSize: '1.1rem' }}>{item}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setPresentationStep(1)} style={{ padding: '15px 30px', background: 'transparent', border: '1px solid white', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>← BACK</button>
                                    </div>
                                    
                                    <div style={{ background: 'linear-gradient(135deg, #222 0%, #111 100%)', padding: '40px', borderRadius: '40px', border: '1px solid #D92027', boxShadow: '0 20px 50px rgba(217,32,39,0.2)' }}>
                                        <h4 style={{ color: '#D92027', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            🛡️ THE 1-YEAR GUARANTEE
                                        </h4>
                                        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#ccc' }}>
                                            We are so confident in **RevHunter AI** that we offer a **Full Refund** after 1 year if it doesn't meet your performance metrics.
                                        </p>
                                        <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '25px 0' }} />
                                        <div style={{ marginBottom: '25px' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold', marginBottom: '5px' }}>RENEWAL POLICY</div>
                                            <div style={{ fontSize: '0.95rem' }}>Optional annual renewal fee applies after Year 1 for maintenance, AI updates, and cloud hosting.</div>
                                        </div>
                                        <button onClick={() => setPresentationMode(false)} style={{ width: '100%', padding: '20px', background: '#00b894', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>CLOSE DEAL / END PITCH</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            {[0, 1, 2].map(step => (
                                <div key={step} onClick={() => setPresentationStep(step)} style={{ width: '12px', height: '12px', borderRadius: '50%', background: presentationStep === step ? '#D92027' : '#444', cursor: 'pointer', transition: '0.3s' }} />
                            ))}
                        </div>
                    </div>

                    {/* Side Navigation Arrows */}
                    {presentationStep > 0 && (
                        <button 
                            onClick={() => setPresentationStep(prev => prev - 1)}
                            style={{ position: 'fixed', left: '40px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', width: '60px', height: '60px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s', zIndex: 10001 }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >←</button>
                    )}
                    {presentationStep < 2 && (
                        <button 
                            onClick={() => setPresentationStep(prev => prev + 1)}
                            style={{ position: 'fixed', right: '40px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', width: '60px', height: '60px', borderRadius: '50%', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s', zIndex: 10001 }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217,32,39,0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >→</button>
                    )}
                </div>
            )}

            {/* Modals */}
            {selectedLeadChat && (
                <ChatModal 
                    lead={selectedLeadChat} 
                    onClose={() => setSelectedLeadChat(null)} 
                    tenant={tenant} 
                />
            )}
            {isCommanding && (
                <CommandModal 
                    lead={isCommanding} 
                    onClose={() => setIsCommanding(null)}
                    onSuccess={(action) => {
                        setAuditLogs(prev => [
                            { id: `cmd-${Date.now()}`, time: "Now", action: `COMMAND: Elliot received instruction: '${action}' for ${isCommanding.name}`, type: "AI" },
                            ...prev
                        ]);
                    }}
                />
            )}

            {/* AI Calling Overlay */}
            {isCalling && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.92)', zIndex: 9999,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'white', backdropFilter: 'blur(10px)'
                }}>
                    <div className="calling-circle" style={{
                        width: '120px', height: '120px', background: '#00b894', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
                        marginBottom: '30px', boxShadow: '0 0 50px rgba(0,184,148,0.5)',
                        animation: 'pulse 1.5s infinite'
                    }}>🎙️</div>
                    <h2 style={{ fontSize: '2rem' }}>AI ELLIOT IS CALLING...</h2>
                    <p style={{ color: '#00b894', fontWeight: 'bold' }}>RELENTLESS ENGAGEMENT ACTIVE</p>
                    <button 
                        onClick={() => vapi.current?.stop()}
                        style={{ marginTop: '40px', padding: '12px 30px', background: '#D92027', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
                    >END CALL</button>
                </div>
            )}

            {/* Ad Approval Modal */}
            {showAdModal && pendingAd && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', animation: 'slideUp 0.4s ease-out' }}>
                        <div style={{ padding: '30px', background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Review AI-Generated Ad 🤖</h2>
                            <button onClick={() => setShowAdModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>AD COPY (FACEBOOK/INSTAGRAM)</label>
                                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px', border: '1px solid #eee', fontSize: '0.95rem', lineHeight: '1.6', color: '#333' }}>
                                    {pendingAd.content}
                                </div>
                            </div>
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>VISUAL MAPPING (IMAGE PROMPT)</label>
                                <div style={{ background: '#333', color: '#00ff00', padding: '15px', borderRadius: '15px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    /imagine: {pendingAd.imagePrompt}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <button 
                                    onClick={() => handleGenerateAd()} 
                                    style={{ padding: '15px', background: '#f0f2f5', color: '#333', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    🔄 REGENERATE
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowAdModal(false);
                                        setAuditLogs(prev => [{ id: `ad-live-${Date.now()}`, time: "Now", action: `MARKETING: Campaign #${pendingAd.id} is now LIVE targeted to Sherwood Park.`, type: "Marketing" }, ...prev]);
                                        alert("🚀 RELENTLESS CAMPAIGN LIVE!\n\nTargeting: Sherwood Park (50km)\nPlatform: Facebook / Instagram\nBudget: Optimization Active");
                                    }} 
                                    style={{ padding: '15px', background: '#00b894', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,184,148,0.3)' }}
                                >
                                    ✅ APPROVE & GO LIVE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Subtle SuperAdmin Toggle for internal use */}
            <div style={{ position: 'fixed', bottom: '10px', right: '10px', opacity: 0.1, transition: '0.3s', cursor: 'pointer', fontSize: '0.6rem' }} 
                 onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                 onMouseLeave={(e) => e.currentTarget.style.opacity = 0.1}
                 onClick={() => {
                     const url = new URL(window.location.href);
                     url.searchParams.set('sa', isSuperAdmin ? 'false' : 'true');
                     window.location.href = url.toString();
                 }}>
                {isSuperAdmin ? '🔒 DISABLE SA MODE' : '🔓 ENABLE SA MODE'}
            </div>
        </div>
    );
}

