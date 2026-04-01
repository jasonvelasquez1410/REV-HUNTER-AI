import React, { useState } from 'react';
import { Search, Sparkles, Copy, CheckCircle } from 'lucide-react';

export default function SEOModule({ tenant }) {
    const [topic, setTopic] = useState('');
    const [location, setLocation] = useState('Sherwood Park');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState('');
    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/seo-generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenant?.id || 'filcan' },
                body: JSON.stringify({ topic, location })
            });
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({ title_tag: `Best ${topic} in ${location}`, meta_description: `Find ${topic} at FilCan Cars`, h1: topic, blog_snippet: 'Demo mode active.', keywords: [topic, location] });
        }
        setLoading(false);
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)', padding: '30px', borderRadius: '25px', color: 'white' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={24} /> REVHUNTER GROWTH ENGINE
                </h2>
                <p style={{ opacity: 0.7, marginTop: '8px' }}>AI-powered SEO content generation for automotive dealerships.</p>
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                    <input
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="e.g. 2024 VW Atlas, Used SUVs, Trade-In..."
                        style={{ flex: 2, padding: '15px 20px', borderRadius: '12px', border: 'none', fontSize: '1rem', background: 'rgba(255,255,255,0.15)', color: 'white' }}
                    />
                    <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Location"
                        style={{ flex: 1, padding: '15px 20px', borderRadius: '12px', border: 'none', fontSize: '1rem', background: 'rgba(255,255,255,0.15)', color: 'white' }}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !topic}
                        style={{ padding: '15px 30px', background: loading ? '#555' : '#D92027', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Search size={18} /> {loading ? 'GENERATING...' : 'GENERATE SEO KIT'}
                    </button>
                </div>
            </div>

            {result && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {[
                        { label: 'Title Tag', value: result.title_tag, field: 'title', color: '#003366' },
                        { label: 'Meta Description', value: result.meta_description, field: 'meta', color: '#D92027' },
                        { label: 'H1 Headline', value: result.h1, field: 'h1', color: '#00b894' },
                        { label: 'Keywords', value: (result.keywords || []).join(', '), field: 'kw', color: '#6c5ce7' }
                    ].map(item => (
                        <div key={item.field} style={{ background: 'white', padding: '20px', borderRadius: '15px', borderLeft: `4px solid ${item.color}`, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>{item.label}</span>
                                <button onClick={() => copyToClipboard(item.value, item.field)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === item.field ? '#00b894' : '#999' }}>
                                    {copied === item.field ? <CheckCircle size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{item.value}</div>
                        </div>
                    ))}

                    <div style={{ gridColumn: '1 / -1', background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>AI Blog Snippet</span>
                            <button onClick={() => copyToClipboard(result.blog_snippet, 'blog')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'blog' ? '#00b894' : '#999' }}>
                                {copied === 'blog' ? <CheckCircle size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p style={{ lineHeight: 1.8, color: '#444', fontSize: '0.95rem' }}>{result.blog_snippet}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
