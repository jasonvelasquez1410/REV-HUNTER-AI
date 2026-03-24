import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
    const [tenant, setTenant] = useState({
        id: 'filcan',
        name: 'FilCan Cars',
        location: 'Sherwood Park',
        address: '983 Fir Street',
        welcome_message: "Welcome to FilCan Cars! I'm your digital receptionist. I'd love to help you find the perfect vehicle. What brings you in today?",
        theme_color: '#003366'
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
                // You could detect tenant from URL subdomain or a query param
                // For now, we default to 'filcan' but we could make it dynamic
                const response = await fetch(`${apiUrl}/tenant-config`, {
                    headers: { 'X-Tenant-Id': 'filcan' }
                });
                const data = await response.json();
                setTenant(data);
            } catch (error) {
                console.error("Failed to fetch tenant config:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return (
        <TenantContext.Provider value={{ tenant, setTenant, loading }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
