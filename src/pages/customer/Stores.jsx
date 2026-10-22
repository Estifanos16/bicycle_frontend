import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVendors } from '../../services/api';
import { useCart } from '../../context/CartContext';

const Stores = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await getVendors();
        // Filter only approved vendors
        const approvedVendors = (response.data || []).filter(vendor => vendor.isApproved !== false);
        setVendors(approvedVendors);
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
        setError('Unable to load stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  // Helper function to get branding data (from vendor or from ownerId)
  const getBranding = (vendor) => {
    return vendor.branding || vendor.ownerId?.branding || {};
  };

  // Helper function to get operations data (from vendor or from ownerId)
  const getOperations = (vendor) => {
    return vendor.operations || vendor.ownerId?.operations || {};
  };

  const handleBrowseStore = (vendor) => {
    // Check if cart has items from a different store
    if (cart.length > 0) {
      const currentVendorId = cart[0].supermarketId?._id || cart[0].supermarketId || cart[0].vendorId?._id || cart[0].vendorId;
      const newVendorId = vendor._id || vendor.id;

      if (currentVendorId && currentVendorId !== newVendorId) {
        const currentVendorName = cart[0].supermarketId?.name || cart[0].vendorId?.name || 'your current store';
        const branding = getBranding(vendor);
        const storeName = branding.storeName || vendor.name || 'this store';
        const confirmClear = window.confirm(
          `Your cart contains items from ${currentVendorName}. Clear cart and start a new order with ${storeName}?`
        );

        if (confirmClear) {
          clearCart();
          navigate(`/products?vendorId=${newVendorId}`);
        }
        return;
      }
    }

    // Navigate to products filtered by vendor
    const vendorId = vendor._id || vendor.id;
    navigate(`/products?vendorId=${vendorId}`);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Loading stores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#DC2626' }}>{error}</p>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>No Stores Available</h2>
        <p className="muted">There are no approved stores available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h2>Browse Stores</h2>
        <p>Select a store to browse their products and place an order.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 320px))',
        gap: '24px',
        justifyContent: 'center'
      }}>
        {vendors.map((vendor) => {
          const branding = getBranding(vendor);
          const operations = getOperations(vendor);
          const storeName = branding.storeName || vendor.name || 'Store';
          const storeLogo = branding.storeLogo || vendor.logoUrl || vendor.logo;
          const storeBanner = branding.storeBanner;
          const storeCategory = branding.storeCategory;
          const address = [
            operations.streetAddress || vendor.address?.street,
            operations.city || vendor.address?.city,
            operations.region || vendor.address?.state
          ]
            .filter(Boolean)
            .join(', ') || 'Address not available';
          const deliveryFee = operations.deliveryFee !== undefined ? `ETB ${operations.deliveryFee.toFixed(2)}` : 'Free delivery';

          return (
            <div
              key={vendor._id || vendor.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
            >
              {/* Store Banner */}
              {storeBanner && (
                <div
                  style={{
                    width: '100%',
                    height: '120px',
                    backgroundImage: `url(${storeBanner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-30px',
                      left: '16px',
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    {storeLogo ? (
                      <img
                        src={storeLogo}
                        alt={storeName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#F3F4F6',
                          color: '#6B7280',
                          fontSize: '1.5rem',
                          fontWeight: '600'
                        }}
                      >
                        {storeName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!storeBanner && (
                <div style={{ padding: '16px 16px 0 16px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#F3F4F6',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {storeLogo ? (
                      <img
                        src={storeLogo}
                        alt={storeName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          color: '#6B7280',
                          fontSize: '1.5rem',
                          fontWeight: '600'
                        }}
                      >
                        {storeName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Store Info */}
              <div style={{ padding: '40px 16px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1F2937' }}>
                  {storeName}
                </h3>

                {storeCategory && (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      backgroundColor: '#FFF5F0',
                      color: '#FF5500',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      marginBottom: '12px',
                      width: 'fit-content'
                    }}
                  >
                    {storeCategory}
                  </span>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>
                    <span>📍</span>
                    <span>{address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6B7280' }}>
                    <span>🚚</span>
                    <span>{deliveryFee}</span>
                  </div>
                </div>

                {branding.businessBio && (
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: '#6B7280',
                      lineHeight: '1.5',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1
                    }}
                  >
                    {branding.businessBio}
                  </p>
                )}

                <button
                  onClick={() => handleBrowseStore(vendor)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#FF5500',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#E64D00'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#FF5500'}
                >
                  Browse Store
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stores;
