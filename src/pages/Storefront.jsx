import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVendor } from '../context/VendorContext';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Storefront = () => {
  const { storeSlug } = useParams();
  const { vendorProfile, isStoreOpen, fetchVendorProfileBySlug } = useVendor();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const storeOpen = isStoreOpen();

  useEffect(() => {
    // Fetch vendor profile by slug
    fetchVendorProfileBySlug(storeSlug);
  }, [storeSlug]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const vendorId = vendorProfile?._id || vendorProfile?.id;
        const response = vendorId 
          ? await getProducts({ vendorId }) 
          : await getProducts();
        
        // Filter by vendor ID if vendorProfile exists
        const storeProducts = vendorId 
          ? (response.data || []).filter(p => {
              const pVendorId = p.vendorId?._id || p.vendorId || p.supermarketId?._id || p.supermarketId;
              return pVendorId?.toString() === vendorId?.toString();
            })
          : (response.data || []);

        setProducts(storeProducts);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [vendorProfile]);

  if (!vendorProfile?.branding) {
    return (
      <div className="container" style={{padding:'40px 20px', textAlign:'center'}}>
        <h2>Store not found</h2>
        <p className="muted">This store may not exist or has been removed.</p>
      </div>
    );
  }

  const { branding, operations } = vendorProfile;

  // Get today's operating hours
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const todayHours = operations?.operatingHours?.[today];

  return (
    <div className="storefront">
      {/* Cover Banner */}
      {branding.storeBanner && (
        <div className="store-banner" style={{
          width:'100%',
          height:'200px',
          backgroundImage:`url(${branding.storeBanner})`,
          backgroundSize:'cover',
          backgroundPosition:'center',
          position:'relative'
        }}>
          <div style={{
            position:'absolute',
            bottom:'0',
            left:'0',
            right:'0',
            background:'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            padding:'20px'
          }}>
            <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
              {branding.storeLogo && (
                <img 
                  src={branding.storeLogo} 
                  alt="Store Logo" 
                  style={{
                    width:'80px',
                    height:'80px',
                    borderRadius:'50%',
                    border:'3px solid white',
                    objectFit:'cover'
                  }}
                />
              )}
              <div style={{color:'white'}}>
                <h1 style={{margin:0, fontSize:'1.5rem'}}>{branding.storeName}</h1>
                {branding.storeCategory && (
                  <span style={{
                    background:'rgba(255,255,255,0.2)',
                    padding:'4px 12px',
                    borderRadius:'20px',
                    fontSize:'0.85rem',
                    backdropFilter:'blur(10px)'
                  }}>
                    {branding.storeCategory}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Info Section */}
      <div className="container" style={{padding:'20px'}}>
        {!branding.storeBanner && (
          <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px'}}>
            {branding.storeLogo && (
              <img 
                src={branding.storeLogo} 
                alt="Store Logo" 
                style={{
                  width:'80px',
                  height:'80px',
                  borderRadius:'50%',
                  border:'3px solid #E5E7EB',
                  objectFit:'cover'
                }}
              />
            )}
            <div>
              <h1 style={{margin:'0 0 8px 0', fontSize:'1.5rem'}}>{branding.storeName}</h1>
              {branding.storeCategory && (
                <span style={{
                  background:'#FF5500',
                  color:'white',
                  padding:'4px 12px',
                  borderRadius:'20px',
                  fontSize:'0.85rem'
                }}>
                  {branding.storeCategory}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Store Status & Info */}
        <div style={{display:'grid', gap:'12px', marginBottom:'24px'}}>
          <div style={{
            display:'flex',
            alignItems:'center',
            gap:'8px',
            padding:'12px',
            background: storeOpen ? '#D1FAE5' : '#FEE2E2',
            borderRadius:'8px'
          }}>
            <span style={{fontSize:'1.25rem'}}>{storeOpen ? '🟢' : '🔴'}</span>
            <span style={{fontWeight:'600', color: storeOpen ? '#065F46' : '#991B1B'}}>
              {storeOpen ? 'Currently Open' : 'Currently Closed'}
            </span>
          </div>

          {operations?.preparationTime && operations.preparationTime !== 'variable' && (
            <div style={{
              display:'flex',
              alignItems:'center',
              gap:'8px',
              padding:'12px',
              background:'#DBEAFE',
              borderRadius:'8px'
            }}>
              <span style={{fontSize:'1.25rem'}}>⏱️</span>
              <span style={{fontWeight:'600', color:'#1E40AF'}}>
                Avg. Prep Time: {operations.preparationTime} minutes
              </span>
            </div>
          )}

          {branding.businessBio && (
            <div style={{padding:'16px', background:'#F9FAFB', borderRadius:'8px', border:'1px solid #E5E7EB'}}>
              <h3 style={{margin:'0 0 8px 0', fontSize:'0.9rem'}}>About</h3>
              <p style={{margin:0, fontSize:'0.85rem', color:'#6B7280', lineHeight:'1.5'}}>
                {branding.businessBio}
              </p>
            </div>
          )}

          {operations?.streetAddress && (
            <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color:'#6B7280'}}>
              <span>📍</span>
              <span>
                {[operations.streetAddress, operations.city, operations.region, operations.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}

          {operations?.phoneNumber && (
            <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color:'#6B7280'}}>
              <span>📞</span>
              <span>{operations.phoneNumber}</span>
            </div>
          )}

          {todayHours?.open && (
            <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color:'#6B7280'}}>
              <span>🕐</span>
              <span>
                Today: {todayHours.openTime} - {todayHours.closeTime}
              </span>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div>
          <h2 style={{margin:'0 0 16px 0', fontSize:'1.2rem'}}>Products</h2>
          {loading ? (
            <p className="muted">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="products-grid" style={{gap:'12px'}}>
              {products.map((product) => (
                <article className="product-card" key={product._id} style={{padding:'12px'}}>
                  <div className="product-media" style={{height:'160px'}}>
                    <img 
                      src={(product.images && product.images[0]) || product.image || `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}`} 
                      alt={product.name} 
                      style={{width:'100%', height:'100%', objectFit:'cover'}} 
                    />
                  </div>
                  <div className="product-body" style={{padding:'12px 0 0 0'}}>
                    <div className="product-title" style={{fontSize:'0.95rem', marginBottom:'4px', lineHeight:'1.3'}}>
                      {product.name}
                    </div>
                    {product.description && (
                      <p className="product-description text-xs text-gray-500 line-clamp-2" style={{fontSize:'0.8rem', color:'#6B7280', margin:'0 0 8px 0', lineHeight:'1.3'}} title={product.description}>
                        {product.description}
                      </p>
                    )}
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                      <div className="rating">
                        <span style={{color:'#f5b450', fontSize:'0.9rem'}}>★</span>
                        <span className="small muted" style={{marginLeft:'4px', fontSize:'0.8rem'}}>
                          {(product.stock || 0) > 0 ? 'In stock' : 'Out of stock'}
                        </span>
                      </div>
                      <div className="price" style={{fontSize:'1rem', fontWeight:'700'}}>
                        ${product.price?.toFixed(2)}
                      </div>
                    </div>
                    <button 
                      className="add-btn" 
                      onClick={() => { addToCart(product); navigate('/orders'); }}
                      style={{padding:'8px 16px', fontSize:'0.85rem', width:'100%'}}
                      disabled={!storeOpen || (product.stock || 0) === 0}
                    >
                      {!storeOpen ? 'Store Closed' : (product.stock || 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">No products available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storefront;
