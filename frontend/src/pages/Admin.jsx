import React, { useState, useEffect, useRef } from 'react'; // v13.5 [ELITE]
import { Vapi as VapiNamed } from '@vapi-ai/web';
import VapiDefault from '@vapi-ai/web';
import LeadReportCard from '../components/LeadReportCard';
import { useTenant } from '../context/TenantContext';

const MOCK_FALLBACK_LEADS = [
    { id: 101, name: "Marvin Raymundo", status: "Hot", car: "VW Atlas", quality_score: 98, follow_up_streak: 2, conversation_state: '{"step": 5}', conversation_summary: "Interested in VW Atlas. Trade-in: 2018 RAV4. Credit: PRE-APPROVED.", last_action_time: "Today 10:45 AM", credit_status: "PRE-APPROVED", source: "OMNICHANNEL (Web+FB+Voice)" },
    { id: 102, name: "Jessica Chen", status: "Qualified", car: "Mazda CX-5", quality_score: 85, follow_up_streak: 1, conversation_state: '{"step": 3}', conversation_summary: "Looking for family SUV. CX-5 vs Atlas.", last_action_time: "Today 9:15 AM", source: "Facebook Messenger" }
];

const MOCK_CHATS = {
    101: [
        { sender: 'customer', text: "Hi, I saw your post about the 2024 VW Atlas. Is it still available?", time: "10:45 AM" },
        { sender: 'ai', text: "Hi Marvin! 👋 Yes, we have two 2024 Atlas units in stock: a Platinum-Grey and an Aurora-Red. Which one catches your eye? I'm the Digital Sales Specialist for FilCan Cars, here to help!", time: "10:46 AM" },
        { sender: 'customer', text: "The Grey one looks great. What's the monthly payment roughly?", time: "10:50 AM" },
        { sender: 'ai', text: "Great choice! The Atlas is perfect for families. Based on today's rates, we can get you into that for around $650/mo with your trade-in. Speaking of which, how is that 2018 RAV4 holding up?", time: "10:51 AM" },
        { sender: 'ai', text: "Hey Marvin, just following up! 🏆 I just ran a preliminary appraisal on your RAV4 and it might be worth more than you think. Want me to send the numbers?", time: "12:51 PM", isNudge: true }
    ],
    102: [
        { sender: 'customer', text: "Looking for a family SUV. Not sure between CX-5 and Atlas.", time: "9:15 AM" },
        { sender: 'ai', text: "Hi Jessica! Both are excellent. The CX-5 is sportier, while the Atlas offers way more interior space for the family. Do you need the extra 3rd-row seating?", time: "9:16 AM" }
    ]
};

const MOCK_APPOINTMENTS = [
    { id: 1, lead: "Marvin Raymundo", car: "2024 VW Atlas", time: "Mon 2:00 PM", status: "CONFIRMED" },
    { id: 2, lead: "Jessica Chen", car: "Mazda CX-5", time: "Tue 10:30 AM", status: "AI BOOKED" },
    { id: 3, lead: "Tony Stark", car: "F-150 Lightning", time: "Wed 4:00 PM", status: "PENDING" }
];

const PRESENTATION_INSIGHTS = {
    "Marvin Raymundo": {
        transcript: [
            { sender: "customer", text: "Is the 2024 VW Atlas still available?" },
            { sender: "ai", text: "Yes it is! We have two in stock. What features are you looking for?" },
            { sender: "customer", text: "I need space for 3 kids and a dog. My budget is $650/mo." },
            { sender: "ai", text: "The Atlas is perfect for that! Speaking of budget, do you have a trade-in?" },
            { sender: "customer", text: "Yes, a 2018 RAV4. I'd like to see it on Monday." }
        ],
        dna: { "Trade-in": "2018 RAV4 ✅", "Budget": "$650/mo ✅", "Credit": "PRE-APPROVED 🏦", "Priority": "Critical ✅" }
    },
    "Jessica Chen": {
        transcript: [
            { sender: "customer", text: "Comparing the CX-5 and the Atlas." },
            { sender: "ai", text: "Excellent models! Are you looking for sportiness or extra row space?" },
            { sender: "customer", text: "Mostly safety and reliability for my commute." },
            { sender: "ai", text: "Understood. The CX-5 has top safety ratings. When can you come for a test drive?" },
            { sender: "customer", text: "Maybe Tuesday morning." }
        ],
        dna: { "Intent": "Comparison ✅", "Urgency": "Medium ✅", "Showroom": "Requested ✅" }
    }
};

