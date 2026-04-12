# RevHunter AI - Project State (Rjay's Mobile Dashboard)

## 📌 Project Status: **LAUNCH READY**
The standalone "Plan B" mobile dashboard for independent sales agents (specifically Rjay) is feature-complete and deployed to Vercel production.

### **🔑 Access Credentials**
- **Deployment URL:** [https://rev-hunter-ai.vercel.app/agent](https://rev-hunter-ai.vercel.app/agent)
- **Access PIN:** `2026`
- **Login Requirements:** Agent Name + PIN (New feature: name is saved to personalize the dashboard and AI calls).

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

### **3. Operational Control**
- **Manual Import:** Tap 'Import' to load lead lists from CSV/Excel or manual entry for standalone field usage.
- **Hygiene Controls:** Added individual 'Delete Lead' and 'Clear All' (Global Wipe) buttons for testing and pipeline management.
- **Empty State Awareness:** Elliot now guides the user to import leads if the list is empty, rather than showing technical errors.

---

## 🛠️ Technical Context (Backend/API)
- **Framework:** FastAPI (Python) + React (Vite/PWA).
- **AI Logic:** `api/ai_logic.py` handles the strategist fallbacks and lead scoring.
- **Vapi Integration:** `api/index.py` handles the specialized `engagement/outbound-call` route with Assistant Overrides (Adam voice + Custom prompts).
- **Deployment:** Vercel (Production) - `rev-hunter-ai.vercel.app`.

---

## 🎯 Next Steps for Resumption
1. **Live Field Testing:** Monitor Rjay's first batch of imports and triggered calls.
2. **Vapi Credit Monitoring:** Ensure the account balance is healthy for outbound spikes.
3. **Marketplace Integration:** Refine the "Sync Inventory" logic for Facebook Marketplace automation.
4. **Agent Feedback:** Iterate based on Rjay's "one-thumb" experience in the dealership.

---
**Last Updated:** 2026-04-12 11:00 PM
**Status:** Ready for Tuesday Presentation.

---

# 🚀 Filcan Cars x RevHunter AI: Partnership Proposal (Tuesday Presentation)

## 🛑 SLIDE 1: The Current Dealership Problem
**Headline:** *Great Traffic, Leaky Funnel.*
* **The Issue:** Dealerships spend thousands on ads, but humans can't respond to incoming leads 24/7 or follow up instantly. Leads get cold, and money is wasted.
* **The RevHunter Solution:** An end-to-end ecosystem where we generate the traffic, and our AI (Elliot) instantly intercepts, qualifies, and books the lead while your agents sleep.

*💬 **Speaking Note:** "Mr. Manager, our goal isn't just to sell you software. We are bringing a complete ecosystem. We run the Google/Facebook Ads to generate the hype, and our AI catches every single lead those ads produce."*

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
* We only charge **$20 per AI-Qualified Lead**.

**What defines a "Qualified Lead"?**
Before we ever charge you $20, Elliot the AI must extract and verify a 3-Step Profile:
1. **Verified Contact:** Real Name & Working Phone Number.
2. **Confirmed Intent:** Customer explicitly states they are looking to buy or trade-in within 30 days.
3. **Financial/Trade Data:** Customer provides their estimated credit score, budget, or trade-in vehicle details.

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
