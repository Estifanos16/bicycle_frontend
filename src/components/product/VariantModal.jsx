import React, { useState } from 'react';

const VariantModal = ({ product, isOpen, onClose, onAddToCart, storeOpen = true }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const variants = product.variants || [];
  
  // Create selectable options array: base product + variants
  const selectableOptions = [
    {
      isBase: true,
      name: 'Standard',
      title: 'Standard Product',
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      sku: product.sku,
      _id: product._id
    },
    ...variants.map((v, idx) => ({
      isBase: false,
      name: v.name || `Variant ${idx + 1}`,
      title: v.title || v.name || `${v.size || ''} ${v.unit || ''}`.trim() || `Variant ${idx + 1}`,
      price: v.price !== undefined && v.price !== null && v.price !== '' ? v.price : product.price,
      stock: v.stock !== undefined && v.stock !== null && v.stock !== '' ? v.stock : product.stock,
      unit: v.unit || product.unit,
      sku: v.sku,
      attributes: v.attributes,
      _id: v._id || v.id
    }))
  ];

  const selectedOption = selectableOptions[selectedIndex];
  const currentPrice = Number(selectedOption.price || 0);
  const currentStock = Number(selectedOption.stock || 0);
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
      const itemToAdd = selectedOption.isBase
        ? {
            ...product,
            quantity,
            price: currentPrice,
            stock: currentStock
          }
        : {
            ...product,
            selectedVariant: variants[selectedIndex - 1],
            variantId: selectedOption._id,
            name: `${product.name} (${selectedOption.title})`,
            price: currentPrice,
            stock: currentStock,
            quantity,
            _id: `${product._id}-${selectedOption._id || 'custom'}` // Unique ID for variant
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

        {/* Product/Variant Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: '700', color: '#111827' }}>
            Select Option
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectableOptions.map((option, index) => {
              const isSelected = index === selectedIndex;
              const isOptionOutOfStock = option.stock <= 0;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isOptionOutOfStock && setSelectedIndex(index)}
                  disabled={isOptionOutOfStock}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #FF5500' : '1px solid #E5E7EB',
                    background: isSelected ? '#FFF5F0' : '#FFFFFF',
                    cursor: isOptionOutOfStock ? 'not-allowed' : 'pointer',
                    opacity: isOptionOutOfStock ? 0.5 : 1,
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    boxShadow: isSelected ? '0 2px 8px rgba(255, 85, 0, 0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                        {option.title}
                      </div>
                      {option.sku && (
                        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '2px' }}>
                          SKU: <span style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>{option.sku}</span>
                        </div>
                      )}
                      {option.attributes && Object.keys(option.attributes).length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {Object.entries(option.attributes).map(([key, value]) => (
                            <span key={key} style={{ 
                              background: '#F3F4F6', 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}>
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FF5500', marginBottom: '4px' }}>
                        ETB {Number(option.price).toFixed(2)}
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '600',
                        color: isOptionOutOfStock ? '#EF4444' : '#10B981',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isOptionOutOfStock ? '#FEE2E2' : '#D1FAE5',
                        display: 'inline-block'
                      }}>
                        {isOptionOutOfStock ? 'Out of Stock' : `${option.stock} in stock`}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                background: quantity <= 1 ? '#E5E7EB' : '#D1D5DB',
                color: '#111827',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                opacity: quantity <= 1 ? 0.5 : 1,
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (quantity > 1) e.target.style.background = '#9CA3AF';
              }}
              onMouseLeave={(e) => {
                if (quantity > 1) e.target.style.background = '#D1D5DB';
              }}
            >
              -
            </button>
            <span style={{ fontSize: '1.125rem', fontWeight: '600', minWidth: '40px', textAlign: 'center', color: '#111827' }}>
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQuantity}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                background: quantity >= maxQuantity ? '#E5E7EB' : '#D1D5DB',
                color: '#111827',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                cursor: quantity >= maxQuantity ? 'not-allowed' : 'pointer',
                opacity: quantity >= maxQuantity ? 0.5 : 1,
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (quantity < maxQuantity) e.target.style.background = '#9CA3AF';
              }}
              onMouseLeave={(e) => {
                if (quantity < maxQuantity) e.target.style.background = '#D1D5DB';
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
