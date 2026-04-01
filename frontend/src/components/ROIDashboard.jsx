import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { TrendingUp, Users, Target, PhoneCall, DollarSign, Clock, Share2 } from 'lucide-react';

const MOCK_ANALYTICS = {
  trends: [
    { name: 'Week 1', leads: 45, qualified: 22, appointments: 12 },
    { name: 'Week 2', leads: 52, qualified: 28, appointments: 15 },
    { name: 'Week 3', leads: 68, qualified: 41, appointments: 24 },
    { name: 'Week 4', leads: 95, qualified: 62, appointments: 38 },
  ],
  sources: [
    { name: 'Facebook Ads', value: 450, color: '#1877F2' },
    { name: 'Google Ads', value: 320, color: '#DB4437' },
    { name: 'Direct Website', value: 180, color: '#003366' },
  ],
  kpis: [
    { label: 'Total Leads', value: '1,045', icon: Users, trend: '+24%', color: '#003366' },
    { label: 'Qualified (DNA)', value: '642', icon: Target, trend: '+32%', color: '#00b894' },
    { label: 'Appointments', value: '184', icon: PhoneCall, trend: '+45%', color: '#D92027' },
    { label: 'Est. Revenue', value: '$84.5K', icon: DollarSign, trend: '+18%', color: '#8e44ad' },
  ]
};

export default function ROIDashboard() {
  return (
    <div className="roi-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {MOCK_ANALYTICS.kpis.map((kpi, i) => (
          <div key={i} style={{ 
            background: 'white', padding: '25px', borderRadius: '24px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', 
            flexDirection: 'column', gap: '10px', position: 'relative', overflow: 'hidden' 
          }}>
            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05 }}>
              <kpi.icon size={80} color={kpi.color} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <kpi.icon size={18} color={kpi.color} /> {kpi.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#333' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#00b894', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={14} /> {kpi.trend} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* Main Growth Chart */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h3 style={{ margin: 0, color: '#003366' }}>Lead Conversion Funnel 📈</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#666' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#003366' }} /> Raw Leads
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#666' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00b894' }} /> Qualified
              </div>
            </div>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ANALYTICS.trends}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003366" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00b894" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00b894" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#003366" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="qualified" stroke="#00b894" strokeWidth={3} fillOpacity={1} fill="url(#colorQualified)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Breakdown */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '30px', color: '#003366' }}>Lead Sources 🎯</h3>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_ANALYTICS.sources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MOCK_ANALYTICS.sources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {MOCK_ANALYTICS.sources.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#333', fontWeight: 'bold' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} /> {s.name}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>{Math.round((s.value / 950) * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics Table */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '25px', color: '#003366' }}>Relentless Performance Audit</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#999', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '15px' }}>Metric</th>
                <th style={{ padding: '15px' }}>Target</th>
                <th style={{ padding: '15px' }}>Actual</th>
                <th style={{ padding: '15px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { m: 'Avg AI Response Time', t: '< 30s', a: '12s', s: 'OPTIMAL' },
                { m: 'Lead DNA Completion Rate', t: '75%', a: '82%', s: 'EXCEEDING' },
                { m: 'Showroom Booking Rate', t: '15%', a: '18.4%', s: 'ELITE' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i === 2 ? 'none' : '1px solid #f8f9fa' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold', fontSize: '0.9rem' }}>{row.m}</td>
                  <td style={{ padding: '15px', color: '#666' }}>{row.t}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{row.a}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      background: '#e6f4ea', color: '#1e7e34', 
                      padding: '4px 12px', borderRadius: '20px', 
                      fontSize: '0.7rem', fontWeight: 'bold' 
                    }}>{row.s}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
