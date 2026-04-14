# RevHunter AI - Project State (Rjay's Mobile Dashboard)

## 📌 Project Status: **LAUNCH READY**
The standalone "Plan B" mobile dashboard for independent sales agents (specifically Rjay) is feature-complete and deployed to Vercel production.

### **🔑 Access Credentials**
- **Admin HQ URL:** [https://rev-hunter-ai.vercel.app/](https://rev-hunter-ai.vercel.app/) (PIN: `1410`)
- **Agent Dashboard:** [https://rev-hunter-ai.vercel.app/agent](https://rev-hunter-ai.vercel.app/agent) (PIN: `2024` for Demo / `2026` for R-Jay)
- **Login Requirements:** Admin requires PIN only. Agent requires Name + PIN.

---

## 🚀 Key Features Implemented
### **1. AI Persona & Voice**
- **Voice Identity:** Switched to **"Adam"** (Professional American Male) for both the browser Strategist ⚡ and the Outbound Vapi calls.
- **Personalized Intro:** Elliot now introduces himself as the assistant for the logged-in agent (e.g., *"Hi, I'm Elliot, the digital assistant for Rjay..."*).
- **Strategist Mode:** Global ⚡ icon in the header allows agents to ask for status updates and hot lead summaries.

### **2. Lead DNA Command Center**
- **Objective-Based Dialing:** Agents can select a **Call Objective** (Qualify & Book, Get Budget, Ask Trade-In, Follow Up) before triggering a call.
- **DNA Profile:** Detailed lead view showing Vehicle Interest, Trade-In specs, Credit Score, and Budget at a glance.
- **Full Call History:** Integrated recording player and transcript logs.

### **3. Operational Control & Onboarding**
- **Mission Control UI:** Replaced empty states with a guided 3-step "Rocket Launch" checklist (Import -> Sync -> Dial).
- **Proactive Briefing:** Adam now greets empty pipelines with a voice instruction: *"Welcome, boss. I'm Adam..."*
- **Manual Lead Entry:** Added a "+ DIRECT ADD" modal for quick, one-off lead entry without CSVs.
- **Hygiene Controls:** Added individual 'Delete Lead' and 'Clear All' (Global Wipe) buttons for testing and pipeline management.
- **Empty State Awareness:** Elliot now guides the user to import leads if the list is empty, rather than showing technical errors.

---

## 🛠️ Technical Context (Backend/API)
- **Framework:** FastAPI (Python) + React (Vite/PWA).
- **AI Logic:** `api/ai_logic.py` handles the strategist fallbacks and lead scoring.
- **Vapi Integration:** `api/index.py` handles the specialized `engagement/outbound-call` route with Assistant Overrides (Adam voice + Custom prompts).
- **Deployment:** Vercel production (`rev-hunter-ai.vercel.app`).
- **WEDNESDAY GOAL:** Live Google Meet Presentation for FilCan Cars management. Focus on "One-Thumb" ease and $20/lead ROI.

#### **Wednesday Demo Features (NEW)**
- **Demo Hydration:** A "Hydrate Pipeline" button to instantly populate the dashboard with high-quality demo leads.
- **ROI Integration:** A dedicated view showing the business case and cost-per-lead breakdown.
- **Assistant Personalization:** Live demonstration of naming the AI (e.g. "Jarvis") and triggering a call.

---
**Last Updated:** 2026-04-14 09:30 AM
- **Status**: **STABLE & STEALTH** (FilCan Presentation Ready) 🚀
- **Target**: FilCan Cars (Tomorrow's Demo)
- **Recently Completed**: Build Crash Fix (Brackets/Redeclarations), ELLIOT AI Header Label, Admin PIN 1410 update, Repository Sanitization.

---

# 🚀 Filcan Cars x RevHunter AI: Partnership Proposal (Tuesday Presentation)

## 🛑 SLIDE 1: The Current Dealership Problem
**Headline:** *Great Traffic, Leaky Funnel.*
* **The Issue:** Dealerships spend thousands on ads, but humans can't respond to incoming leads 24/7 or follow up instantly. Leads get cold, and money is wasted.
* **The RevHunter Solution:** An end-to-end ecosystem where we generate the traffic, and our AI (Elliot) instantly intercepts, qualifies, and books the lead while your agents sleep.

*💬 **Speaking Note:** "Mr. Manager, our goal isn't just to sell you software. We are bringing a complete ecosystem. We run the Google/Facebook Ads to generate the hype, and our AI catches every single lead those ads produce."*

---

## 🤖 SLIDE 1.5: The 4 AI Superpowers (Your Digital Staff)
**Headline:** *One System. Four Elite Specialists.*
* **1. The Receptionist:** 24/7 Intelligent Greeting. Never misses a DM or a comment on Marketplace.
* **2. The Sales Agent:** Follows a battle-tested 9-step script. Knows how to isolate budget, credit, and trade-ins.
* **3. The Marketing Manager:** AI-generated ad copy and high-converting Marketplace posts based on your live inventory.
* **4. The Admin Assistant (Elliot Ops):** Voice-activated operational control for managers. "Book a test drive," "Appraise this trade-in," or "Show me the ROI."

---

---

## 📱 SLIDE 2: The Two-Tier Software Ecosystem
**Headline:** *Total Control for Management, Lightning Speed for Agents.*

**1. The Manager Admin HQ (Premium Version)**
* The Dealership "Bird's-Eye View".
* Tracks total ROAS (Return on Ad Spend), pipeline value, and AI booking rates.
* Monitor exactly which agents are closing the deals Elliot tees up for them.

**2. The RevHunter "Agent OS" (Standalone Mobile Version)**
* A turn-key, one-thumb "Pocket CRM" built for individual hustlers (like Rjay).
* Allows agents to upload their own personal leads and trigger Elliot to call them simultaneously. 
* Features native deep-linking to easily bypass API restrictions and post directly to their personal Facebook Marketplace.

*💬 **Speaking Note:** "You get the ultimate master dashboard to watch the dealership's ROI grow, while your individual salespeople get a standalone mobile weapon that does the heavy prospecting for them."*

---

## 🎯 SLIDE 3: The "Qualified Lead" Guarantee
**Headline:** *You don't pay for clicks. You pay for qualified buyers.*
* Unlike traditional marketing agencies that charge you just to run ads, our model is 100% performance-based.
* **We fund the ad budget:** RevHunter (Rjay & Team) handles 100% of the Big Tech ad spend. 
* You only pay exactly **$20 per AI-Qualified Lead**.

**What defines a "Qualified Lead"?**
Before we ever charge you $20, Elliot the AI must extract and verify a 3-Step Profile:
1. **Verified Contact:** Real Name & Working Phone Number.
2. **Confirmed Intent:** Customer explicitly states they are looking to buy or trade-in within 30 days.
3. **Financial/Trade Data:** Customer provides their estimated credit score, budget, or trade-in vehicle details.
    *   *System Note:* Our AI connects to **vAuto / CBB** for instant appraisals and **DealerTrack** logic for credit tier isolation during the live chat.

*💬 **Speaking Note:** "If we send you a dead phone number or someone who isn't buying, it costs you nothing. Elliot will not bill you a dime until he successfully extracts a real phone number, confirms their buying intent, and gets their credit or trade-in profile. We are that confident in our traffic."*

---

## 📈 SLIDE 4: The 100-Lead Scenario (ROI Projection)
**Headline:** *Risk-Free Scaling.*
* If we deliver **100 Qualified Leads** in a month = **$2,000 Invoice.**
* Assuming an ultra-conservative 10% close rate on highly-qualified leads = **10 Cars Sold.**
* Average gross vehicle profit = *$3,000+ per car.*
* **Total Dealership Gross:** $30,000+
* **Cost of RevHunter Leads:** $2,000 (Over a 15x Return on Investment).

*💬 **Speaking Note:** "If we bill you $2,000 at the end of the month, you should be thrilled, because it means we handed your sales floor 100 warm, pre-vetted, credit-qualified buyers."*

---

## 🤝 SLIDE 5: Next Steps & Launch
**Headline:** *Let's Turn on the Machine.*
1. **Confirm the Definition:** Finalize the "Qualified Lead" criteria today so we are aligned.
2. **Activate Campaigns:** We route our Google Ads/SEO traffic directly into the RevHunter engine.
3. **Onboard the Team:** We give your agents access to their Mobile OS so they can start catching the pitches Elliot throws them.

*💬 **Speaking Note:** "To make this a no-brainer for you, what exactly do your sales guys need to know about a customer before they run to the lot? Tell us, and we will program Elliot to demand that exact information before creating a billable lead."*
