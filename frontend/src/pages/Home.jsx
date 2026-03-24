import React from 'react';
import { useTenant } from '../context/TenantContext';

const Home = () => {
    const { tenant } = useTenant();

    return (
        <div className="home-container">
            <section className="hero" style={{ 
                background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '120px 0',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '900' }}>
                        {tenant.name.toUpperCase()}
                    </h1>
                    <p style={{ fontSize: '1.5rem', marginBottom: '40px', opacity: 0.9 }}>
                        {tenant.location}'s Premier Destination for Quality Pre-Owned Vehicles.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <button className="btn btn-primary" style={{ backgroundColor: tenant.theme_color }}>Browse Inventory</button>
                        <button className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Get Trade-In Value</button>
                    </div>
                </div>
            </section>

            <section className="inventory-preview" style={{ padding: '80px 0' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem' }}>Featured Inventory</h2>
                    <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        {[
                            { name: "2021 Ford F-150 Lariat", price: "$54,900", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
                            { name: "2020 Honda CR-V Hybrid", price: "$32,500", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
                            { name: "2019 Tesla Model 3 Long Range", price: "$38,900", image: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }
                        ].map((car, idx) => (
                            <div key={idx} className="car-card" style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                                <div style={{ height: '200px', backgroundImage: `url(${car.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ marginBottom: '10px' }}>{car.name}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: tenant.theme_color }}>{car.price}</span>
                                        <button style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: '#eee', cursor: 'pointer' }}>View Details</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="about" style={{ padding: '80px 0', backgroundColor: '#f9f9f9' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Why Choose {tenant.name}?</h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#666', marginBottom: '30px' }}>
                            At {tenant.name}, we believe in transparency and community. Serving the {tenant.location} area for years, we've built our reputation on providing high-quality vehicles and exceptional customer service.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#00b894', fontWeight: 'bold' }}>✓</span> Fully Inspected Vehicles
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#00b894', fontWeight: 'bold' }}>✓</span> $0 Down Financing Options
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#00b894', fontWeight: 'bold' }}>✓</span> Top Dollar for Your Trade-In
                            </li>
                        </ul>
                    </div>
                    <div style={{ flex: 1, height: '400px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <img src="https://images.unsplash.com/photo-1562519819-016930ada31b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Dealership" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
