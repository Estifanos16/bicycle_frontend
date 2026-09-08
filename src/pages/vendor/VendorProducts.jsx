import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVendorProducts, deleteProduct, updateProduct } from '../../services/api';

const VendorProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  
  const predefinedCategories = [
    'General', 'Clothing', 'Electronics', 'Food', 'Beverages',
    'Household', 'Sports', 'Toys', 'Books', 'Health & Beauty',
    'Automotive', 'Gardening', 'Furniture', 'Appliances', 'Pet Supplies'
  ];

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getVendorProducts();
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term)
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => (p.category || 'General') === selectedCategory);
    }
    if (stockFilter === 'In Stock') {
      filtered = filtered.filter(p => p.stock > 0);
    } else if (stockFilter === 'Out of Stock') {
      filtered = filtered.filter(p => p.stock <= 0);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, stockFilter, products]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    setMessage('');
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      setMessage('Product deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const updated = await updateProduct(product._id, { active: !product.active });
      setProducts(prev => prev.map(p => p._id === product._id ? updated.data.product : p));
    } catch (err) {
      console.error('Toggle active failed:', err);
      // Optimistic local toggle
      setProducts(prev => prev.map(p =>
        p._id === product._id ? { ...p, active: !p.active } : p
      ));
    }
  };

  const categories = ['All', ...Array.from(new Set([...predefinedCategories, ...products.map(p => p.category || 'General')]))].sort();

  return (
    <div className="vendor-products">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Product Inventory</h1>
          <p className="subtext">Manage your store products and inventory ({products.length} items)</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/vendor/products/new')}>
          + Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <input
            type="search"
            placeholder="Search products by name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-info'}`}>
          {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p>No products found</p>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            + Add Your First Product
          </button>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>DESCRIPTION</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Prep Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id}>
                  <td className="product-cell">
                    <div className="product-info">
                      {(product.images && product.images[0]) || product.image ? (
                        <img src={(product.images && product.images[0]) || product.image} alt={product.name} className="product-thumb" />
                      ) : null}
                      <div>
                        <div className="product-name">
                          {product.name}
                          {product.variants && product.variants.length > 0 && (
                            <span className="badge" style={{ background: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff', marginLeft: '6px', fontSize: '0.7rem', padding: '2px 6px' }}>
                              ⚡ {product.variants.length} Variants
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <div className="product-description-sub text-xs text-gray-500 line-clamp-1" title={product.description}>
                            {product.description}
                          </div>
                        )}
                        <div className="product-sku">SKU: {product._id.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="description-cell text-xs text-gray-500">
                    <div className="line-clamp-1 truncate max-w-xs" title={product.description || ''}>
                      {product.description || '-'}
                    </div>
                  </td>
                  <td className="category-cell">{product.category || 'General'}</td>
                  <td className="price-cell">ETB {product.price.toFixed(2)} <span style={{ fontSize: '0.8rem', color: '#666' }}>/ {product.unit || 'piece'}</span></td>
                  <td className="stock-cell">
                    <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="stock-count">({product.stock})</span>
                  </td>
                  <td className="prep-cell">{product.preparationTime || '15'}m</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        onClick={() => navigate(`/vendor/products/${product._id}/edit`)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleDelete(product._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                      <button
                        className={`toggle-btn ${product.active !== false ? 'active' : ''}`}
                        onClick={() => handleToggleActive(product)}
                        title={product.active !== false ? 'Active' : 'Inactive'}
                      >
                        <span className="toggle-slider"></span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default VendorProducts;

