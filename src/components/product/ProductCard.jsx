import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, storeOpen = true, compact = false }) => {
  if (!product) return null;

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const selectedVariant = hasVariants ? variants[selectedVariantIndex] : null;
  const currentPrice = selectedVariant && selectedVariant.price !== undefined && selectedVariant.price !== null && selectedVariant.price !== ''
    ? Number(selectedVariant.price)
    : Number(product.price || 0);

  const currentStock = selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock !== null && selectedVariant.stock !== ''
    ? Number(selectedVariant.stock)
    : Number(product.stock || 0);

  const isOutOfStock = currentStock <= 0;
  const imageSrc = (product.images && product.images[0]) || product.image || `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name || 'Product')}`;
  const unitLabel = product.unit || 'piece';

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(product, selectedVariant);
    }
  };

  return (
    <article className="product-card" style={{ padding: compact ? '8px' : '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="product-media" style={{ height: compact ? '120px' : '160px' }}>
          <img
            src={imageSrc}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
          />
        </div>
        <div className="product-body" style={{ padding: '8px 0 0 0' }}>
          <div className="product-title" style={{ fontSize: compact ? '0.85rem' : '0.95rem', marginBottom: '2px', lineHeight: '1.2', fontWeight: '600' }}>
            {product.name}
          </div>

          {/* Product Description right below title */}
          {product.description && (
            <p
              className="product-description text-xs text-gray-500 line-clamp-2"
              style={{
                fontSize: compact ? '0.75rem' : '0.8rem',
                color: '#6B7280',
                margin: '2px 0 6px 0',
                lineHeight: '1.3'
              }}
              title={product.description}
            >
              {product.description}
            </p>
          )}

          {/* Variant Selector Chips/Toggles */}
          {hasVariants && (
            <div style={{ margin: '6px 0', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {variants.map((v, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedVariantIndex(idx)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    borderRadius: '12px',
                    border: idx === selectedVariantIndex ? '1.5px solid #FF5500' : '1px solid #D1D5DB',
                    background: idx === selectedVariantIndex ? '#FFF5F0' : '#F9FAFB',
                    color: idx === selectedVariantIndex ? '#FF5500' : '#374151',
                    fontWeight: idx === selectedVariantIndex ? '600' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {v.name || `Variant ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
            <div className="rating">
              <span style={{ color: '#f5b450', fontSize: compact ? '0.8rem' : '0.9rem' }}>★</span>
              <span className="small muted" style={{ marginLeft: '4px', fontSize: compact ? '0.7rem' : '0.8rem' }}>
                {!isOutOfStock ? 'In stock' : 'Out of stock'}
              </span>
            </div>
            <div className="price" style={{ fontSize: compact ? '0.9rem' : '1rem', fontWeight: '700' }}>
              ${currentPrice.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 'normal' }}>/ {unitLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {onAddToCart && (
        <button
          className="add-btn"
          onClick={handleAddToCartClick}
          style={{ padding: compact ? '5px 10px' : '8px 16px', fontSize: compact ? '0.75rem' : '0.85rem', width: '100%', marginTop: '4px' }}
          disabled={!storeOpen || isOutOfStock}
        >
          {!storeOpen ? 'Store Closed' : isOutOfStock ? 'Out of Stock' : hasVariants ? `Add (${selectedVariant?.name || 'Selected'})` : 'Add to Cart'}
        </button>
      )}
    </article>
  );
};

export default ProductCard;


