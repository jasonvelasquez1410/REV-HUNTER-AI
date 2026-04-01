import React, { useState } from 'react';
import { Rocket, Shield, Zap, BarChart3, Mail, CheckCircle2, ArrowRight, PlayCircle } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Simulate API call
      console.log("Waitlist signup:", email);
    }
  };

  return (
    <div className="revhunter-marketing" style={{ 
      background: '#0a0a0a', color: 'white', minHeight: '100vh', 
      fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' 
    }}>
      {/* Navigation */}
      <nav style={{ padding: '20px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, width: '100%', zIndex: 100, backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-1px' }}>
          REV<span style={{ color: '#D92027' }}>HUNTER</span> AI
        </div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <a href="#features" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem' }}>Features</a>
          <a href="#pricing" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</a>
          <button style={{ padding: '10px 25px', background: 'white', color: 'black', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '180px 5% 100px', textAlign: 'center', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(217,32,39,0.15) 0%, transparent 70%)',
          zIndex: 0, filter: 'blur(60px)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', marginBottom: '30px' }}>
            <span style={{ color: '#D92027' }}>●</span> NOW IN PRIVATE BETA FOR DEALERS
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '900', maxWidth: '900px', margin: '0 auto 30px', lineHeight: '1.1', letterSpacing: '-2px' }}>
            The Relentless <span style={{ background: 'linear-gradient(90deg, #D92027, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sales Engine</span> for Dealerships.
          </h1>
          <p style={{ fontSize: '1.4rem', color: '#888', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            Stop losing leads to slow response times. Our AI hunts, qualifies, and books appointments 24/7 with human-level intelligence.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button style={{ padding: '20px 45px', background: '#D92027', color: 'white', border: 'none', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 15px 30px rgba(217,32,39,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              JOIN THE WAITLIST <ArrowRight size={20} />
            </button>
            <button style={{ padding: '20px 45px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PlayCircle size={20} /> WATCH DEMO
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '100px 5%', background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px' }}>Built to Close.</h2>
          <p style={{ color: '#666' }}>Engineered for high-volume car sales environments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          {[
            { icon: Zap, title: "12s Response Time", desc: "Instantly engages every lead from Facebook, Google, or your website." },
            { icon: Shield, title: "Deep Lead DNA", desc: "Automated extraction of trade-in, credit, and budget info." },
            { icon: BarChart3, title: "ROI Dashboard", desc: "Real-time analytics showing exactly how many deals we influenced." }
          ].map((feature, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(217,32,39,0.1)', color: '#D92027', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                <feature.icon size={30} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>{feature.title}</h3>
              <p style={{ color: '#777', lineHeight: '1.6' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Case Study Teaser */}
      <section style={{ padding: '100px 5%' }}>
        <div style={{ background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)', borderRadius: '40px', padding: '80px', display: 'flex', alignItems: 'center', gap: '60px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#00b894', fontWeight: 'bold', marginBottom: '20px' }}>FILCAN CARS CASE STUDY</div>
            <h2 style={{ fontSize: '3rem', marginBottom: '30px', lineHeight: '1.2' }}>How FilCan Cars captured 150+ leads in 30 days.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>18%</div>
                <div style={{ color: '#aaa' }}>Appointment rate</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>$12K</div>
                <div style={{ color: '#aaa' }}>Reduced staffing costs</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#ccc', marginBottom: '30px' }}>
              "RevHunter AI completely changed our intake process. We're booking more appointments than ever, and our sales team only talks to people who are ready to buy."
            </p>
            <div style={{ fontWeight: 'bold' }}>Sales Manager, FilCan Cars</div>
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section style={{ padding: '100px 5%', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {!submitted ? (
            <>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Secure your territory.</h2>
              <p style={{ color: '#888', marginBottom: '40px' }}>We only partner with one dealer per 50km radius. Join the waitlist to lock in your area.</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Mail size={18} color="#666" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '20px' }} />
                  <input 
                    type="email" 
                    placeholder="Work Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ 
                      width: '100%', padding: '20px 20px 20px 55px', background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: 'white', fontSize: '1rem' 
                    }} 
                  />
                </div>
                <button type="submit" style={{ padding: '0 40px', background: '#D92027', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>JOIN WAITLIST</button>
              </form>
            </>
          ) : (
            <div style={{ padding: '60px', background: 'rgba(0,184,148,0.1)', borderRadius: '30px', border: '1px solid #00b894' }}>
              <CheckCircle2 size={60} color="#00b894" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>You're on the list!</h3>
              <p style={{ color: '#00b894' }}>We'll reach out soon to discuss your territory activation.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 5% 40px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#444' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>© 2026 REVHUNTER AI. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '40px' }}>
            <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#444', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
