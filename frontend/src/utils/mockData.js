import React from 'react';

export const MOCK_AGENTS = [
    { id: 'agent-1', name: "Sarah Johnson", role: "Senior Closer", status: "Online", avatar: "SJ", color: "#6c5ce7", closing_rate: "98%", deals_this_month: 24 },
    { id: 'agent-2', name: "Mike Miller", role: "SUV Specialist", status: "On Call", avatar: "MM", color: "#e67e22", closing_rate: "89%", deals_this_month: 18 },
    { id: 'agent-3', name: "Elliot (AI)", role: "Digital Assistant", status: "Hunting", avatar: "🤖", color: "#D92027", closing_rate: "N/A", deals_this_month: "142 Leads Qualified" }
];

export const MOCK_FALLBACK_LEADS = [
    { id: 101, name: "Marvin Raymundo", status: "Hot", car: "VW Atlas", quality_score: 98, follow_up_streak: 2, conversation_state: '{"step": 5}', conversation_summary: "Interested in VW Atlas. Trade-in: 2018 RAV4. Credit: PRE-APPROVED.", last_action_time: "Today 10:45 AM", credit_status: "PRE-APPROVED", source: "OMNICHANNEL (Web+FB+Voice)", assigned_to: 'agent-3' },
    { id: 102, name: "Jessica Chen", status: "Qualified", car: "Mazda CX-5", quality_score: 85, follow_up_streak: 1, conversation_state: '{"step": 3}', conversation_summary: "Looking for family SUV. CX-5 vs Atlas.", last_action_time: "Today 9:15 AM", source: "Facebook Messenger", assigned_to: null }
];

export const MOCK_CHATS = {
    101: [
        { sender: 'customer', text: "Hi, I saw your post about the 2024 VW Atlas. Is it still available?", time: "10:45 AM" },
        { sender: 'ai', text: "Hi Marvin! 👋 Yes, we have two 2024 Atlas units in stock: a Platinum-Grey and an Aurora-Red. Which one catches your eye? I'm the Digital Sales Specialist for FilCan Cars, here to help!", time: "10:46 AM" },
        { sender: 'customer', text: "The Grey one looks great. What's the monthly payment roughly?", time: "10:50 AM" },
        { sender: 'ai', text: "Great choice! The Atlas is perfect for families. Based on today's rates, we can get you into that for around $650/mo with your trade-in. Speaking of which, how is that 2018 RAV4 holding up?", time: "10:51 AM" },
        { sender: 'customer', text: "It's fine. Just 80k km.", time: "10:55 AM" },
        { sender: 'ai', text: "Hey Marvin, just following up! 🏆 I just ran a preliminary appraisal on your RAV4 and it might be worth more than you think. Want me to send the numbers?", time: "12:51 PM", isNudge: true }
    ],
    102: [
        { sender: 'customer', text: "Looking for a family SUV. Not sure between CX-5 and Atlas.", time: "9:15 AM" },
        { sender: 'ai', text: "Hi Jessica! Both are excellent. The CX-5 is sportier, while the Atlas offers way more interior space for the family. Do you need the extra 3rd-row seating?", time: "9:16 AM" }
    ]
};

export const MOCK_APPOINTMENTS = [
    { id: 1, lead: "Marvin Raymundo", car: "2024 VW Atlas", time: "Mon 2:00 PM", status: "CONFIRMED" },
    { id: 2, lead: "Jessica Chen", car: "Mazda CX-5", time: "Tue 10:30 AM", status: "AI BOOKED" },
    { id: 3, lead: "Tony Stark", car: "F-150 Lightning", time: "Wed 4:00 PM", status: "PENDING" }
];

export const PRESENTATION_INSIGHTS = {
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
