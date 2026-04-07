import React, { useState, useEffect, useContext } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Products = () => {
  const { user } = useContext(AuthContext);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, description: '', stock: 0 });
  const [message, setMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setMessage('Unable to load products.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      setNewProduct({ name: '', price: 0, description: '', stock: 0 });
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
    const newDescription = prompt('Enter new description:', product.description);
    const newStock = prompt('Enter new stock quantity:', product.stock);

    if (newName !== null && newPrice !== null) {
      try {
        const updated = await updateProduct(product._id, {
          name: newName,
          price: Number(newPrice),
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

  return (
    <div className="container">
      <div className="page-header">
        <h2>Products</h2>
        <p>Browse the latest supermarket products and add new items if you manage a store.</p>
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
          <a href="/orders" className="button-secondary">Go to Shop</a>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <div className="product-card-header">
              <h3>{product.name}</h3>
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-warning'}`}>
                {product.stock > 0 ? 'In stock' : 'Out of stock'}
              </span>
            </div>
            <p className="product-description">{product.description || 'No description available.'}</p>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;