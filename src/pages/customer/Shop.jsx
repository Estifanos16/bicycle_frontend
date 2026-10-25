import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, getProducts } from '../../services/api';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';
import VariantModal from '../../components/product/VariantModal';

const Shop = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [pastOrders, setPastOrders] = useState([]);
  const [pastProducts, setPastProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [variantModalProduct, setVariantModalProduct] = useState(null);

  useEffect(() => {
    const fetchPastOrders = async () => {
      try {
        const response = await getMyOrders();
        setPastOrders(response.data || []);
        
        // Extract unique productIds from past orders
        const uniqueProductIds = new Set();
        response.data?.forEach(order => {
          order.items?.forEach(item => {
            if (item.productId) {
              uniqueProductIds.add(item.productId);
            }
          });
        });
        
        console.log('Unique productIds from orders:', Array.from(uniqueProductIds));
        
        // Fetch product details for all unique productIds
        if (uniqueProductIds.size > 0) {
          const allProductsResponse = await getProducts();
          const allProducts = allProductsResponse.data || [];
          const filteredProducts = allProducts.filter(p => uniqueProductIds.has(p._id));
          console.log('Filtered past products:', filteredProducts);
          setPastProducts(filteredProducts);
        } else {
          setPastProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch past orders:', err);
        setPastOrders([]);
        setPastProducts([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchPastOrders();
  }, []);

  const handleAddToCart = (product, variant = null) => {
    if (product.variants && product.variants.length > 0 && !variant) {
      setVariantModalProduct(product);
      return;
    }
    addToCart(product, variant);
  };

  const handleVariantSelect = (variant) => {
    if (variantModalProduct) {
      addToCart(variantModalProduct, variant);
      setVariantModalProduct(null);
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter out products already in cart from past products
  const cartProductIds = new Set(cart.map(item => item.product._id));
  console.log('Cart product IDs:', Array.from(cartProductIds));
  const buyAgainProducts = pastProducts.filter(p => !cartProductIds.has(p._id));
  console.log('Buy again products:', buyAgainProducts);

  return (
    <div className="container" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 8px 0' }}>Your Shop</h1>
        <p className="muted" style={{ margin: 0 }}>Manage your cart and reorder past purchases</p>
      </div>

      {/* In Your Cart Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>In Your Cart ({cartItemCount} items)</h2>
          {cart.length > 0 && (
            <button
              onClick={() => navigate('/checkout')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#FF5500',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Proceed to Checkout
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '1px dashed #E5E7EB'
          }}>
            <p style={{ color: '#6B7280', marginBottom: '16px' }}>Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#FF5500',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {cart.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(item.product?.images?.[0] || item.product?.image) && (
                    <img
                      src={item.product.images[0] || item.product.image}
                      alt={item.product.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {item.product.name}
                    </div>
                    {item.variant && (
                      <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>
                        {item.variant.name}
                      </div>
                    )}
                    <div style={{ fontWeight: 600, color: '#FF5500' }}>
                      ETB {(item.variant?.price || item.product?.price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 600 }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: '#6B7280', marginRight: '8px' }}>Total:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FF5500' }}>
                ETB {cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              style={{
                padding: '12px 32px',
                backgroundColor: '#FF5500',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </section>

      {/* Buy It Again Section */}
      <section>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px 0' }}>Buy It Again</h2>
        
        {loadingOrders ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p>Loading past orders...</p>
          </div>
        ) : buyAgainProducts.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '1px dashed #E5E7EB'
          }}>
            <p style={{ color: '#6B7280' }}>No past purchases to reorder</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {buyAgainProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                storeOpen={true}
                onAddToCart={handleAddToCart}
                onOpenVariantModal={() => setVariantModalProduct(product)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Variant Modal */}
      {variantModalProduct && (
        <VariantModal
          product={variantModalProduct}
          onSelectVariant={handleVariantSelect}
          onClose={() => setVariantModalProduct(null)}
        />
      )}
    </div>
  );
};

export default Shop;
