import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

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
      <div className="page-header">
        <h1>Bicycle App</h1>
        <p className="muted">The place where supermarkets publish products, customers shop, and riders deliver orders.</p>
      </div>

      {/* Category bar */}
      <div className="category-bar">
        <div className="category"><div className="icon">E</div>Electronics</div>
        <div className="category"><div className="icon">C</div>Clothing</div>
        <div className="category"><div className="icon">H</div>Home</div>
        <div className="category"><div className="icon">B</div>Beauty</div>
        <div className="category"><div className="icon">S</div>Sports</div>
        <div className="category"><div className="icon">T</div>Toys</div>
        <div className="category"><div className="icon">M</div>Motors</div>
      </div>

      {/* Hero + Side promos */}
      <section className="hero">
        <div className="hero-main">
          <div style={{padding:24}}>
            <h2 style={{margin:0}}>Mega Summer Sale — Up to 70% OFF</h2>
            <p className="muted">Top brands, fastest shipping, and exclusive limited-time deals. Grab them before they're gone.</p>
            <div style={{display:'flex',gap:10,marginTop:12}}>
              <Link to="/products" className="add-btn" style={{background:'var(--demo-color-secondary)'}}>Shop Deals</Link>
              <Link to="/products" className="add-btn" style={{background:'#fff',color:'var(--demo-color-primary)',border:'1px solid var(--color-border)'}}>See All</Link>
            </div>
          </div>
        </div>

        <aside className="hero-side">
          <div className="promo">
            <img src="https://images.unsplash.com/photo-1513708929411-7e4ee23f45d0?q=80&w=400&auto=format&fit=crop" alt="Top Picks" style={{width:72,height:72,objectFit:'cover'}} />
            <div>
              <div style={{fontWeight:700}}>Top Picks</div>
              <div className="small muted">Curated for you</div>
            </div>
          </div>
          <div className="promo">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop" alt="Daily Deals" style={{width:72,height:72,objectFit:'cover'}} />
            <div>
              <div style={{fontWeight:700}}>Daily Deals</div>
              <div className="small muted">Limited quantities</div>
            </div>
          </div>
          <div className="promo" style={{justifyContent:'center'}}>
            <div style={{textAlign:'center',width:'100%'}}>
              <div style={{fontWeight:800,color:'var(--demo-color-primary)',fontSize:'1.05rem'}}>New Arrival</div>
              <div className="small muted">Explore now</div>
            </div>
          </div>
        </aside>
      </section>

      {/* Flash sale + products grid */}
      <div className="section">
        <div className="header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0}}>Flash Sale</h3>
          <div className="flash">
            <div style={{fontWeight:800,color:'var(--demo-color-primary)',marginRight:12}}>Hot Deals</div>
            <div className="countdown">
              <div className="box"><span>06</span>h</div>
              <div className="box"><span>23</span>m</div>
              <div className="box"><span>12</span>s</div>
            </div>
          </div>
        </div>

        <div className="products-grid">
          {products.slice(0,8).map((p) => (
            <article className="product-card" key={p._id}>
              <div className="product-media"><img src={`https://source.unsplash.com/collection/190727/800x800?sig=${p._id}`} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>
              <div className="product-body">
                <div className="product-title">{p.name}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div className="rating"><span style={{color:'#f5b450'}}>★</span><span className="small muted" style={{marginLeft:6}}>{(p.stock || 0) > 0 ? 'In stock' : 'Out'}</span></div>
                  <div className="price">${p.price?.toFixed(2)}</div>
                </div>
                <button className="add-btn" onClick={() => { addToCart(p); navigate('/orders'); }}>Add to Cart</button>
              </div>
            </article>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;