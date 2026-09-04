import React, { useState, useEffect, useContext } from 'react';
import { getVendorProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ProductModal from '../components/ProductModal';

const VendorProducts = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    preparationTime: '15',
    description: '',
    image: null
  });

  // Predefined categories
  const predefinedCategories = [
    'General',
    'Clothing',
    'Electronics',
    'Food',
    'Beverages',
    'Household',
    'Sports',
    'Toys',
    'Books',
    'Health & Beauty',
    'Automotive',
    'Gardening',
    'Furniture',
    'Appliances',
    'Pet Supplies'
  ];

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    const userStorageKey = `vendor_products_${user?.id || user?._id || user?.vendorId || 'guest'}`;
    
    try {
      // Fetch strictly vendor-scoped products from backend endpoint
      const response = await getVendorProducts();
      console.log('Fetched vendor-scoped products:', response.data);
      
      const vendorProducts = response.data || [];
      setProducts(vendorProducts);
      // Sync to user-scoped localStorage as fallback
      localStorage.setItem(userStorageKey, JSON.stringify(vendorProducts));
    } catch (err) {
      console.error('API fetch failed, using localStorage fallback:', err);
      // Fallback to user-scoped localStorage
      const storedProducts = localStorage.getItem(userStorageKey);
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          setProducts(parsedProducts);
        } catch (parseErr) {
          console.error('Failed to parse localStorage products:', parseErr);
          setProducts([]);
          setError('Failed to load products from storage');
        }
      } else {
        setProducts([]);
        setError('No products found. Add your first product to get started.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  // Sync products to user-scoped localStorage whenever they change
  useEffect(() => {
    if (products.length > 0 && user) {
      const userStorageKey = `vendor_products_${user?.id || user?._id || user?.vendorId || 'guest'}`;
      localStorage.setItem(userStorageKey, JSON.stringify(products));
    }
  }, [products, user]);

  // Apply filters
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => (p.category || 'General') === selectedCategory);
    }

    // Stock filter
    if (stockFilter === 'In Stock') {
      filtered = filtered.filter(p => p.stock > 0);
    } else if (stockFilter === 'Out of Stock') {
      filtered = filtered.filter(p => p.stock <= 0);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, stockFilter, products]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category || '',
        price: product.price,
        stock: product.stock,
        preparationTime: product.preparationTime || '15',
        description: product.description || '',
        image: (product.images && product.images[0]) || product.image || null
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        preparationTime: '15',
        description: '',
        image: null
      });
    }
    setShowModal(true);
    setMessage('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      preparationTime: '15',
      description: '',
      image: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    
    try {
      const vId = user?.vendorId || user?.supermarketId || user?._id || user?.id;
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', Number(formData.price));
      formDataToSend.append('stock', Number(formData.stock));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('vendorId', vId);
      formDataToSend.append('vendor', vId);
      formDataToSend.append('supermarketId', vId);

      // Handle image - append file if it's a File object
      if (formData.image) {
        if (formData.image instanceof File) {
          formDataToSend.append('image', formData.image);
        } else if (typeof formData.image === 'string') {
          // If it's a URL string (from existing product), send it as regular field
          formDataToSend.append('image', formData.image);
        }
      }

      console.log('Submitting product data with FormData');

      if (editingProduct) {
        const response = await updateProduct(editingProduct._id, formDataToSend);
        console.log('Update response:', response);
        const updatedProduct = response.product || response.data?.product;
        console.log('Updated product:', updatedProduct);
        setProducts(products.map(p => p._id === editingProduct._id ? updatedProduct : p));
        setMessage('Product updated successfully!');
      } else {
        const response = await createProduct(formDataToSend);
        console.log('Create response:', response);
        const newProduct = response.product || response.data?.product;
        console.log('New product:', newProduct);
        setProducts([newProduct, ...products]);
        setMessage('Product created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save product';
      setError(errorMsg);
      console.error('API save failed, using localStorage fallback:', err);
      
      // Fallback: save to localStorage if API fails
      try {
        if (editingProduct) {
          const updatedProducts = products.map(p => 
            p._id === editingProduct._id 
              ? { ...p, ...formData, price: Number(formData.price), stock: Number(formData.stock) }
              : p
          );
          setProducts(updatedProducts);
          setMessage('Product saved locally (API unavailable)');
        } else {
          const newProduct = {
            _id: Date.now().toString(),
            supermarketId: { _id: user._id },
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            active: true,
            createdAt: new Date().toISOString()
          };
          setProducts([newProduct, ...products]);
          setMessage('Product saved locally (API unavailable)');
        }
        handleCloseModal();
      } catch (localErr) {
        setError('Failed to save product both to API and local storage');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setSaving(true);
    setError('');
    setMessage('');
    
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
      setMessage('Product deleted successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete product';
      setError(errorMsg);
      console.error('API delete failed, using localStorage fallback:', err);
      
      // Fallback: delete from localStorage if API fails
      try {
        setProducts(products.filter(p => p._id !== id));
        setMessage('Product deleted locally (API unavailable)');
      } catch (localErr) {
        setError('Failed to delete product from both API and local storage');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const updated = await updateProduct(product._id, { active: !product.active });
      setProducts(products.map(p => p._id === product._id ? updated.data.product : p));
    } catch (err) {
      console.error('API toggle failed, using localStorage fallback:', err);
      // Fallback: toggle in localStorage if API fails
      setProducts(products.map(p => 
        p._id === product._id 
          ? { ...p, active: !p.active }
          : p
      ));
      setError('Status updated locally (API unavailable)');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file object directly for FormData upload
      setFormData({ ...formData, image: file });
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 800x800)
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          console.log('Image compressed:', file.size, '->', compressedDataUrl.length);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
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
        <button className="btn-primary" onClick={() => handleOpenModal()}>
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
                        <div className="product-name">{product.name}</div>
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
                  <td className="price-cell">ETB {product.price.toFixed(2)}</td>
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
                        onClick={() => handleOpenModal(product)}
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

      {/* Add/Edit Product Modal */}
      <ProductModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleSubmit={handleSubmit}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        saving={saving}
        predefinedCategories={predefinedCategories}
        handleImageUpload={handleImageUpload}
      />
    </div>
  );
};

export default VendorProducts;
