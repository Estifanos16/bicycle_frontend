import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

// Fix for default marker icon in react-leaflet (safe initialization)
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

// Map click handler component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate totals with safe checks
  const subtotal = (cart || []).reduce((sum, item) => {
    const price = Number(item?.price) || 0;
    const quantity = Number(item?.quantity) || 0;
    return sum + (price * quantity);
  }, 0);
  const deliveryFee = 50; // Fixed delivery fee in ETB
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + deliveryFee + serviceFee;

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setUseCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (latitude && longitude) {
          setLocation([latitude, longitude]);
          setAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
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

  const handleLocationSelect = (coords) => {
    if (coords && coords.length === 2) {
      setLocation(coords);
      setAddress(`Lat: ${coords[0].toFixed(6)}, Lng: ${coords[1].toFixed(6)}`);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!address) {
      setError('Please enter a delivery address');
      return;
    }
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }
    if (!city) {
      setError('Please enter your city/sub-city');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary & Delivery */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {cart.map((item) => {
                  const itemId = item.variantId ? `${item._id}-${item.variantId}` : item._id;
                  const itemPrice = Number(item?.price) || 0;
                  const itemQuantity = Number(item?.quantity) || 0;
                  return (
                    <div key={itemId} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item?.name || 'Unknown Product'}</p>
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
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee.toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service Fee (5%)</span>
                  <span>{serviceFee.toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{total.toFixed(2)} ETB</span>
                </div>
              </div>
            </div>

            {/* Delivery Address with Geolocation & Map */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
              
              {/* Current Location Button */}
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={useCurrentLocation}
                className="w-full mb-4 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>📍</span>
                {useCurrentLocation ? 'Getting your location...' : 'Use My Current Location'}
              </button>

              {/* Interactive Map */}
              <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                {mapError ? (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 text-center">
                    <p className="text-sm">Map unavailable. Please use the location button above or enter your address manually.</p>
                  </div>
                ) : isClient ? (
                  <MapContainer
                    center={location}
                    zoom={13}
                    style={{ height: '300px', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={location} />
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                  </MapContainer>
                ) : (
                  <div className="bg-gray-100 p-4 text-center" style={{ height: '300px' }}>
                    <p className="text-sm text-gray-500">Loading map...</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Click on the map to set your delivery location, or use the button above to share your current location.
              </p>

              {/* Address Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address / Location Details
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your street address or location details"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-City / City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Near the central square, Gate 2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer Details & Payment */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+251 9XX XXX XXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
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
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="telebirr"
                    checked={paymentMethod === 'telebirr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">📱 Telebirr</span>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cbe"
                    checked={paymentMethod === 'cbe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">🏦 CBE Birr</span>
                </label>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {loading ? 'Placing Order...' : `Place Order - ${total.toFixed(2)} ETB`}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
