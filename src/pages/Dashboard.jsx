import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userRoles = user?.roles || [];
        const isVendorUser = userRoles.includes('supermarket') || 
                             userRoles.includes('vendor') || 
                             userRoles.includes('vendor_staff') || 
                             userRoles.includes('supermarket_owner') || 
                             user?.role === 'vendor';
        const vendorId = user?.vendorId || user?.supermarketId || user?._id || user?.id;
        const params = isVendorUser && vendorId ? { vendorId } : {};
        const response = await getProducts(params);
        console.log('Dashboard - Fetched products:', response.data);
        
        let fetchedProducts = response.data || [];
        if (isVendorUser) {
          const userVendorIds = [
            user?.vendorId?._id || user?.vendorId,
            user?.supermarketId?._id || user?.supermarketId,
            user?._id,
            user?.id
          ].filter(Boolean).map(id => id.toString());

          fetchedProducts = fetchedProducts.filter(p => {
            const pVendorId = (p.supermarketId?._id || p.supermarketId || p.vendorId?._id || p.vendorId || p.vendor?._id || p.vendor)?.toString();
            return pVendorId && userVendorIds.includes(pVendorId);
          });
        }
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [user]);

  // Get recent products (last 5 by createdAt)
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Get most favorable products (top 5 by stock, assuming higher stock means more popular)
  const mostFavorableProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="page-header" style={{padding:'6px 0'}}>
        <h1 style={{fontSize:'1.2rem',margin:'0 0 2px 0'}}>Bicycle App</h1>
        <p className="muted" style={{fontSize:'0.7rem',margin:0}}>Supermarkets • Customers • Riders</p>
      </div>

      {/* Hero + Side promos */}
      <section className="hero" style={{gap:'6px'}}>
        <div className="hero-main">
          <div style={{padding:'10px'}}>
            <h2 style={{margin:'0 0 3px 0',fontSize:'0.95rem'}}>Up to 70% OFF</h2>
            <p className="muted" style={{fontSize:'0.7rem',margin:'0 0 6px 0'}}>Top brands, fastest shipping, exclusive deals.</p>
            <div style={{display:'flex',gap:'6px'}}>
              <Link to="/products" className="add-btn" style={{background:'var(--demo-color-secondary)',padding:'5px 10px',fontSize:'0.75rem'}}>Shop</Link>
              <Link to="/products" className="add-btn" style={{background:'#fff',color:'var(--demo-color-primary)',border:'1px solid var(--color-border)',padding:'5px 10px',fontSize:'0.75rem'}}>All</Link>
            </div>
          </div>
        </div>

        <aside className="hero-side" style={{gap:'4px'}}>
          <div className="promo" style={{padding:'6px'}}>
            <img src="https://images.unsplash.com/photo-1513708929411-7e4ee23f45d0?q=80&w=400&auto=format&fit=crop" alt="Top Picks" style={{width:'36px',height:'36px',objectFit:'cover'}} />
            <div>
              <div style={{fontWeight:600,fontSize:'0.75rem'}}>Top Picks</div>
              <div className="small muted" style={{fontSize:'0.65rem'}}>For you</div>
            </div>
          </div>
          <div className="promo" style={{padding:'6px'}}>
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop" alt="Daily Deals" style={{width:'36px',height:'36px',objectFit:'cover'}} />
            <div>
              <div style={{fontWeight:600,fontSize:'0.75rem'}}>Deals</div>
              <div className="small muted" style={{fontSize:'0.65rem'}}>Limited</div>
            </div>
          </div>
          <div className="promo" style={{justifyContent:'center',padding:'6px'}}>
            <div style={{textAlign:'center',width:'100%'}}>
              <div style={{fontWeight:700,color:'var(--demo-color-primary)',fontSize:'0.75rem'}}>New</div>
              <div className="small muted" style={{fontSize:'0.65rem'}}>Explore</div>
            </div>
          </div>
        </aside>
      </section>

      {/* Flash sale + products grid */}
      <div className="section" style={{marginTop:'10px'}}>
        <div className="header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
          <h3 style={{margin:0,fontSize:'0.9rem'}}>Flash Sale</h3>
          <div className="flash" style={{display:'flex',alignItems:'center'}}>
            <div style={{fontWeight:700,color:'var(--demo-color-primary)',marginRight:'6px',fontSize:'0.75rem'}}>Hot</div>
            <div className="countdown" style={{display:'flex',gap:'3px'}}>
              <div className="box" style={{padding:'3px 5px',fontSize:'0.7rem'}}><span>06</span>h</div>
              <div className="box" style={{padding:'3px 5px',fontSize:'0.7rem'}}><span>23</span>m</div>
              <div className="box" style={{padding:'3px 5px',fontSize:'0.7rem'}}><span>12</span>s</div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '0 24px'
        }}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] lg:grid-cols-6 gap-6 w-full items-start justify-start">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                storeOpen={true}
                compact={true}
                onAddToCart={(prod) => {
                  addToCart(prod);
                  navigate('/shop');
                }}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;