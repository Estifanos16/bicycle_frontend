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
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: '#374151',
          }}
        >
          ← Back
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
            {isEdit
              ? 'Update the product details below.'
              : 'Fill in the details to list a new product in your store.'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Form card */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '28px',
          maxWidth: '820px',
        }}
      >
        <form onSubmit={onSubmit} className="product-form">
          {/* Name */}
          <div className="form-group">
            <label htmlFor="product-name">Product Name *</label>
            <input
              id="product-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Organic Whole Milk"
              required
            />
          </div>

          {/* Category + Price */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-category">Category *</label>
              <select
                id="product-category"
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {PREDEFINED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="product-price">Base Price (ETB) *</label>
              <input
                id="product-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Stock + Unit + Prep Time */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-stock">Stock Quantity *</label>
              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-unit">Unit of Measure</label>
              <select
                id="product-unit"
                name="unit"
                value={formData.unit || 'piece'}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="piece">Piece (pc)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="liter">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="pack">Pack</option>
                <option value="box">Box</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="product-prepTime">Preparation Time</label>
              <select
                id="product-prepTime"
                name="preparationTime"
                value={formData.preparationTime || '15'}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              name="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Enter a detailed product description..."
            />
          </div>

          {/* ── Product Image ─────────────────────────────────────────────────── */}
          <div className="form-group" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', marginTop: '4px' }}>
            <label>Product Image</label>
            <div className="image-upload">
              {formData.image ? (
                <div className="image-preview" style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={
                      typeof formData.image === 'string'
                        ? formData.image
                        : formData.image instanceof File
                        ? URL.createObjectURL(formData.image)
                        : ''
                    }
                    alt="Preview"
                    style={{ maxWidth: '140px', maxHeight: '140px', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: null })}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: '#ff4d4f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      lineHeight: '24px',
                      textAlign: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="image-input-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                  <label
                    style={{
                      cursor: 'pointer',
                      padding: '14px',
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      textAlign: 'center',
                      color: '#6b7280',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px' }}>📤</span>
                    <span style={{ fontWeight: '500' }}>Upload Image File</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '2px' }}>PNG, JPG, WEBP up to 5MB</span>
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
                    placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                    value={typeof formData.image === 'string' ? formData.image : ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Variants Section ──────────────────────────────────────────────── */}
          <div
            className="form-group"
            style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', marginTop: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <label style={{ fontWeight: '600', fontSize: '0.95rem', display: 'block', margin: 0 }}>
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
                  background: '#e6f7ff',
                  color: '#1890ff',
                  border: '1px solid #91d5ff',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: '500',
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
                          style={{ width: '100%', padding: '7px 8px', fontSize: '0.85rem', borderRadius: '5px', border: '1px solid #d1d5db', marginTop: '4px', boxSizing: 'border-box' }}
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
                          style={{ width: '100%', padding: '7px 8px', fontSize: '0.85rem', borderRadius: '5px', border: '1px solid #d1d5db', marginTop: '4px', boxSizing: 'border-box' }}
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
                          style={{ width: '100%', padding: '7px 8px', fontSize: '0.85rem', borderRadius: '5px', border: '1px solid #d1d5db', marginTop: '4px', boxSizing: 'border-box' }}
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
                          style={{ width: '100%', padding: '7px 8px', fontSize: '0.85rem', borderRadius: '5px', border: '1px solid #d1d5db', marginTop: '4px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ───────────────────────────────────────────────────────── */}
          <div
            className="form-actions"
            style={{
              borderTop: '1px solid #f3f4f6',
              paddingTop: '20px',
              marginTop: '20px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={saving}
              style={{ minWidth: '100px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ minWidth: '130px' }}
            >
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;


