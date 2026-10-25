import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getUserBankingInfo } from '../../services/api';

// Fix for default marker icon in Leaflet (safe initialization)
try {
  if (typeof window !== 'undefined' && typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
} catch (err) {
  console.warn('Leaflet icon initialization failed:', err);
}

// Separate map component using native Leaflet for reliable cleanup
function DeliveryMap({ location, onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Small delay to ensure container has proper dimensions
    const timer = setTimeout(() => {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current, {
          scrollWheelZoom: true,
          wheelDebounceTime: 150,
          wheelPxPerZoomLevel: 200,
          zoomControl: true,
          doubleClickZoom: false,
          touchZoom: true,
          boxZoom: false,
          keyboard: false,
          dragging: true,
          inertia: true,
          inertiaDeceleration: 5000,
          inertiaMaxSpeed: 1000,
          zoomSnap: 0.25
        }).setView(location || [11.5890, 37.3908], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
          minZoom: 10
        }).addTo(mapInstanceRef.current);

        // Add initial marker
        markerRef.current = L.marker(location).addTo(mapInstanceRef.current);

        // Handle map clicks
        mapInstanceRef.current.on('click', (e) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
          }
          if (onLocationSelect) onLocationSelect([lat, lng]);
        });

        // Force map to invalidate size and redraw
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            setMapReady(true);
          }
        }, 100);
      }
    }, 100);

    // Cleanup function on unmount to completely destroy map instance and clear container
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when location changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && location && mapReady) {
      markerRef.current.setLatLng(location);
      mapInstanceRef.current.setView(location, 13);
      mapInstanceRef.current.invalidateSize();
    }
  }, [location, mapReady]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '8px', zIndex: 0, position: 'relative' }} />;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, placeOrder, clearCart } = useCart();
  const { user } = useAuth();

  const [location, setLocation] = useState([11.5890, 37.3908]); // Bahir Dar, Ethiopia
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [vendorLoading, setVendorLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch vendor data to get their payment methods
  useEffect(() => {
    const fetchVendor = async () => {
      if (cart && cart.length > 0) {
        const ownerId = cart[0].product.supermarketId?._id || cart[0].product.supermarketId || cart[0].product.vendorId?._id || cart[0].product.vendorId;
        if (ownerId) {
          setVendorLoading(true);
          try {
            const response = await getUserBankingInfo(ownerId);
            setVendor(response.data);
          } catch (err) {
            console.error('Failed to fetch vendor:', err);
          } finally {
            setVendorLoading(false);
          }
        }
      }
    };
    fetchVendor();
  }, [cart]);

  // Calculate totals with safe checks
  const subtotal = (cart || []).reduce((sum, item) => {
    const price = Number(item?.product?.price || item?.variant?.price || 0);
    const quantity = Number(item?.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
  const deliveryFee = 50; // Fixed delivery fee in ETB
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + deliveryFee + serviceFee;

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        // Auto-fill form fields
        setAddress(addr.road || addr.street || addr.building || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setCity(addr.city || addr.town || addr.suburb || addr.county || addr.district || '');
        return true;
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
      // Fallback to coordinates if geocoding fails
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
    return false;
  };

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setUseCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (latitude && longitude) {
          setLocation([latitude, longitude]);
          await reverseGeocode(latitude, longitude);
        }
        setUseCurrentLocation(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setUseCurrentLocation(false);
        console.error('Geolocation error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleLocationSelect = async (coords) => {
    if (coords && coords.length === 2) {
      setLocation(coords);
      await reverseGeocode(coords[0], coords[1]);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const fullAddress = `${address}, ${city}${instructions ? ', ' + instructions : ''}`;
    const deliveryLocation = {
      type: 'Point',
      coordinates: [location[1], location[0]], // GeoJSON uses [lng, lat]
    };

    const result = await placeOrder({
      deliveryAddress: fullAddress,
      deliveryLocation,
      paymentMethod,
    });

    setLoading(false);

    if (result.success) {
      navigate('/my-orders');
    } else {
      setError(result.error?.response?.data?.message || 'Failed to place order');
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Form validation
  const isFormValid = address && phone && city;

  // Show loading state while checking client-side
  if (!isClient) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '16px' }}>Loading checkout...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '24px', paddingBottom: '32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>Checkout</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <style>{`
            @media (min-width: 1024px) {
              .checkout-layout {
                flex-direction: row !important;
              }
            }
          `}</style>
          <div className="checkout-layout" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Left 2 Columns - Delivery Address, Contact, Payment */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Delivery Address with Geolocation & Map */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', padding: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Delivery Address</h2>
              
              {/* Current Location Button */}
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={useCurrentLocation}
                className="w-full mb-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                <span>📍</span>
                {useCurrentLocation ? 'Getting your location...' : 'Use My Current Location'}
              </button>

              {/* Interactive Map */}
              <div style={{ height: '320px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
                {mapError ? (
                  <div style={{ backgroundColor: '#fefce8', border: '1px solid #fde047', color: '#a16207', padding: '16px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '0.875rem' }}>Map unavailable. Please use the location button above or enter your address manually.</p>
                  </div>
                ) : isClient ? (
                  <DeliveryMap 
                    location={location}
                    onLocationSelect={handleLocationSelect}
                  />
                ) : (
                  <div style={{ backgroundColor: '#f3f4f6', padding: '16px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loading map...</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Click on the map to set your delivery location, or use the button above to share your current location. Address fields will auto-fill.
              </p>

              {/* Address Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address / Location Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Enter your street address or location details"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-City / City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="e.g., Kirkos, Bole"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="e.g., Near the central square, Gate 2"
                  />
                </div>
              </div>
              </div>

            {/* Contact Information */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', padding: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Contact Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="+251 9XX XXX XXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', padding: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Payment Method</h2>
              {vendorLoading ? (
                <p style={{ color: '#6b7280' }}>Loading payment methods...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Cash on Delivery - Always available */}
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">💵 Cash on Delivery</span>
                  </label>
                  
                  {/* Vendor's payment methods */}
                  {vendor?.paymentMethods && vendor.paymentMethods.length > 0 ? (
                    vendor.paymentMethods.map((method, index) => (
                      <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value={method.type || method.name}
                          checked={paymentMethod === (method.type || method.name)}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <div style={{ flex: 1 }}>
                          <span className="text-gray-700 font-medium">{method.name || method.type}</span>
                          {method.accountNumber && (
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                              Account: {method.accountNumber}
                            </p>
                          )}
                          {method.phoneNumber && (
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                              Phone: {method.phoneNumber}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No additional payment methods available from this vendor.</p>
                  )}
                </div>
              )}
            </div>
            </div>

          {/* Right Column - Sticky Order Summary */}
          <div style={{ flex: 1 }}>
            <div style={{ position: 'sticky', top: '20px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', padding: '24px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Order Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
                  {cart.map((item, index) => {
                    const itemPrice = Number(item?.product?.price || item?.variant?.price || 0);
                    const itemQuantity = Number(item?.quantity) || 0;
                    return (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item?.product?.name || 'Unknown Product'}</p>
                          {item?.variant && (
                            <p className="text-sm text-gray-500">Variant: {item.variant.name}</p>
                          )}
                          <p className="text-sm text-gray-500">Qty: {itemQuantity} × {itemPrice} ETB</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {(itemPrice * itemQuantity).toFixed(2)} ETB
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Breakdown */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', gap: '16px' }}>
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} ETB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', gap: '16px' }}>
                    <span>Delivery Fee</span>
                    <span>{deliveryFee.toFixed(2)} ETB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', gap: '16px' }}>
                    <span>Service Fee (5%)</span>
                    <span>{serviceFee.toFixed(2)} ETB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', paddingTop: '8px', borderTop: '1px solid #e5e7eb', gap: '16px' }}>
                    <span>Total</span>
                    <span>{total.toFixed(2)} ETB</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !isFormValid}
                  style={{ width: '100%', marginTop: '24px', backgroundColor: '#f97316', color: '#ffffff', padding: '16px', borderRadius: '8px', fontSize: '1.125rem', fontWeight: '600', cursor: loading || !isFormValid ? 'not-allowed' : 'pointer', opacity: loading || !isFormValid ? 0.5 : 1 }}
                >
                  {loading ? 'Placing Order...' : `Place Order - ${total.toFixed(2)} ETB`}
                </button>

                {error && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginTop: '16px' }}>
                    {error}
                  </div>
                )}

                {!isFormValid && (
                  <div style={{ backgroundColor: '#fefce8', border: '1px solid #fde047', color: '#a16207', padding: '12px 16px', borderRadius: '8px', marginTop: '16px', fontSize: '0.875rem' }}>
                    Please fill in all required fields (address, city, phone) to place your order.
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
