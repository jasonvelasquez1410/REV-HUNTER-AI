import React, { useState, useEffect } from 'react';
import ChatWidget from '../components/ChatWidget';
import { useTenant } from '../context/TenantContext';

const LandingPageDemo = () => {
    const { tenant } = useTenant();
    const [cars, setCars] = useState([]);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || '/api';
                const response = await fetch(`${apiUrl}/inventory`, {
                    headers: { 'X-Tenant-Id': tenant.id }
                });
                const data = await response.json();
                setCars(data);
            } catch (error) {
                console.error("Failed to fetch cars:", error);
            }
        };
        if (tenant) fetchCars();
    }, [tenant]);

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <header style={{ 
                backgroundColor: '#000', 
                color: '#fff', 
                padding: '15px 5%', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '5px', borderRadius: '4px' }}>
                        <span style={{ color: tenant.theme_color || '#D92027', fontWeight: '900', fontSize: '1.2rem' }}>
                            {tenant.name.split(' ').map(w => w[0]).join('')}
                        </span>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{tenant.name.toUpperCase()}</div>
                        <div style={{ fontSize: '0.6rem', color: '#aaa' }}>POWERED BY REVHUNTER AI</div>
                    </div>
                </div>
                <nav style={{ display: 'flex', gap: '25px', fontSize: '0.9rem', fontWeight: '600' }}>
                    <span>INVENTORY</span>
                    <span>FINANCING</span>
                    <span>TRADE-IN</span>
                    <span>ABOUT</span>
                </nav>
                <div style={{ color: tenant.theme_color || '#D92027', fontWeight: 'bold' }}>587.860.1770</div>
            </header>

            {/* Hero Section */}
            <section style={{ 
                height: '500px', 
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.themes.mazda.ca/2024/02/05/1707153401763_2024-mazda-cx-5-hero-mobile.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px' }}>YOUR DRIVE, REIMAGINED.</h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '30px' }}>Premium pre-owned vehicles in {tenant.location}. Approved financing for every credit level.</p>
                <button style={{ 
                    backgroundColor: tenant.theme_color || '#D92027', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '15px 40px', 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>SEARCH INVENTORY</button>
            </section>

            {/* Content & Inventory */}
            <div style={{ padding: '60px 5%', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px' }}>
                {/* Search Bar & Filters */}
                <aside>
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '15px', borderLeft: `4px solid ${tenant.theme_color || '#D92027'}`, paddingLeft: '10px' }}>SEARCH</h3>
                        <input type="text" placeholder="Year, Make, Model..." style={{ width: '100%', padding: '10px', border: '1px solid #ddd' }} />
                    </div>
                </aside>

                {/* Grid */}
                <main>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                        {cars.map(car => (
                            <div key={car.id} style={{ border: '1px solid #eee', transition: 'box-shadow 0.3s' }} className="car-card">
                                <img src={car.image} alt={car.model} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                <div style={{ padding: '20px' }}>
                                    <div style={{ fontSize: '0.8rem', color: tenant.theme_color || '#D92027', fontWeight: 'bold' }}>{car.year}</div>
                                    <h3 style={{ margin: '5px 0', fontSize: '1.2rem' }}>{car.make} {car.model}</h3>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '900', margin: '15px 0' }}>${car.price.toLocaleString()}</div>
                                    <button style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold' }}>VIEW DETAILS</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Omni Hunter Widget */}
            <ChatWidget />
        </div>
    );
};

export default LandingPageDemo;
