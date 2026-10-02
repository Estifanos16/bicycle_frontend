import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, storeOpen = true, compact = false, onOpenVariantModal }) => {
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
  const isLowStock = currentStock > 0 && currentStock <= 5;
  const imageSrc = (product.images && product.images[0]) || product.image || `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name || 'Product')}`;
  const unitLabel = product.unit || 'piece';
  const vendorName = product.vendorId?.name || product.supermarketId?.name || product.vendor?.name || 'Unknown Vendor';

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(product, selectedVariant);
    }
  };

  const handleSelectOptionsClick = () => {
    if (onOpenVariantModal) {
      onOpenVariantModal(product);
    }
  };

  const getStockBadge = () => {
    if (!storeOpen) {
      return { text: 'Store Closed', color: '#9CA3AF', bg: '#F3F4F6' };
    }
    if (isOutOfStock) {
      return { text: 'Out of Stock', color: '#EF4444', bg: '#FEE2E2' };
    }
    if (isLowStock) {
      return { text: `Low Stock (${currentStock})`, color: '#F59E0B', bg: '#FEF3C7' };
    }
    return { text: 'In Stock', color: '#10B981', bg: '#D1FAE5' };
  };

  const stockBadge = getStockBadge();

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
          {/* Vendor Name */}
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '2px' }}>
            {vendorName}
          </div>

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
            {/* Stock Badge */}
            <div style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: compact ? '0.7rem' : '0.75rem',
              fontWeight: '500',
              color: stockBadge.color,
              background: stockBadge.bg
            }}>
              {stockBadge.text}
            </div>

            {/* Price */}
            <div className="price" style={{ fontSize: compact ? '0.9rem' : '1rem', fontWeight: '700' }}>
              ETB {currentPrice.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 'normal' }}>/ {unitLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {onAddToCart && (
        <button
          className="add-btn"
          onClick={hasVariants ? handleSelectOptionsClick : handleAddToCartClick}
          style={{ padding: compact ? '5px 10px' : '8px 16px', fontSize: compact ? '0.75rem' : '0.85rem', width: '100%', marginTop: '4px' }}
          disabled={!storeOpen || isOutOfStock}
        >
          {!storeOpen ? 'Store Closed' : isOutOfStock ? 'Out of Stock' : hasVariants ? 'Select Options' : 'Add to Cart'}
        </button>
      )}
    </article>
  );
};

export default ProductCard;


