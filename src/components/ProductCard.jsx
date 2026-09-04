import React from 'react';

const ProductCard = ({ product, onAddToCart, storeOpen = true, compact = false }) => {
  if (!product) return null;

  const isOutOfStock = (product.stock || 0) <= 0;
  const imageSrc = (product.images && product.images[0]) || product.image || `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name || 'Product')}`;

  return (
    <article className="product-card" style={{ padding: compact ? '8px' : '12px' }}>
      <div className="product-media" style={{ height: compact ? '120px' : '160px' }}>
        <img
          src={imageSrc}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="product-body" style={{ padding: '8px 0 0 0' }}>
        <div className="product-title" style={{ fontSize: compact ? '0.85rem' : '0.95rem', marginBottom: '2px', lineHeight: '1.2' }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className="rating">
            <span style={{ color: '#f5b450', fontSize: compact ? '0.8rem' : '0.9rem' }}>★</span>
            <span className="small muted" style={{ marginLeft: '4px', fontSize: compact ? '0.7rem' : '0.8rem' }}>
              {!isOutOfStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>
          <div className="price" style={{ fontSize: compact ? '0.9rem' : '1rem', fontWeight: '700' }}>
            ${product.price?.toFixed(2)}
          </div>
        </div>

        {onAddToCart && (
          <button
            className="add-btn"
            onClick={() => onAddToCart(product)}
            style={{ padding: compact ? '5px 10px' : '8px 16px', fontSize: compact ? '0.75rem' : '0.85rem', width: '100%' }}
            disabled={!storeOpen || isOutOfStock}
          >
            {!storeOpen ? 'Store Closed' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
