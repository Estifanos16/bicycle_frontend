import React from 'react';

const PREDEFINED_CATEGORIES = [
  'General', 'Clothing', 'Electronics', 'Food', 'Beverages',
  'Household', 'Sports', 'Toys', 'Books', 'Health & Beauty',
  'Automotive', 'Gardening', 'Furniture', 'Appliances', 'Pet Supplies'
];

/**
 * ProductForm — shared form component used by both AddProduct and EditProduct pages.
 * Props:
 *   formData       — current form state object
 *   setFormData    — state setter
 *   onSubmit       — form submit handler (receives the event)
 *   onCancel       — cancel / back handler
 *   saving         — boolean, disables submit while saving
 *   isEdit         — boolean, controls title and button label
 *   error          — error string to display
 *   message        — success string to display
 */
const ProductForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  saving = false,
  isEdit = false,
  error = '',
  message = '',
}) => {
  // ── Variant helpers ─────────────────────────────────────────────────────────
  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), { name: '', sku: '', price: '', stock: '' }],
    });
  };

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...(formData.variants || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, variants: updated });
  };

  const handleRemoveVariant = (index) => {
    setFormData({
      ...formData,
      variants: (formData.variants || []).filter((_, i) => i !== index),
    });
  };

  // ── Image helper ─────────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, image: file });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="product-form-page">
      {/* Two-column grid layout */}
      <div className="product-form-grid">
        {/* Page Header - Spans full width */}
        <div className="page-header" style={{ gridColumn: '1 / -1', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#374151',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.borderColor = '#FF5500'}
            onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              {isEdit
                ? 'Update the product details below.'
                : 'Fill in the details to list a new product in your store.'}
            </p>
          </div>
        </div>

        {/* Alerts - Spans full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          {message && (
            <div className="alert alert-success" style={{ marginBottom: '4px', padding: '8px 12px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', color: '#166534' }}>
              {message}
            </div>
          )}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '4px', padding: '8px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b' }}>
              {error}
            </div>
          )}
        </div>
        <form onSubmit={onSubmit} className="product-form product-form-left space-y-6">
          {/* Title & Category Section Card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>Basic Information</h3>
            
            {/* Product Name */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="product-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Product Name *</label>
              <input
                id="product-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Organic Whole Milk"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="product-category" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Category *</label>
              <select
                id="product-category"
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select Category</option>
                {PREDEFINED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price, Stock, Unit Section Card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>Pricing & Inventory</h3>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Price */}
              <div className="form-group">
                <label htmlFor="product-price" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Price (ETB) *</label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      setFormData({ ...formData, price: value.toString() });
                    }
                  }}
                  placeholder="0.00"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                />
              </div>

              {/* Stock */}
              <div className="form-group">
                <label htmlFor="product-stock" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Stock Qty *</label>
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value)) {
                      setFormData({ ...formData, stock: value.toString() });
                    }
                  }}
                  placeholder="0"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                />
              </div>

              {/* Unit */}
              <div className="form-group">
                <label htmlFor="product-unit" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Unit</label>
                <select
                  id="product-unit"
                  name="unit"
                  value={formData.unit || 'piece'}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="piece">Piece</option>
                  <option value="kg">Kilogram</option>
                  <option value="g">Gram</option>
                  <option value="liter">Liter</option>
                  <option value="ml">Milliliter</option>
                  <option value="pack">Pack</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description & Variants Section Card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>Details & Variants</h3>
            
            {/* Description */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="product-description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description</label>
              <textarea
                id="product-description"
                name="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Enter a detailed product description..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  resize: 'vertical',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Variants */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', margin: 0, color: '#374151' }}>
                  Product Variants
                  <span style={{ fontWeight: '400', color: '#6b7280', marginLeft: '6px', fontSize: '0.85rem' }}>(Optional)</span>
                </label>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
                  Add variants if this product has multiple options (size, color, weight, etc.)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                style={{
                  background: 'white',
                  color: '#FF5500',
                  border: '1px solid #FF5500',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#FF5500';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#FF5500';
                }}
              >
                + Add Variant
              </button>
            </div>

            {(formData.variants || []).length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  background: '#f9fafb',
                  border: '1px dashed #e5e7eb',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '0.85rem',
                }}
              >
                No variants yet. Click <strong>+ Add Variant</strong> to add options like Small / Medium / Large.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(formData.variants || []).map((variant, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '14px 14px 10px',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '14px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Variant #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      title="Remove Variant"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '10px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: '10px',
                        marginTop: '22px',
                      }}
                    >
                      {/* Name */}
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Variant Name *</span>
                        <input
                          type="text"
                          placeholder="e.g. Small / Red / 1kg"
                          value={variant.name || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                          style={{ width: '100%', padding: '7px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e5e7eb', marginTop: '4px', boxSizing: 'border-box', background: '#fff', outline: 'none' }}
                          onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                      {/* Price */}
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                          Price (ETB) <span style={{ color: '#9ca3af' }}>optional</span>
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={`Base: ${formData.price || 0}`}
                          value={variant.price !== undefined ? variant.price : ''}
                          onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleUpdateVariant(idx, 'price', value.toString());
                            }
                          }}
                          style={{ width: '100%', padding: '7px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e5e7eb', marginTop: '4px', boxSizing: 'border-box', background: '#fff', outline: 'none' }}
                          onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                        />
                      </div>
                      {/* Stock */}
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Stock Qty</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Qty"
                          value={variant.stock !== undefined ? variant.stock : ''}
                          onChange={(e) => handleUpdateVariant(idx, 'stock', e.target.value)}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                              handleUpdateVariant(idx, 'stock', value.toString());
                            }
                          }}
                          style={{ width: '100%', padding: '7px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e5e7eb', marginTop: '4px', boxSizing: 'border-box', background: '#fff', outline: 'none' }}
                          onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                        />
                      </div>
                      {/* SKU */}
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>SKU</span>
                        <input
                          type="text"
                          placeholder="e.g. MILK-1KG"
                          value={variant.sku || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                          style={{ width: '100%', padding: '7px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e5e7eb', marginTop: '4px', boxSizing: 'border-box', background: '#fff', outline: 'none' }}
                          onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Sidebar / Media Section (Right 4 Columns - Sticky) */}
        <div className="product-form-right space-y-6">
          {/* Image Upload */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>Product Image</h3>
            
            <div className="image-upload">
              {formData.image ? (
                <div className="image-preview" style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <img
                    src={
                      typeof formData.image === 'string'
                        ? formData.image
                        : formData.image instanceof File
                        ? URL.createObjectURL(formData.image)
                        : ''
                    }
                    alt="Preview"
                    style={{ width: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: null })}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: '#FF5500',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      lineHeight: '28px',
                      textAlign: 'center',
                      fontSize: '1rem',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="image-input-options" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label
                    style={{
                      cursor: 'pointer',
                      padding: '24px',
                      border: '2px dashed #FF5500',
                      borderRadius: '8px',
                      textAlign: 'center',
                      color: '#6b7280',
                      transition: 'all 0.2s',
                      background: '#fff',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#fff5f0';
                      e.target.style.borderColor = '#e64d00';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#fff';
                      e.target.style.borderColor = '#FF5500';
                    }}
                  >
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📤</span>
                    <span style={{ fontWeight: '500', color: '#FF5500' }}>Upload Image File</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '4px', color: '#9ca3af' }}>PNG, JPG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>— OR —</div>
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={typeof formData.image === 'string' ? formData.image : ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.9rem',
                      background: '#fff',
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FF5500'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Live Product Card Preview */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>Live Preview</h3>
            
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#fff',
              }}
            >
              {/* Product Image */}
              <div style={{ width: '100%', height: '200px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {formData.image ? (
                  <img
                    src={
                      typeof formData.image === 'string'
                        ? formData.image
                        : formData.image instanceof File
                        ? URL.createObjectURL(formData.image)
                        : ''
                    }
                    alt="Product Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '3rem', color: '#d1d5db' }}>📦</span>
                )}
              </div>
              
              {/* Product Info */}
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#FF5500', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase' }}>
                  {formData.category || 'Category'}
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '600', color: '#111827', lineHeight: '1.3' }}>
                  {formData.name || 'Product Name'}
                </h4>
                {formData.description && (
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {formData.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FF5500' }}>
                    {formData.price ? `ETB ${parseFloat(formData.price).toFixed(2)}` : 'ETB 0.00'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {formData.stock !== undefined && formData.stock !== '' ? `${parseInt(formData.stock, 10)} ${formData.unit || 'pc'}` : '0 pc'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                style={{
                  minWidth: '100px',
                  padding: '10px 20px',
                  background: 'white',
                  color: '#FF5500',
                  border: '1px solid #FF5500',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.target.style.borderColor = '#FF5500';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#FF5500';
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={saving}
                style={{
                  minWidth: '130px',
                  padding: '10px 20px',
                  background: '#FF5500',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.target.style.background = '#e64d00';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#FF5500';
                }}
              >
                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;