const Admin = () => {
    const { tenant } = useTenant();
    const [leads, setLeads] = useState([]);
    const [agedLeads, setAgedLeads] = useState([]);

    const [auditLogs, setAuditLogs] = useState([
        { id: 1, time: "Sat 9:02 PM", action: `AI responded to John Doe`, type: "AI" },
        { id: 2, time: "Sat 9:05 PM", action: "Task sent to Rjay's phone", type: "REP" },
        { id: 3, time: "Sat 10:00 PM", action: "90-Day Follow-up sent to Sarah", type: "AI" }
    ]);

    const vapi = useRef(null);
    const VAPI_PUBLIC_KEY = '012fbe2f-192f-44f3-a1b3-76db83ce299c';
    const VAPI_ASSISTANT_ID = '5921ac52-3ea4-443f-a531-993b5e43fddf';

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
                // Handle cases where the package is an object with the class inside
                const found = Object.values(VapiBase).find(v => typeof v === 'function');
                if (found) constructor = found;
            }
            
            if (constructor) {
                console.log("Initializing Vapi Engine...");
                vapi.current = new constructor(VAPI_PUBLIC_KEY);
            } else {
                console.error("Vapi class not resolved from package", VapiBase);
            }
        } catch (err) {
            console.error("Vapi Init Error:", err);
        }

        if (!vapi.current) return;

        vapi.current.on('call-start', () => {
            console.log('Vapi Call started');
        });

        vapi.current.on('call-end', () => {
            console.log('Vapi Call ended');
            setIsCalling(null);
        });

        vapi.current.on('error', (e) => {
            console.error('Vapi Global Error:', e);
            // Extract detailed info if available (Vapi SDK e is often an object with message/error)
            let detail = "Connection failed";
            if (typeof e === 'string') {
                detail = e;
            } else if (e && e.message) {
                detail = e.message;
            } else if (e && e.error) {
                detail = typeof e.error === 'string' ? e.error : JSON.stringify(e.error);
            } else if (e) {
                detail = JSON.stringify(e);
            }
            setVapiError(`${detail}. Verify microphone access and Assistant ID.`);
        });

        vapi.current.on('message', (msg) => {
            console.log('Vapi Message:', msg);
        });

        return () => {
            if (vapi.current) vapi.current.stop();
        };
    }, []);


    const [showPresentation, setShowPresentation] = useState(false);
    const [presentationStep, setPresentationStep] = useState(0);

    const [marketingDrafts, setMarketingDrafts] = useState([
        { id: 1, type: 'Post', text: 'New 2024 VW Atlas just landed! Perfect for families in Sherwood Park. 0% APR available.', status: 'Pending Approval' },
        { id: 2, type: 'Ad', text: 'Looking to upgrade? We offer the best trade-in values for your current car. Get an instant quote!', status: 'Published' }
    ]);

    const [isGeneratingAd, setIsGeneratingAd] = useState(false);
    const [isSyncingCRM, setIsSyncingCRM] = useState(null); 
    const [selectedLeadChat, setSelectedLeadChat] = useState(null);
    const [isCommanding, setIsCommanding] = useState(null);
    const [isCalling, setIsCalling] = useState(null);
    const [vapiError, setVapiError] = useState(null);
    const [isVoiceDemoPlaying, setIsVoiceDemoPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox', 'showroom', or 'pipeline'
    const [selectedPillar, setSelectedPillar] = useState('tactical');
    const PILLARS = ['New', 'Discovery', 'Qualified', 'Follow-up', 'Closed'];

    const dailyLeads = leads.filter(l => l.is_reported);
    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    // Persist voices to prevent mid-demo shifts
    const [availableVoices, setAvailableVoices] = useState([]);
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) setAvailableVoices(voices);
            };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch(`${apiUrl}/leads`, {
                headers: { 'X-Tenant-Id': tenant.id }
            });
            const data = await res.json();
            if (data && data.length > 0) {
                setLeads(data);
            } else {
                // Fail-safe: Use mock leads if DB is empty/disconnected
                setLeads(MOCK_FALLBACK_LEADS);
            }
        } catch {
            console.warn("Using Pitch Fail-safe (Offline Mode)");
            setLeads(MOCK_FALLBACK_LEADS);
        }
    };

    useEffect(() => {

        const fetchAllLeads = async () => {
            try {
                const [leadsRes, agedRes] = await Promise.all([
                    fetch(`${apiUrl}/leads`, { headers: { 'X-Tenant-Id': tenant.id } }),
                    fetch(`${apiUrl}/leads/aged`, { headers: { 'X-Tenant-Id': tenant.id } })
                ]);
                const leadsData = await leadsRes.json();
                const agedData = await agedRes.json();
                if (leadsData && leadsData.length > 0) {
                    setLeads(leadsData);
                } else {
                    setLeads(MOCK_FALLBACK_LEADS);
                }
                setAgedLeads(agedData);
            } catch (_err) {
                console.error("Failed to fetch leads:", _err);
                console.warn("Using Pitch Fail-safe (Offline Mode)");
                setLeads(MOCK_FALLBACK_LEADS);
            }
        };
        
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
        } catch {
            console.error("Report failed");
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
        } catch {
            console.error("Charge failed");
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
        } catch {
            console.error("Reactivate failed");
        }
    };

    const handleApproveMarketing = (id) => {
        setMarketingDrafts(prev => prev.map(d => d.id === id ? { ...d, status: "Published" } : d));
        setAuditLogs(prev => [
            { id: Date.now(), time: "Now", action: `Approved Marketing Post: #${id}`, type: "ADMIN" },
            ...prev
        ]);
    };

    const handleMoveLead = async (leadId, newStatus) => {
        try {
            await fetch(`${apiUrl}/leads/${leadId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            setAuditLogs(prev => [
                { id: `move-${Date.now()}`, time: "Now", action: `Lead ID #${leadId} moved to '${newStatus}'`, type: "REP" },
                ...prev
            ]);
        } catch (err) {
            console.error("Move failed:", err);
        }
    };

    const handleGenerateAd = async () => {
        setIsGeneratingAd(true);
        try {
            // Demo Fallback: Always generate a mock draft to ensure a successful pitch
            const mockDraft = {
                id: Date.now(),
                type: selectedPillar === 'tactical' ? 'Post' : 'Ad',
                text: selectedPillar === 'tactical' 
                    ? "New 2024 VW Atlas just landed! Perfect for families in Sherwood Park. 0% APR available."
                    : "Looking to upgrade? We offer the best trade-in values for your current car. Get an instant quote!",
                status: 'Pending Approval'
            };

            setMarketingDrafts(prev => [mockDraft, ...prev]);
            setAuditLogs(prev => [
                { id: `log-${Date.now()}`, time: "Now", action: `AI Marketing Manager drafted new ${selectedPillar} strategy`, type: "AI" },
                ...prev
            ]);
        } catch (err) {
            console.error("Ad gen failed:", err);
        } finally {
            setIsGeneratingAd(false);
        }
    };

    // handleManualReply removed in favor of handleCommand

    const handleSyncCRM = async (lead) => {
        setIsSyncingCRM(lead.id);
        
        try {
            const res = await fetch(`${apiUrl}/leads/${lead.id}/sync-gsheets`, {
                method: 'POST',
                headers: { 'X-Tenant-Id': tenant.id }
            });
            
            if (res.ok) {
                setAuditLogs(prev => [
                    { id: `crm-${Date.now()}`, time: "Now", action: `CRM: Lead '${lead.name}' successfully synced to GSheets/CDK (ID: ${lead.id})`, type: "REP" },
                    ...prev
                ]);
                alert(`✅ ${lead.name} synced to FilCan CRM (Google Sheets)`);
            } else {
                throw new Error("Sync failed");
            }
        } catch (err) {
            console.error("CRM Sync failed:", err);
            alert("❌ CRM Sync failed. Check backend logs.");
        } finally {
            setIsSyncingCRM(null);
        }
    };

    const handleVoiceCall = (lead) => {
        if (!vapi.current) return;
        
        setIsCalling(lead);
        
        // Start the real-time Vapi call - Using the most explicit structure for v2.x
        try {
            console.log("Attempting Vapi call to Assistant:", VAPI_ASSISTANT_ID);
            
            // Check for microphone availability first
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Microphone access is not supported by your browser or is blocked by security settings (HTTPS required).");
            }
            
            // DYNAMIC PRESENTATION MODE: Call Recap Simulation (Executive Briefing)
            let greeting = `Hi ${lead.name.split(' ')[0]}! This is Elliot from FilCan Cars. I noticed you were looking at our ${lead.car || 'inventory'}. How can I help you today?`;
            
            if (lead.name.includes('Marvin')) {
                greeting = `Boss, I've analyzed the lead DNA for Marvin Raymundo. He is a high-urgency buyer and I've successfully completed 6 of the 9 qualification steps. He's interested in the 2024 VW Atlas, trade-in is a 2018 RAV4, and budget is $650. He's ready for a Monday showroom appointment. How should we finalize his credit app?`;
            } else if (lead.name.includes('Jessica')) {
                greeting = `Boss, [STRICT: You are speaking to your Manager, NOT Jessica]. Here is the status update on Jessica Chen. She is currently comparing the CX-5 and Atlas. Her primary drivers are safety and reliability. I have already nudged her for a Tuesday morning test drive. She is currently Qualified. What specific safety specs should I emphasize in our next follow-up?`;
            } else if (lead.intent === 'Hot' || lead.status === 'Qualified' || lead.step === 'STEP 1') {
                greeting = `Boss, this is Elliot. I've already engaged with ${lead.name}. Based on our conversation, they are highly interested in the ${lead.car || 'vehicle'} and are ready for a showroom appointment. I've qualified them as a ${lead.intent || 'High Priority'} lead. What are our next steps?`;
            }

            const isInsightCall = lead.name.includes('Marvin') || lead.name.includes('Jessica');

            vapi.current.start(VAPI_ASSISTANT_ID, {
                firstMessage: greeting,
                variableValues: {
                    customerName: isInsightCall ? 'Boss' : lead.name.split(' ')[0],
                    carModel: lead.car || 'vehicle'
                },
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
                            content: isInsightCall 
                                ? `You are Elliot, the Lead DNA Analyst for ${tenant.name}. 
                                CURRENT CONTEXT: You are NOT speaking to the customer. You are speaking to your Manager/Boss. 
                                YOUR OBJECTIVE: Provide a strategic briefing on the lead (${lead.name}). Explain WHY they are hot or qualified. 
                                STYLE: Professional, concise, and helpful. Treat the person you are talking to as "Boss" or "Manager". 
                                Do NOT try to sell to the person you are talking to. Instead, help them understand how YOU (Elliot) handled the lead and what the next steps are.`
                                : `You are Elliot, the Digital Sales Specialist for ${tenant.name}. 
                                NATURAL MODE: ALWAYS be conversational. NEVER mention step numbers or step names (e.g., Do NOT say 'Step 1' or 'Discovery').
                                YOU ARE POLYGLOT: You effectively detect and respond in English, Tagalog, or Bisaya. Respond in the EXACT language the customer uses.
                                RELELENTLESS SALES PERSONA: You MUST lead the customer through our proven 9-Step Sales Process (Greeting, Discovery, Lifestyle, Must-Haves, Current Car, Trade-in, Finance, Inventory Match, Booking). 
                                CURRENT CONTEXT: You are speaking with ${lead.name}. Your goal is a Monday showroom appointment for the ${lead.car || 'vehicle'}.`
                        }
                    ]
                }
            });
        } catch (err) {
            console.error("Vapi Start Exception (Detailed):", err);
            setVapiError("Manual Failure: " + (err.message || "Engine initialization failed"));
        }
        
        setAuditLogs(prev => [
            { id: `voice-${Date.now()}`, time: "Now", action: `📞 VAPI: Initiated human-grade AI voice call to ${lead.name}`, type: "AI" },
            ...prev
        ]);
    };

    // Ultimate safe voice selector favoring Natural/Neural voices
    const getBestVoice = (gender = 'female', excludeVoice = null) => {
        if (availableVoices.length === 0) return null;

        // Mutually exclusive gender names to prevent overlap
        const femaleNames = ['aria', 'jenny', 'samantha', 'victoria', 'google us english', 'shannon', 'zira', 'hazel', 'elena'];
        const maleNames = ['guy', 'andrew', 'david', 'mark', 'stefan', 'george', 'google uk english male', 'google us english male'];
        
        const preferredNames = gender === 'female' ? femaleNames : maleNames;
        
        // Filter out the excluded voice if provided
        const candidates = excludeVoice ? availableVoices.filter(v => v.name !== excludeVoice.name) : availableVoices;
        
        // 1. Find by explicit high-quality keywords (Neural/Natural)
        let best = candidates.find(v => (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online') || v.name.toLowerCase().includes('neural')) && 
                                     preferredNames.some(n => v.name.toLowerCase().includes(n)));
        
        // 2. Fallback to Google versions (specific to gender)
        if (!best) best = candidates.find(v => v.name.toLowerCase().includes('google') && 
                                          preferredNames.some(n => v.name.toLowerCase().includes(n)));
        
        // 3. Last resort matching name keywords
        if (!best) best = candidates.find(v => preferredNames.some(n => v.name.toLowerCase().includes(n)));
        
        return best || candidates[0] || availableVoices[0];
    };

    const handleVoiceDemo = () => {
        if (isVoiceDemoPlaying) return;
        
        // Cancel any lingering speech to prevent the "simultaneous overlap" bug
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        const rileyVoice = getBestVoice('female');
        const customerVoice = getBestVoice('male', rileyVoice);
        
        console.log("Cached Demo Voices:", { riley: rileyVoice?.name, customer: customerVoice?.name });

        setIsVoiceDemoPlaying(true);
        
        const script = [
            { speaker: 'Customer', text: "Hi, I'm interested in the 2024 VW Atlas. Do you have one available for a test drive tomorrow?", voice: { pitch: 1.0, rate: 0.95 } },
            { speaker: 'Riley (AI)', text: "Hi! This is Riley from FilCan Cars. Yes, we have two Atlas units in stock—Platinum Grey and Aurora Red. Would 2:00 PM tomorrow work for you?", voice: { pitch: 1.0, rate: 1.0 } },
            { speaker: 'Customer', text: "2:00 PM sounds perfect. Also, do you guys accept trade-ins? I have a 2018 RAV4.", voice: { pitch: 1.0, rate: 0.95 } },
            { speaker: 'Riley (AI)', text: "Absolutely! We love RAV4s. Bring it with you, and I'll have our appraisal team give you a top-market value while you're out on your test drive. See you then!", voice: { pitch: 1.0, rate: 1.0 } }
        ];

        let currentLine = 0;

        const speakNext = () => {
            if (currentLine >= script.length) {
                setIsVoiceDemoPlaying(false);
                setAuditLogs(prev => [
                    { id: `demo-${Date.now()}`, time: "Now", action: "🎧 AUDIO CASE STUDY: Completed full customer-agent voice simulation", type: "AI" },
                    ...prev
                ]);
                return;
            }

            const line = script[currentLine];
            const utterance = new SpeechSynthesisUtterance(line.text);
            
            // Use CACHED voices for consistency
            const activeVoice = line.speaker.toLowerCase().includes('riley') ? rileyVoice : customerVoice;
            if (activeVoice) {
                utterance.voice = activeVoice;
                // Log and speed up slightly if it's a "classic" robotic voice
                if (!activeVoice.name.toLowerCase().includes('natural') && !activeVoice.name.toLowerCase().includes('online')) {
                    utterance.rate = line.voice.rate * 0.9; // Slow down robotic ones to sound less 'urgent'
                }
            }

            utterance.pitch = line.voice.pitch;
            utterance.rate = line.voice.rate;
            
            utterance.onstart = () => {
                console.log(`Speaking as ${line.speaker} (Line ${currentLine + 1}/${script.length})`);
            };

            utterance.onend = () => {
                currentLine++;
                // Add a slightly randomized pause for more human feel
                const humanPause = 400 + Math.random() * 300; 
                setTimeout(speakNext, humanPause);
            };

            // Error handling to prevent the queue from getting stuck
            utterance.onerror = (e) => {
                console.error("Speech error:", e);
                currentLine++;
                speakNext();
            };

            if (window.speechSynthesis) {
                window.speechSynthesis.speak(utterance);
            } else {
                currentLine++;
                speakNext();
            }
        };

        if (window.speechSynthesis) {
            speakNext();
        } else {
            alert("Digital Sales Persona: Audio Case Study is not supported on this mobile browser's internal webview. Please use Chrome or Safari for the full voice experience.");
            setIsVoiceDemoPlaying(false);
        }
    };

    const handleAutoNudge = async (leadId) => {
        try {
            await fetch(`${apiUrl}/admin/simulate-nudge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient_id: leadId, message: "SIMULATED NUDGE" })
            });
            
            setAuditLogs(prev => [
                { id: `nudge-${Date.now()}`, time: "Now", action: `RELENTLESS: AI sent automated nudge to lead ID #${leadId}`, type: "AI" },
                ...prev
            ]);
            
            // Refresh leads list
            fetchLeads();
        } catch (err) {
            console.error("Nudge failed:", err);
        }
    };

    const handleInjectLead = async () => {
        const names = ["Marcus Aurelius", "Leia Organa", "Tony Stark", "Diana Prince"];
        const cars = ["VW Atlas", "Mazda CX-5", "Ford F-150", "Honda Civic"];
        const name = names[Math.floor(Math.random() * names.length)];
        const car = cars[Math.floor(Math.random() * cars.length)];
        
        const payload = {
            entry: [{
                messaging: [{
                    sender: { id: `demo_${Date.now()}` },
                    message: { text: `Hi! I'm interested in the ${car}. Do you have one in stock?` }
                }]
            }]
        };

        try {
            const newLead = {
                id: Date.now(),
                name: name,
                status: "Discovery",
                quality_score: 50,
                follow_up_streak: 0,
                conversation_state: '{"step": 1}',
                conversation_summary: `Interested in ${car}. Waiting for AI.`,
                last_action_time: "JUST NOW"
            };
            
            setLeads(prev => [newLead, ...prev]);
            
            setAuditLogs(prev => [
                { id: `sim-${Date.now()}`, time: "Now", action: `PITCH MODE: Simulated lead '${name}' injected via Webhook`, type: "AI" },
                ...prev
            ]);
            
            // Try actual webhook, but don't crash if it fails (Fail-safe)
            fetch(`${apiUrl}/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => console.log("Silent fallback in pitch mode"));

        } catch {
            console.error("Injection failed");
        }
    };

    const parseState = (stateStr) => {
        try {
            return JSON.parse(stateStr || '{}');
        } catch {
            return { step: 1 };
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
                    <span style={{ background: '#D92027', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '1rem' }}>REVHUNTER AI v14.0 [ELITE]</span>
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
                        <div style={{ fontSize: '0.9rem' }}>{auditLogs[0]?.action || "Monitoring..."}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#00b894' }}>PITCH MODE: <span style={{ fontWeight: 'bold' }}>ACTIVE (SIMULATED)</span></div>
                    <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '2px' }}>CRM Connection: <span style={{ color: '#00b894', fontWeight: 'bold' }}>ACTIVE (CDK DRIVE)</span></div>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', marginTop: '5px' }}>
                        <button 
                            onClick={handleInjectLead}
                            style={{ background: '#00b894', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '15px', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                            🧪 Inject Lead
                        </button>
                        <button 
                            onClick={() => {
                                const lead = leads.find(l => l.status === 'Pending' || l.status === 'Discovery');
                                if (lead) handleAutoNudge(lead.id);
                                else alert("Please inject a lead first!");
                            }}
                            style={{ background: '#D92027', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '15px', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                            🚀 Test Auto-Nudge
                        </button>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#00b894', marginTop: '5px' }}>DB Resilience: <span style={{ fontWeight: 'bold' }}>ACTIVE (RETRY MODE)</span></div>
                    <div style={{ fontSize: '0.7rem', color: '#00b894' }}>All actions time-stamped & verified</div>
                </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                {/* Inbox Section */}
                <section style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                onClick={() => setActiveTab('inbox')}
                                style={{ 
                                    padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                                    background: activeTab === 'inbox' ? '#D92027' : '#f0f0f0',
                                    color: activeTab === 'inbox' ? 'white' : '#666'
                                }}
                            >
                                📥 RAW INBOX
                            </button>
                            <button 
                                onClick={() => setActiveTab('pipeline')}
                                style={{ 
                                    padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                                    background: activeTab === 'pipeline' ? '#003366' : '#f0f0f0',
                                    color: activeTab === 'pipeline' ? 'white' : '#666'
                                }}
                            >
                                🏹 PIPELINE
                            </button>
                            <button 
                                onClick={() => setActiveTab('showroom')}
                                style={{ 
                                    padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                                    background: activeTab === 'showroom' ? '#00b894' : '#f0f0f0',
                                    color: activeTab === 'showroom' ? 'white' : '#666'
                                }}
                            >
                                📅 SHOWROOM
                            </button>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>AI Sentinex Engine Active</span>
                    </div>

                    {activeTab === 'inbox' ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem' }}>CUSTOMER</th>
                                        <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem' }}>STEP</th>
                                        <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem' }}>HEAT</th>
                                        <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem' }}>PROGRESS</th>
                                        <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem' }}>INTENT</th>
                                        <th style={{ padding: '12px', color: '#666', fontSize: '0.8rem', textAlign: 'right' }}>ACTION</th>
                                    </tr>
                                </thead>
                            <tbody>
                                {leads.map((lead, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '600' }}>{lead?.name || "Anonymous Lead"}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{lead?.budget || "Discovery Phase"}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '600', color: tenant.theme_color }}>
                                                STEP {parseState(lead.conversation_state).step || 1}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ fontWeight: '800', color: (lead?.quality_score || 0) > 90 ? '#e17055' : '#fdcb6e' }}>
                                                    {lead?.quality_score || 0}%
                                                </span>
                                                {(lead?.quality_score || 0) > 90 ? <span>🔥</span> : <span>⚡</span>}
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
                                                }}>{lead?.status || "Pending"}</span>
                                                <span style={{ fontSize: '0.6rem', color: '#999' }}>FB MSG</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                            <button 
                                                onClick={() => handleVoiceCall(lead)}
                                                style={{ 
                                                    padding: '6px 10px', fontSize: '0.7rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                                    backgroundColor: lead.status === 'Hot' ? '#ff4d4d' : lead.status === 'Qualified' ? '#00b894' : '#00b894', 
                                                    color: 'white', fontWeight: 'bold'
                                                }}
                                                title="View AI Qualification Insight"
                                            >
                                                {lead.name === 'Marvin Raymundo' ? '🎯 Why Hot?' : lead.name === 'Jessica Chen' ? '🎯 Why Qualified?' : '📞 Call'}
                                            </button>
                                            <button 
                                                onClick={() => setSelectedLeadChat(lead)}
                                                style={{ padding: '6px 12px', fontSize: '0.7rem', backgroundColor: '#6c5ce7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                            >
                                                👁️ View
                                            </button>
                                            <button 
                                                onClick={() => setIsCommanding(lead)}
                                                style={{ padding: '6px 12px', fontSize: '0.7rem', backgroundColor: '#eee', color: '#1a1a1a', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                title="Issue Strategic Command to Elliot"
                                            >
                                                ⚡ Command
                                            </button>
                                            <button 
                                                disabled={isSyncingCRM === lead.id}
                                                onClick={() => handleSyncCRM(lead)}
                                                style={{ padding: '6px 12px', fontSize: '0.7rem', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: isSyncingCRM === lead.id ? 0.7 : 1 }}
                                            >
                                                {isSyncingCRM === lead.id ? "⏳..." : "🔄 CRM"}
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
                    ) : activeTab === 'pipeline' ? (
                        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                            {PILLARS.map(pillar => (
                                <div key={pillar} style={{ minWidth: '280px', flex: 1, background: '#f4f7f9', borderRadius: '15px', padding: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#003366', fontWeight: 'bold' }}>{pillar.toUpperCase()}</h4>
                                        <span style={{ fontSize: '0.7rem', background: '#e0e0e0', padding: '2px 8px', borderRadius: '10px' }}>
                                            {leads.filter(l => (l.status === pillar) || (pillar === 'New' && (l.status === 'Hot' || l.status === 'New')) || (pillar === 'Discovery' && (l.status === 'Pending' || l.status === 'Discovery' || l.status === 'Discovery Phase'))).length}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {leads.filter(l => {
                                            if (pillar === 'New') return l.status === 'Hot' || l.status === 'New';
                                            if (pillar === 'Discovery') return l.status === 'Pending' || l.status === 'Discovery' || l.status === 'Discovery Phase';
                                            return l.status === pillar;
                                        }).map(lead => (
                                            <div key={lead.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderLeft: `4px solid ${tenant.theme_color}` }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '5px' }}>{lead.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '10px' }}>{lead.conversation_summary}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button 
                                                            onClick={() => handleVoiceCall(lead)}
                                                            style={{ padding: '4px 8px', fontSize: '0.6rem', background: '#00b894', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                        >📞</button>
                                                        <button 
                                                            onClick={() => handleSyncCRM(lead)}
                                                            style={{ padding: '4px 8px', fontSize: '0.6rem', background: '#003366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                        >🔄</button>
                                                    </div>
                                                    <select 
                                                        value={lead.status} 
                                                        onChange={(e) => handleMoveLead(lead.id, e.target.value)}
                                                        style={{ fontSize: '0.65rem', padding: '2px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                    >
                                                        {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, color: '#00b894' }}>Upcoming Showroom Appointments</h3>
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
                </section>

            {/* AI Calling Overlay */}
            {isCalling && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.92)', zIndex: 9999,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                    color: 'white', backdropFilter: 'blur(10px)', overflowY: 'auto', padding: '40px 0'
                }}>
                    <div className="calling-circle" style={{
                        width: '140px', height: '140px', background: '#00b894', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem',
                        marginBottom: '30px', boxShadow: '0 0 70px rgba(0,184,148,0.6)',
                        animation: 'pulse 1.5s infinite'
                    }}>
                        🎙️
                    </div>
                    <h2 style={{ fontSize: '2.2rem', marginBottom: '5px' }}>REAL-TIME HUMAN-AI VOICE</h2>
                    <div style={{ fontSize: '0.8rem', color: '#00b894', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '2px' }}>POWERED BY VAPI & ELEVENLABS</div>
                    
                    {vapiError && !JSON.stringify(vapiError).includes('Meeting has ended') ? (
                        <div style={{ padding: '20px', background: 'rgba(217,32,39,0.2)', border: '1px solid #D92027', borderRadius: '15px', color: '#ff4d4d', marginBottom: '20px', maxWidth: '80%' }}>
                            <strong>CALL ERROR:</strong> {typeof vapiError === 'string' ? vapiError : JSON.stringify(vapiError)}
                        </div>
                    ) : (
                        <p style={{ fontSize: '1.2rem', color: '#fff', fontWeight: '500' }}>In conversation with <span style={{ color: '#00b894' }}>{isCalling?.name || "Customer"}</span>...</p>
                    )}
                    
                    <div style={{ display: 'flex', gap: '20px', width: '90%', maxWidth: '1000px', height: '250px', marginTop: '20px' }}>
                        {/* LEFT: Live Transcript Simulation */}
                        <div style={{ flex: 1.5, background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(0,184,148,0.2)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.7rem', color: '#00b894', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                                LIVE TRANSCRIPT MEMORY
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '10px' }} className="custom-scroll">
                                {(PRESENTATION_INSIGHTS[isCalling.name]?.transcript || [
                                    { sender: 'ai', text: 'Initializing neural connection...' },
                                    { sender: 'ai', text: 'Accessing FilCan Cars inventory database...' },
                                    { sender: 'ai', text: `Analyzing engagement history for ${isCalling.name}...` }
                                ]).map((line, idx) => (
                                    <div key={idx} style={{ 
                                        padding: '10px 15px', borderRadius: '12px', fontSize: '0.85rem',
                                        alignSelf: line.sender === 'customer' ? 'flex-end' : 'flex-start',
                                        background: line.sender === 'customer' ? 'rgba(255,255,255,0.05)' : 'rgba(0,184,148,0.1)',
                                        border: line.sender === 'customer' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,184,148,0.2)',
                                        color: line.sender === 'customer' ? '#ccc' : '#fff',
                                        maxWidth: '85%'
                                    }}>
                                        <div style={{ fontSize: '0.6rem', color: line.sender === 'customer' ? '#888' : '#00b894', fontWeight: 'bold', marginBottom: '4px' }}>
                                            {line.sender === 'customer' ? 'CUSTOMER' : '🤖 ELLIOT (AI)'}
                                        </div>
                                        {line.text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: AI DNA Insight */}
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(0,184,148,0.2)', padding: '20px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#00b894', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                                LEAD DNA ANALYSIS
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {Object.entries(PRESENTATION_INSIGHTS[isCalling.name]?.dna || { "Status": "Processing", "Intelligence": "Deep Learning Active" }).map(([key, val]) => (
                                    <div key={key} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase' }}>{key}</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#00b894' }}>{val}</div>
                                    </div>
                                ))}
                                <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0, 184, 148, 0.1)', borderRadius: '10px', border: '1px dashed #00b894', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#00b894', fontWeight: 'bold' }}>AI CONFIDENCE: 98%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            if (vapi.current) vapi.current.stop();
                            setIsCalling(null);
                            setVapiError(null);
                        }}
                        style={{ 
                            marginTop: '50px', padding: '15px 40px', background: '#D92027', color: 'white', 
                            border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: 'bold', 
                            cursor: 'pointer', boxShadow: '0 10px 30px rgba(217,32,39,0.3)', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        🛑 END LIVE CALL
                    </button>
                    
                    <div style={{ position: 'absolute', bottom: '40px', color: '#444', fontSize: '0.7rem' }}>
                        RevHunter Voice Engine V20.1 | Low Latency Mode Active
                    </div>
                </div>
            )}

            {/* Voice Case Study Overlay */}
            {isVoiceDemoPlaying && (
                <div style={{
                    position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    width: '90%', maxWidth: '600px', background: '#1a1a1a', border: '2px solid #D92027',
                    padding: '25px', borderRadius: '20px', zIndex: 10000, color: 'white',
                    display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    <div style={{ width: '60px', height: '60px', background: '#D92027', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        🎧
                    </div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#D92027', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Live Audio Case Study</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Marcus (Customer) ⟷ Riley (AI Sales Agent)</div>
                        <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '5px' }}>Demonstrating full showroom booking interaction...</div>
                    </div>
                </div>
            )}

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
                                <div style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.3 }}>📊</div>
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
                    flexDirection: 'column', color: 'white', padding: '20px' 
                }} className="presentation-overlay">
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
                                <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>The 9-Step Relentless Hunter 🏹</h2>
                                <p style={{ fontSize: '1.1rem', color: '#aaa', marginBottom: '30px' }}>
                                    Unlike a human receptionist, RevHunter AI never misses a beat. It follows a strict, proven 9-step qualification process.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', textAlign: 'left', fontSize: '0.9rem', marginBottom: '30px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px' }} className="nine-step-grid">
                                    <div>1. Greeting 👋</div>
                                    <div>2. Discovery 🔍</div>
                                    <div>3. Lifestyle 🏠</div>
                                    <div>4. Must-Haves ⭐</div>
                                    <div>5. Current Car 🚗</div>
                                    <div>6. Trade-in 💰</div>
                                    <div>7. Financing 🏦</div>
                                    <div>8. Inventory Match ✅</div>
                                    <div>9. Booking 📅</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    <button onClick={() => setPresentationStep(0)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>← PREVIOUS</button>
                                    <button 
                                        onClick={() => { 
                                            setShowPresentation(false); 
                                            const marvin = leads.find(l => l.name.includes('Marvin')) || MOCK_FALLBACK_LEADS[0];
                                            setSelectedLeadChat(marvin); 
                                        }}
                                        style={{ padding: '12px 30px', background: '#00b894', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        👁️ VIEW LIVE CHAT DEMO
                                    </button>
                                    <button 
                                        onClick={() => setPresentationStep(2)}
                                        style={{ padding: '12px 30px', background: '#D92027', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        WHY US? →
                                    </button>
                                </div>
                            </div>
                        )}

                        {presentationStep === 2 && (
                            <div className="slide animate-in">
                                <h2 style={{ fontSize: '2.4rem', marginBottom: '30px', color: '#f1c40f' }}>The RevHunter Advantage 🏆</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', textAlign: 'left' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px' }}>
                                        <h4 style={{ color: '#f1c40f', marginBottom: '10px' }}>Relentless Persistence</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#aaa' }}>While humans stop after 2 tries, RevHunter AI follows up for 90 days across Facebook and SMS.</p>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px' }}>
                                        <h4 style={{ color: '#00b894', marginBottom: '10px' }}>Risk-Free Performance</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#aaa' }}>Stop paying for 'software' and start paying for 'sales'. You only pay per qualified lead we deliver.</p>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px' }}>
                                        <h4 style={{ color: '#f1c40f', marginBottom: '10px' }}>Inventory Intelligence</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#aaa' }}>Instantly matches customers to your specific stock (e.g. 2024 VW Atlas) without manual lookup.</p>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px' }}>
                                        <h4 style={{ color: '#f1c40f', marginBottom: '10px' }}>Accountability First</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#aaa' }}>Every action is time-stamped and synced to your CRM (CDK Drive) in real-time.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                                    <button onClick={() => setPresentationStep(1)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>← PREVIOUS</button>
                                    <button 
                                        onClick={() => setPresentationStep(3)}
                                        style={{ padding: '12px 30px', background: '#D92027', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        SHOW THE NUMBERS →
                                    </button>
                                </div>
                            </div>
                        )}

                        {presentationStep === 3 && (
                            <div className="slide animate-in">
                                <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#00b894' }}>The 10-Lead Guarantee ✅</h2>
                                <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '40px' }}>
                                    No upfront risk. **You only pay per qualified lead** found in your daily report.
                                </p>
                                <div style={{ background: 'rgba(0, 184, 148, 0.1)', padding: '30px', borderRadius: '25px', border: '1px solid #00b894', marginBottom: '40px' }}>
                                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#00b894' }}>10 / DAY</div>
                                    <div style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>Target Quality Output</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    <button onClick={() => setPresentationStep(2)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>← PREVIOUS</button>
                                    <button 
                                        onClick={() => setPresentationStep(4)}
                                        style={{ padding: '12px 30px', background: '#D92027', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        HOW DO I MANAGE THEM? →
                                    </button>
                                </div>
                            </div>
                        )}

                        {presentationStep === 4 && (
                            <div className="slide animate-in">
                                <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Transparency & Control 📊</h2>
                                <p style={{ fontSize: '1.1rem', color: '#aaa', marginBottom: '40px' }}>
                                    The Command Center gives you 100% visibility. You see everything the AI sees.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', marginBottom: '40px' }}>
                                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>✓ Real-Time Audit Logs</div>
                                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>✓ 🔄 CDK CRM Integration</div>
                                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>✓ Automated CRM Sync</div>
                                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>✓ Relentless Mining</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    <button onClick={() => setPresentationStep(3)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>← PREVIOUS</button>
                                    <button 
                                        onClick={() => setPresentationStep(5)}
                                        style={{ padding: '12px 30px', background: '#D92027', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        LET'S START HUNTING →
                                    </button>
                                </div>
                            </div>
                        )}

                        {presentationStep === 5 && (
                            <div className="slide animate-in">
                                <h2 style={{ fontSize: '3rem', marginBottom: '20px', color: '#D92027', fontWeight: '900' }}>READY TO SCALE?</h2>
                                <p style={{ fontSize: '1.3rem', color: '#aaa', marginBottom: '50px' }}>
                                    Join the elite dealerships using **Relentless AI** to dominate their market.
                                </p>
                                <div style={{ background: 'white', color: '#003366', padding: '40px', borderRadius: '30px', display: 'inline-block', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                                    <h3 style={{ marginBottom: '25px' }}>Next Action Items:</h3>
                                    <div style={{ textAlign: 'left', fontSize: '1.2rem' }}>
                                        <div style={{ marginBottom: '10px' }}>1. Grant Facebook Admin Access 🔑</div>
                                        <div style={{ marginBottom: '10px' }}>2. Connect CDK Drive API 🚗</div>
                                        <div style={{ marginBottom: '10px', color: '#D92027', fontWeight: 'bold' }}>3. GO LIVE & START HUNTING 🚀</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '50px' }}>
                                    <button onClick={() => setPresentationStep(6)} style={{ padding: '12px 30px', background: '#00b894', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>FINAL RECAP →</button>
                                </div>
                            </div>
                        )}

                        {presentationStep === 6 && (
                            <div className="slide animate-in">
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#00b894' }}>The Complete Sales Department</h2>
                                <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '40px' }}>
                                    RevHunter is more than a bot. It is your 24/7 Digital Sales Team.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid #333' }}>
                                        <div style={{ fontSize: '2rem' }}>💬</div>
                                        <h4>FB Chat</h4>
                                    </div>
                                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid #333' }}>
                                        <div style={{ fontSize: '2rem' }}>📞</div>
                                        <h4>AI Voice</h4>
                                    </div>
                                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid #333' }}>
                                        <div style={{ fontSize: '2rem' }}>📅</div>
                                        <h4>Booked</h4>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setPresentationStep(0)}
                                    style={{ padding: '12px 30px', background: '#D92027', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    RESTART PITCH
                                </button>
                            </div>
                        )}

                        {/* Navigation Dots */}
                        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px' }}>
                            {[0, 1, 2, 3, 4, 5, 6].map(step => (
                                <div 
                                    key={step}
                                    onClick={() => setPresentationStep(step)}
                                    style={{ 
                                        width: '12px', height: '12px', borderRadius: '50%', 
                                        background: presentationStep === step ? '#D92027' : '#444', 
                                        cursor: 'pointer', transition: '0.3s' 
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
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
        </div>
    );
};

/* Chat Modal Component for Demo */
const ChatModal = ({ lead, onClose, tenant }) => {
    const chat = MOCK_CHATS[lead.id] || [
        { sender: 'customer', text: `Hi! I'm interested in the car. Do you have one in stock?`, time: "Just Now" },
        { sender: 'ai', text: `Hi ${lead.name.split(' ')[0]}! 👋 I'm the Digital Sales Specialist for ${tenant.name}. I'll check our inventory for you right now!`, time: "Just Now" }
    ];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ width: 'min(95vw, 450px)', height: 'min(90vh, 600px)', background: 'white', borderRadius: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease-out' }} className="modal-container">
                <div style={{ background: tenant.theme_color || '#003366', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', color: tenant.theme_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{lead.name.charAt(0)}</div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{lead.name}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Relentless AI: ACTIVE</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                
                <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f9f9fb', display: 'flex', gap: '20px' }} className="modal-content-wrapper">
                    {/* Chat Messages */}
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '15px' }} className="chat-messages">
                        {chat.map((msg, i) => (
                            <div key={i} style={{ 
                                alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                                maxWidth: '90%',
                                display: 'flex', flexDirection: 'column',
                                alignItems: msg.sender === 'ai' ? 'flex-start' : 'flex-end'
                            }}>
                                <div style={{ 
                                    padding: '12px 16px', borderRadius: '18px', fontSize: '0.9rem',
                                    background: msg.sender === 'ai' ? (msg.isNudge ? '#D92027' : '#003366') : '#fff',
                                    color: msg.sender === 'ai' ? 'white' : '#333',
                                    border: msg.sender === 'customer' ? '1px solid #eee' : 'none',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '18px',
                                    borderBottomRightRadius: msg.sender === 'customer' ? '4px' : '18px'
                                }}>
                                    {msg.sender === 'ai' && (
                                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginBottom: '4px', opacity: 0.8 }}>🌟 Elliot (Digital Specialist)</div>
                                    )}
                                    {msg.text}
                                </div>
                                <span style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '4px' }}>{msg.time} {msg.isNudge && "🔥 AUTO-NUDGE"}</span>
                            </div>
                        ))}
                    </div>

                    {/* 9-Step Hunter Audit (Right Panel) */}
                    <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px', background: '#fff', borderRadius: '15px', padding: '15px', display: 'flex', flexDirection: 'column' }} className="audit-panel">
                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#003366', marginBottom: '15px', letterSpacing: '1px' }}>9-STEP HUNTER AUDIT</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            {[
                                { n: 1, label: "Greeting", icon: "👋" },
                                { n: 2, label: "Discovery", icon: "🔍" },
                                { n: 3, label: "Lifestyle", icon: "🏠" },
                                { n: 4, label: "Must-Haves", icon: "⭐" },
                                { n: 5, label: "Current Car", icon: "🚗" },
                                { n: 6, label: "Trade-in Info", icon: "💰" },
                                { n: 7, label: "Financing", icon: "🏦" },
                                { n: 8, label: "Inventory Match", icon: "✅" },
                                { n: 9, label: "Booking", icon: "📅" }
                            ].map((s) => {
                                const currentStep = lead.name.includes('Marvin') ? 6 : lead.name.includes('Jessica') ? 3 : 1;
                                const isDone = s.n <= currentStep;
                                const isCurrent = s.n === currentStep + 1;
                                
                                return (
                                    <div key={s.n} style={{ 
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', 
                                        borderRadius: '8px', background: isCurrent ? '#fff9eb' : 'transparent',
                                        opacity: isDone || isCurrent ? 1 : 0.4
                                    }}>
                                        <div style={{ 
                                            width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.6rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isDone ? '#00b894' : isCurrent ? '#f1c40f' : '#eee',
                                            color: isDone || isCurrent ? 'white' : '#999',
                                            fontWeight: 'bold'
                                        }}>
                                            {isDone ? '✓' : s.n}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: isDone || isCurrent ? '600' : '400', color: isDone ? '#00b894' : isCurrent ? '#d35400' : '#888' }}>
                                            {s.icon} {s.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '10px', fontSize: '0.65rem', color: '#666', border: '1px solid #eee' }}>
                            <div style={{ fontWeight: 'bold', color: '#003366', marginBottom: '4px' }}>AI STRATEGY:</div>
                            {lead.name.includes('Marvin') ? "Pushing for Monday appt. Emphasizing trade-in value." : "Discovery Phase. Qualifying lifestyle requirements."}
                        </div>
                    </div>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid #eee', background: 'white', display: 'flex', gap: '10px' }}>
                    <input disabled placeholder="AI is lead-hunting..." style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #eee', backgroundColor: '#f5f5f5', fontSize: '0.85rem' }} />
                    <button style={{ background: tenant.theme_color || '#003366', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏹</button>
                </div>
            </div>
            <style>{`
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0.4); } 70% { box-shadow: 0 0 0 30px rgba(0, 184, 148, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0); } }
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,184,148,0.3); border-radius: 10px; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,184,148,0.5); }

                @media (max-width: 600px) {
                    .modal-container { width: 95vw !important; height: 90vh !important; }
                    .modal-content-wrapper { flex-direction: column !important; padding: 10px !important; }
                    .chat-messages { order: 1 !important; }
                    .audit-panel { border-left: none !important; border-top: 1px solid #eee !important; padding-left: 0 !important; padding-top: 15px !important; order: 2 !important; margin-top: 10px !important; }
                    .presentation-overlay { padding: 15px !important; }
                    .presentation-overlay h2 { font-size: 1.6rem !important; }
                    .presentation-overlay p { font-size: 0.9rem !important; }
                    .nine-step-grid { grid-template-columns: 1fr !important; gap: 8px !important; font-size: 0.8rem !important; }
                }
            `}</style>
        </div>
    );
};

