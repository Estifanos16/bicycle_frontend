import React, { createContext, useContext, useState, useEffect } from 'react';

const VendorContext = createContext(null);

export const VendorProvider = ({ children }) => {
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch vendor profile from API
  const fetchVendorProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vendor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor profile');
      }
      
      const data = await response.json();
      setVendorProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vendor profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor profile by slug (public storefront)
  const fetchVendorProfileBySlug = async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/vendor/public/${slug}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor profile');
      }
      
      const data = await response.json();
      setVendorProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vendor profile by slug:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save vendor profile to API
  const saveVendorProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save vendor profile');
      }
      
      const data = await response.json();
      setVendorProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error saving vendor profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!vendorProfile) return 0;
    
    let completed = 0;
    let total = 0;

    // Branding (40%)
    total += 40;
    if (vendorProfile.branding?.storeName) completed += 10;
    if (vendorProfile.branding?.storeCategory) completed += 10;
    if (vendorProfile.branding?.storeLogo) completed += 10;
    if (vendorProfile.branding?.storeBanner) completed += 10;

    // Operations (30%)
    total += 30;
    if (vendorProfile.operations?.phoneNumber) completed += 10;
    if (vendorProfile.operations?.supportEmail) completed += 10;
    if (vendorProfile.operations?.operatingHours) {
      const hasOperatingHours = Object.values(vendorProfile.operations.operatingHours).some(day => day.open);
      if (hasOperatingHours) completed += 10;
    }

    // Banking (30%)
    total += 30;
    if (vendorProfile.banking?.cbeAccounts?.length > 0 && vendorProfile.banking.cbeAccounts[0].accountNumber) completed += 7.5;
    if (vendorProfile.banking?.otherBankAccounts?.length > 0 && vendorProfile.banking.otherBankAccounts[0].accountNumber) completed += 7.5;
    if (vendorProfile.banking?.telebirrAccounts?.length > 0 && vendorProfile.banking.telebirrAccounts[0].phone) completed += 7.5;
    if (vendorProfile.banking?.otherWalletAccounts?.length > 0 && vendorProfile.banking.otherWalletAccounts[0].phone) completed += 7.5;

    return Math.round((completed / total) * 100);
  };

  // Get verification status
  const getVerificationStatus = () => {
    if (!vendorProfile) return 'Not Started';
    
    const hasTIN = vendorProfile.banking?.taxId;
    const hasDocument = vendorProfile.banking?.verificationDocument;
    
    if (hasTIN && hasDocument) {
      return vendorProfile.verified ? 'Verified' : 'Pending Verification';
    } else if (hasTIN || hasDocument) {
      return 'Incomplete';
    }
    
    return 'Not Started';
  };

  // Check if store is currently open based on operating hours
  const isStoreOpen = () => {
    if (!vendorProfile?.operations?.operatingHours) return false;
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const todayHours = vendorProfile.operations.operatingHours[currentDay];
    if (!todayHours?.open) return false;
    
    const openTime = parseInt(todayHours.openTime.split(':')[0]) * 60 + parseInt(todayHours.openTime.split(':')[1]);
    const closeTime = parseInt(todayHours.closeTime.split(':')[0]) * 60 + parseInt(todayHours.closeTime.split(':')[1]);
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  // Fetch profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !vendorProfile) {
      fetchVendorProfile();
    }
  }, []);

  const value = {
    vendorProfile,
    setVendorProfile,
    loading,
    error,
    fetchVendorProfile,
    fetchVendorProfileBySlug,
    saveVendorProfile,
    calculateProfileCompletion,
    getVerificationStatus,
    isStoreOpen
  };

  return (
    <VendorContext.Provider value={value}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
};
