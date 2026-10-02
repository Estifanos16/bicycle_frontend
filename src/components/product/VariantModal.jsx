import React, { useState } from 'react';

const VariantModal = ({ product, isOpen, onClose, onAddToCart, storeOpen = true }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const selectedVariant = hasVariants ? variants[selectedVariantIndex] : null;

  const currentPrice = selectedVariant && selectedVariant.price !== undefined && selectedVariant.price !== null && selectedVariant.price !== ''
    ? Number(selectedVariant.price)
    : Number(product.price || 0);

  const currentStock = selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock !== null && selectedVariant.stock !== ''
    ? Number(selectedVariant.stock)
    : Number(product.stock || 0);

  const isOutOfStock = currentStock <= 0;
  const maxQuantity = currentStock;
  const totalPrice = currentPrice * quantity;

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      const itemToAdd = selectedVariant
        ? {
            ...product,
            selectedVariant,
            name: `${product.name} (${selectedVariant.name})`,
            price: currentPrice,
            stock: currentStock,
            quantity
          }
        : {
            ...product,
            quantity
          };
      onAddToCart(itemToAdd);
      onClose();
    }
  };

  const imageSrc = (product.images && product.images[0]) || product.image || `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name || 'Product')}`;
  const unitLabel = product.unit || 'piece';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px 16px 0 0',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Select Options</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6B7280',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Product Image and Info */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <img
            src={imageSrc}
            alt={product.name}
            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>{product.name}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>
              ETB {currentPrice.toFixed(2)} / {unitLabel}
            </p>
            <div style={{
              marginTop: '4px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: isOutOfStock ? '#EF4444' : '#10B981',
              background: isOutOfStock ? '#FEE2E2' : '#D1FAE5'
            }}>
              {isOutOfStock ? 'Out of Stock' : `In Stock (${currentStock})`}
            </div>
          </div>
        </div>

        {/* Variant Selection */}
        {hasVariants && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
              Select Variant
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {variants.map((variant, index) => {
                const variantPrice = variant.price !== undefined && variant.price !== null && variant.price !== ''
                  ? Number(variant.price)
                  : Number(product.price || 0);
                const variantStock = variant.stock !== undefined && variant.stock !== null && variant.stock !== ''
                  ? Number(variant.stock)
                  : Number(product.stock || 0);
                const isSelected = index === selectedVariantIndex;
                const isVariantOutOfStock = variantStock <= 0;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !isVariantOutOfStock && setSelectedVariantIndex(index)}
                    disabled={isVariantOutOfStock}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #FF5500' : '1px solid #E5E7EB',
                      background: isSelected ? '#FFF5F0' : '#F9FAFB',
                      cursor: isVariantOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isVariantOutOfStock ? 0.5 : 1,
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                          {variant.name || `Variant ${index + 1}`}
                        </div>
                        {variant.sku && (
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                            SKU: {variant.sku}
                          </div>
                        )}
                        {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <span key={key} style={{ marginRight: '8px' }}>
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FF5500' }}>
                          ETB {variantPrice.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isVariantOutOfStock ? '#EF4444' : '#10B981' }}>
                          {isVariantOutOfStock ? 'Out of Stock' : `${variantStock} available`}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
            Quantity
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                fontSize: '1.25rem',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                opacity: quantity <= 1 ? 0.5 : 1
              }}
            >
              -
            </button>
            <span style={{ fontSize: '1.125rem', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQuantity}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                fontSize: '1.25rem',
                cursor: quantity >= maxQuantity ? 'not-allowed' : 'pointer',
                opacity: quantity >= maxQuantity ? 0.5 : 1
              }}
            >
              +
            </button>
            <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#6B7280' }}>
              Max: {maxQuantity}
            </span>
          </div>
        </div>

        {/* Total Price */}
        <div style={{
          padding: '16px',
          background: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>Total</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FF5500' }}>
            ETB {totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!storeOpen || isOutOfStock}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: !storeOpen || isOutOfStock ? '#D1D5DB' : '#FF5500',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: !storeOpen || isOutOfStock ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {!storeOpen ? 'Store Closed' : isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Cart`}
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default VariantModal;