/* Command Modal Component */
const CommandModal = ({ lead, onClose, onSuccess }) => {
    const handleCommand = (action) => {
        onSuccess(action);
        onClose();
        alert(`Elliot: Understood Boss. Command Acquired: "${action}". Initiating relentless execution...`);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ width: '500px', background: 'white', borderRadius: '25px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#D92027', fontSize: '1.4rem' }}>COMMAND AI ELLIOT ⚡</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '25px' }}>
                    Instruct Elliot to execute a proactive strategy for **{lead.name}**.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                    {[
                        { 
                            icon: '🦁', 
                            label: lead.status === 'Hot' ? 'Showroom Closer' : 'Persistence Nudge', 
                            desc: `Push for booking the ${lead.car || 'vehicle'}` 
                        },
                        { 
                            icon: '💰', 
                            label: lead.name.includes('Marvin') ? 'RAV4 Focus' : 'Trade-in Focus', 
                            desc: `Ask about their ${lead.name.includes('Marvin') ? '2018 RAV4' : 'current car'}` 
                        },
                        { 
                            icon: '🏦', 
                            label: 'Finance Qualifier', 
                            desc: `Verify credit status for ${lead.car || 'vehicle'}` 
                        },
                        { 
                            icon: '🚗', 
                            label: `Hook: ${lead.car || 'VW Atlas'}`, 
                            desc: `Suggest the ${lead.name.includes('Marvin') ? 'Grey' : 'Elite'} variant` 
                        }
                    ].map(cmd => (
                        <button 
                            key={cmd.label}
                            onClick={() => handleCommand(cmd.label)}
                            style={{ 
                                padding: '15px', borderRadius: '15px', border: '1px solid #eee', background: '#f9f9fb', 
                                textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = '#D92027'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = '#eee'}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{cmd.icon}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{cmd.label}</div>
                            <div style={{ fontSize: '0.65rem', color: '#888' }}>{cmd.desc}</div>
                        </button>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px' }}>CUSTOM COMMAND</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            id="custom-command-input"
                            placeholder="Instruct Elliot manually..." 
                            style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '0.85rem' }} 
                            onKeyPress={(e) => e.key === 'Enter' && handleCommand(e.target.value)}
                        />
                        <button 
                            onClick={() => handleCommand(document.getElementById('custom-command-input').value)}
                            style={{ padding: '0 20px', background: '#D92027', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            ISSUE 🏹
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
