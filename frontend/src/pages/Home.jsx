import React, { useState, useEffect } from 'react';

const Home = () => {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        // In a real app, this would fetch from http://localhost:8000/inventory
        // For the demo, we'll mock it here or use the mock data
        setInventory([
            { id: 1, make: "Toyota", model: "RAV4", year: 2022, price: 35000, mileage: 15000, image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=400", type: "SUV" },
            { id: 2, make: "Honda", model: "Civic", year: 2020, price: 22000, mileage: 45000, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400", type: "Sedan" },
            { id: 3, make: "Ford", model: "F-150", year: 2021, price: 48000, mileage: 30000, image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=400", type: "Truck" },
            { id: 4, make: "Hyundai", model: "Tucson", year: 2023, price: 32000, mileage: 5000, image: "https://images.unsplash.com/photo-1631630259742-c0f0b17c6c10?auto=format&fit=crop&q=80&w=400", type: "SUV" },
        ]);
    }, []);

    return (
        <div>
            <section className="hero">
                <div className="container">
                    <h1>Sherwood Park's Quality Used Cars</h1>
                    <p>Trust, Transparency, and the Best Value in Alberta. Find your next vehicle at FilCan Cars.</p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <a href="#inventory" className="btn btn-primary">Browse Inventory</a>
                        <a href="#" className="btn btn-secondary">Get Pre-Approved</a>
                    </div>
                </div>
            </section>

            <section id="inventory" className="inventory">
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Featured Inventory</h2>
                    <div className="inventory-grid">
                        {inventory.map(car => (
                            <div key={car.id} className="car-card">
                                <img src={car.image} alt={`${car.make} ${car.model}`} className="car-image" />
                                <div className="car-info">
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{car.year} {car.type}</div>
                                    <h3 style={{ margin: '5px 0' }}>{car.make} {car.model}</h3>
                                    <div className="car-price">${car.price.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#444' }}>{car.mileage.toLocaleString()} KM</div>
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '15px', fontSize: '0.9rem' }}>View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
