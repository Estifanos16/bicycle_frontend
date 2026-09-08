import React, { useState, useEffect } from 'react';

const ProductModal = ({
  showModal,
  handleCloseModal,
  handleSubmit,
  editingProduct,
  formData,
  setFormData,
  saving,
  predefinedCategories = [],
  handleImageUpload
}) => {
  const handleAddVariant = () => {
    const newVariant = { name: '', sku: '', price: '', stock: '' };
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), newVariant]
    });
  };

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...(formData.variants || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, variants: updated });
  };

  const handleRemoveVariant = (index) => {
    const updated = (formData.variants || []).filter((_, i) => i !== index);
    setFormData({ ...formData, variants: updated });
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={handleCloseModal}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="product-name">Product Name *</label>
            <input
              id="product-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
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
                {predefinedCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="product-price">Price (ETB) *</label>
              <input
                id="product-price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-stock">Stock Quantity *</label>
              <input
                id="product-stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-unit">Unit of Measure *</label>
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
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </div>
          </div>

          {/* Description field - textarea name="description" */}
          <div className="form-group">
            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              name="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Enter detailed product description..."
            />
          </div>

          {/* Product Variants Section */}
          <div className="form-group" style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Product Variants (Optional)</label>
              <button
                type="button"
                onClick={handleAddVariant}
                style={{ background: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff', borderRadius: '4px', padding: '4px 10px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                + Add Variant
              </button>
            </div>
            
            {(formData.variants || []).length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', margin: '4px 0' }}>
                No variants added. Add variants if this item has multiple options (e.g. Size: S/M/L, Color: Red/Blue).
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(formData.variants || []).map((variant, idx) => (
                  <div key={idx} style={{ background: '#f9f9f9', border: '1px solid #e8e8e8', borderRadius: '6px', padding: '10px', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 'bold' }}
                      title="Remove Variant"
                    >
                      ✕
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>Variant Name *</span>
                        <input
                          type="text"
                          placeholder="e.g. Small / Red"
                          value={variant.name || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                          style={{ width: '100%', padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>Price (ETB)</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={`Base (${formData.price || 0})`}
                          value={variant.price !== undefined ? variant.price : ''}
                          onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                          style={{ width: '100%', padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>Stock</span>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={variant.stock !== undefined ? variant.stock : ''}
                          onChange={(e) => handleUpdateVariant(idx, 'stock', e.target.value)}
                          style={{ width: '100%', padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>SKU</span>
                        <input
                          type="text"
                          placeholder="SKU"
                          value={variant.sku || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                          style={{ width: '100%', padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <div className="image-upload">
              {formData.image ? (
                <div className="image-preview" style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={typeof formData.image === 'string' ? formData.image : (formData.image instanceof File ? URL.createObjectURL(formData.image) : '')}
                    alt="Preview"
                    style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => setFormData({ ...formData, image: null })}
                    style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="image-input-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="upload-label" style={{ cursor: 'pointer', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px', textAlign: 'center' }}>
                    <span>📤 Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#888' }}>— OR —</div>
                  <input
                    type="url"
                    placeholder="Paste Image URL (e.g. https://images.unsplash.com/...)"
                    value={typeof formData.image === 'string' ? formData.image : ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;


