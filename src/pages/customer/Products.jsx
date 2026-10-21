import React, { useState, useEffect, useContext, useRef } from 'react';
import { getProducts, getVendorProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import VariantModal from '../../components/product/VariantModal';

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
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef(null);

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

  const fetchProducts = () => {
    console.log('fetchProducts called');
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

      // Build SSE URL with query parameters
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const sseUrl = new URL(`${baseURL}/api/products/stream`);
      if (vendorId) sseUrl.searchParams.append('vendorId', vendorId);
      if (categoryParam && categoryParam !== 'All') sseUrl.searchParams.append('category', categoryParam);
      if (qParam) sseUrl.searchParams.append('q', qParam);

      console.log('SSE URL:', sseUrl.toString());

      // Reset products and start streaming
      setProducts([]);
      setIsStreaming(true);

      const eventSource = new EventSource(sseUrl.toString());
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        console.log('SSE message received');
        try {
          const newProduct = JSON.parse(event.data);
          setProducts((prev) => [...prev, newProduct]);
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      eventSource.addEventListener('end', () => {
        console.log('SSE stream ended');
        setIsStreaming(false);
        eventSource.close();
        
        // Apply vendor filtering after streaming completes
        if (isVendorUser) {
          setProducts((prevProducts) => {
            const userVendorIds = [
              user?.vendorId?._id || user?.vendorId,
              user?.supermarketId?._id || user?.supermarketId,
              user?._id,
              user?.id
            ].filter(Boolean).map(id => id.toString());

            return prevProducts.filter(p => {
              const pVendorId = (p.supermarketId?._id || p.supermarketId || p.vendorId?._id || p.vendorId || p.vendor?._id || p.vendor)?.toString();
              return pVendorId && userVendorIds.includes(pVendorId);
            });
          });
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        setIsStreaming(false);
        eventSource.close();
        
        // Fallback to regular API on SSE error
        console.log('Falling back to regular API');
        const requestParams = {};
        if (vendorId) requestParams.vendorId = vendorId;
        if (categoryParam && categoryParam !== 'All') requestParams.category = categoryParam;
        if (qParam) requestParams.q = qParam;

        getProducts(requestParams).then(response => {
          console.log('API response received:', response.data);
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
        }).catch(err => {
          console.error(err);
          setMessage('Unable to load products.');
        });
      };

      // Cleanup function to close EventSource on unmount
      return () => {
        console.log('Cleaning up EventSource');
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      setMessage('Unable to load products.');
      setIsStreaming(false);
      return () => {};
    }
  };

  useEffect(() => {
    let isMounted = true;
    const cleanup = fetchProducts();
    // initialize filters from URL params (search & category)
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || params.get('query');
    const category = params.get('category');
    if (q) setSearchTerm(q);
    if (category) setSelectedCategory(category);
    else setSelectedCategory('All');
    
    return () => {
      isMounted = false;
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [location.search, user, location]);

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

  const handleOpenVariantModal = (product) => {
    setVariantModalProduct(product);
  };

  const handleCloseVariantModal = () => {
    setVariantModalProduct(null);
  };

  const handleAddToCartFromModal = (item) => {
    addToCart(item);
    navigate('/shop');
  };

  return (
    <div className="container" style={{width: '100%', maxWidth: '100%'}}>
      <div className="page-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div>
          <h2>Products</h2>
          <p>Browse the latest supermarket products and add new items if you manage a store.</p>
        </div>
        {isStreaming && (
          <span className="animate-pulse" style={{
            color: '#FF5500',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            ⚡ Loading items...
          </span>
        )}
      </div>

      <div className="product-filters">
        <input
          type="search"
          placeholder="Search products by name, description, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width:'100%',
            padding:'12px 16px',
            border:'1px solid #E5E7EB',
            borderRadius:'8px',
            fontSize:'0.95rem',
            outline:'none',
            transition:'all 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#FF5500'}
          onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
        />
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
            <input
              type="text"
              placeholder="Image URL (e.g. https://...)"
              value={newProduct.image || ''}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
            />
            <button type="submit">{editingProduct ? 'Update Product' : 'Save Product'}</button>
          </form>
        </div>
      )}

      {user?.roles?.includes('customer') && (
        <div className="card alert">
          <h3>Customer Shop</h3>
          <p>Go to the shop page to add products to your cart and place an order.</p>
          <Link to="/shop" className="button-secondary">Go to Shop</Link>
        </div>
      )}

      {/* Responsive Product Grid with ProductCard */}
      <div style={{
        padding: '0 24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: filteredProducts.length <= 6
            ? `repeat(${filteredProducts.length}, minmax(180px, 240px))`
            : 'repeat(auto-fill, minmax(180px, 240px))',
          gap: '20px',
          justifyContent: 'center',
          width: '100%',
          overflowX: 'hidden'
        }}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            storeOpen={true}
            compact={true}
            onOpenVariantModal={handleOpenVariantModal}
            onAddToCart={(prod, selectedVariant) => {
              const itemToAdd = selectedVariant
                ? {
                    ...prod,
                    selectedVariant,
                    name: `${prod.name} (${selectedVariant.name})`,
                    price: selectedVariant.price !== undefined && selectedVariant.price !== null && selectedVariant.price !== '' ? Number(selectedVariant.price) : prod.price,
                    stock: selectedVariant.stock !== undefined && selectedVariant.stock !== null && selectedVariant.stock !== '' ? Number(selectedVariant.stock) : prod.stock
                  }
                : prod;
              addToCart(itemToAdd);
              navigate('/shop');
            }}
          />
        ))}
        </div>
      </div>

      {/* Vendor Edit/Delete Actions (shown below each product for vendors) */}
      {user?.roles?.includes('supermarket') && filteredProducts.some(p => p.supermarketId?._id === user._id) && (
        <div style={{marginTop:'24px'}}>
          <h3 style={{marginBottom:'16px'}}>Your Products Management</h3>
          {filteredProducts.filter(p => p.supermarketId?._id === user._id).map((product) => (
            <div key={product._id} style={{
              padding:'16px',
              background:'#F9FAFB',
              borderRadius:'8px',
              marginBottom:'12px',
              border:'1px solid #E5E7EB'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <strong>{product.name}</strong>
                  <div style={{fontSize:'0.85rem', color:'#6B7280'}}>
                    ETB {product.price.toFixed(2)} • Stock: {product.stock}
                  </div>
                </div>
                <div style={{display:'flex', gap:'8px'}}>
                  <button
                    className="button-secondary"
                    onClick={() => handleEdit(product)}
                    style={{padding:'6px 12px', fontSize:'0.85rem'}}
                  >
                    Edit
                  </button>
                  <button
                    className="button-secondary"
                    onClick={() => handleDelete(product._id)}
                    style={{padding:'6px 12px', fontSize:'0.85rem', background:'#FEE2E2', borderColor:'#FCA5A5', color:'#991B1B'}}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variant Modal */}
      <VariantModal
        product={variantModalProduct}
        isOpen={!!variantModalProduct}
        onClose={handleCloseVariantModal}
        onAddToCart={handleAddToCartFromModal}
        storeOpen={true}
      />
    </div>
  );
};

export default Products;


