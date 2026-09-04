import React, { useState, useEffect, useContext } from 'react';
import { getProducts, getVendorProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Products = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, description: '', category: '', stock: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [message, setMessage] = useState('');

  // Predefined categories for supermarket owners
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
    try {
      const urlParams = new URLSearchParams(location.search);
      const vendorIdParam = urlParams.get('vendorId');
      const categoryParam = urlParams.get('category');
      const qParam = urlParams.get('q') || urlParams.get('query');

      const userRoles = user?.roles || [];
      const isVendorUser = userRoles.includes('supermarket') || 
                           userRoles.includes('vendor') || 
                           userRoles.includes('vendor_staff') || 
                           userRoles.includes('supermarket_owner') || 
                           user?.role === 'vendor';
      const vendorId = vendorIdParam || (isVendorUser ? (user?.vendorId || user?.supermarketId || user?._id || user?.id) : null);

      const requestParams = {};
      if (vendorId) requestParams.vendorId = vendorId;
      if (categoryParam && categoryParam !== 'All') requestParams.category = categoryParam;
      if (qParam) requestParams.q = qParam;

      const response = await getProducts(requestParams);
      let fetchedProducts = response.data || [];
      if (isVendorUser) {
        const userVendorIds = [
          user?.vendorId?._id || user?.vendorId,
          user?.supermarketId?._id || user?.supermarketId,
          user?._id,
          user?.id
        ].filter(Boolean).map(id => id.toString());

        fetchedProducts = fetchedProducts.filter(p => {
          const pVendorId = (p.supermarketId?._id || p.supermarketId || p.vendorId?._id || p.vendorId || p.vendor?._id || p.vendor)?.toString();
          return pVendorId && userVendorIds.includes(pVendorId);
        });
      }
      setProducts(fetchedProducts);
    } catch (err) {
      console.error(err);
      setMessage('Unable to load products.');
    }
  };

  useEffect(() => {
    fetchProducts();
    // initialize filters from URL params (search & category)
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || params.get('query');
    const category = params.get('category');
    if (q) setSearchTerm(q);
    if (category) setSelectedCategory(category);
  }, [location.search, user]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const response = await updateProduct(editingProduct._id, newProduct);
        setProducts(products.map((p) => (p._id === editingProduct._id ? response.data.product : p)));
        setMessage('Product updated successfully!');
        setEditingProduct(null);
      } else {
        const response = await createProduct(newProduct);
        setProducts([response.data.product, ...products]);
        setMessage('Product created successfully!');
      }
      setNewProduct({ name: '', price: 0, description: '', category: '', stock: 0 });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      setMessage('Product deleted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEdit = async (product) => {
    const newName = prompt('Enter new product name:', product.name);
    const newPrice = prompt('Enter new price:', product.price);
    const newCategory = prompt('Enter new category:', product.category || '');
    const newDescription = prompt('Enter new description:', product.description);
    const newStock = prompt('Enter new stock quantity:', product.stock);

    if (newName !== null && newPrice !== null) {
      try {
        const updated = await updateProduct(product._id, {
          name: newName,
          price: Number(newPrice),
          category: newCategory,
          description: newDescription,
          stock: Number(newStock),
        });
        setProducts(products.map((p) => (p._id === product._id ? updated.data.product : p)));
        setMessage('Product updated successfully!');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to update product');
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.trim().toLowerCase();
    const category = product.category || 'General';
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      (product.description || '').toLowerCase().includes(term) ||
      category.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set([...predefinedCategories, ...products.map((product) => product.category || 'General')]))].sort();

  return (
    <div className="container">
      <div className="page-header">
        <h2>Products</h2>
        <p>Browse the latest supermarket products and add new items if you manage a store.</p>
      </div>

      <div className="product-filters">
        <input
          type="search"
          placeholder="Search products by name, description, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {message && <div className="alert">{message}</div>}

      {user?.roles?.includes('supermarket') && (
        <div className="card card-form">
          <h3>{editingProduct ? 'Update Product' : 'Add New Product'}</h3>
          <form onSubmit={handleCreateOrUpdate} className="product-form">
            <input
              type="text"
              placeholder="Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              required
            />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {predefinedCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              required
            />
            <button type="submit">{editingProduct ? 'Update Product' : 'Save Product'}</button>
          </form>
        </div>
      )}

      {user?.roles?.includes('customer') && (
        <div className="card alert">
          <h3>Customer Shop</h3>
          <p>Go to the shop page to add products to your cart and place an order.</p>
          <Link to="/orders" className="button-secondary">Go to Shop</Link>
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div className="product-card" key={product._id}>
            <div className="product-card-header">
              <h3>{product.name}</h3>
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-warning'}`}>
                {product.stock > 0 ? 'In stock' : 'Out of stock'}
              </span>
            </div>
            <p className="product-category">Category: {product.category || 'General'}</p>
            <p className="product-description text-xs text-gray-500 line-clamp-2">{product.description || 'No description available.'}</p>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-seller">Seller: {product.supermarketId?.name || 'Supermarket'}</p>
            {user?.roles?.includes('supermarket') && product.supermarketId?._id === user._id && (
              <div className="product-actions">
                <button className="button-secondary" onClick={() => handleEdit(product)}>
                  Edit
                </button>
                <button className="button-secondary" onClick={() => handleDelete(product._id)}>
                  Delete
                </button>
              </div>
            )}
            <button className="add-btn" disabled={product.stock <= 0} onClick={() => { addToCart(product); navigate('/orders'); }}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;

