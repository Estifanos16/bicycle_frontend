import React, { useContext, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { getProducts } from '../../services/api';
import { useCart } from '../../context/CartContext';

import ProductCard from '../../components/product/ProductCard';
import VariantModal from '../../components/product/VariantModal';

const Storefront = () => {
  const { storeSlug } = useParams();
  const { vendorProfile, isStoreOpen, fetchVendorProfileBySlug } = useVendor();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  const { search } = useLocation();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Sync category from URL params
  useEffect(() => {
    const params = new URLSearchParams(search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [search]);

  const storeOpen = isStoreOpen();

  const predefinedCategories = [
    'General', 'Clothing', 'Electronics', 'Food', 'Beverages',
    'Household', 'Sports', 'Toys', 'Books', 'Health & Beauty',
    'Automotive', 'Gardening', 'Furniture', 'Appliances', 'Pet Supplies'
  ];

  const handleOpenVariantModal = (product) => {
    setVariantModalProduct(product);
  };

  const handleCloseVariantModal = () => {
    setVariantModalProduct(null);
  };

  const handleAddToCartFromModal = (item) => {
    addToCart(item);
    navigate('/shop');
  };

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

          {/* Search Input */}
          <div style={{marginBottom:'16px'}}>
            <input
              type="search"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width:'100%',
                padding:'12px 16px',
                border:'1px solid #E5E7EB',
                borderRadius:'8px',
                fontSize:'0.95rem',
                outline:'none',
                transition:'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF5500'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {loading ? (
            <p className="muted">Loading products...</p>
          ) : (() => {
            const filteredProducts = products.filter((product) => {
              const term = searchTerm.trim().toLowerCase();
              const category = product.category || 'General';
              const matchesSearch =
                product.name.toLowerCase().includes(term) ||
                (product.description || '').toLowerCase().includes(term) ||
                category.toLowerCase().includes(term);
              const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
              return matchesSearch && matchesCategory;
            });

            return filteredProducts.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] lg:grid-cols-6 gap-6 w-full items-start justify-start">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    storeOpen={storeOpen}
                    compact={true}
                    onOpenVariantModal={handleOpenVariantModal}
                    onAddToCart={(prod, selectedVariant) => {
                      const itemToAdd = selectedVariant
                        ? {
                            ...prod,
                            selectedVariant,
                            name: `${prod.name} (${selectedVariant.name})`,
                            price: selectedVariant.price !== undefined && selectedVariant.price !== null && selectedVariant.price !== '' ? Number(selectedVariant.price) : prod.price,
                            stock: selectedVariant.stock !== undefined && selectedVariant.stock !== null && selectedVariant.stock !== '' ? Number(selectedVariant.stock) : prod.stock
                          }
                        : prod;
                      addToCart(itemToAdd);
                      navigate('/shop');
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="muted">No products found matching your criteria.</p>
            );
          })()}
        </div>
      </div>

      {/* Variant Modal */}
      <VariantModal
        product={variantModalProduct}
        isOpen={!!variantModalProduct}
        onClose={handleCloseVariantModal}
        onAddToCart={handleAddToCartFromModal}
        storeOpen={storeOpen}
      />
    </div>
  );
};

export default Storefront;


