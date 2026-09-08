import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { updateProduct } from '../../services/api';
import ProductForm from '../../components/product/ProductForm';
import { getProductById } from '../../services/api';

const EditProduct = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    unit: 'piece',
    variants: [],
    preparationTime: '15',
    description: '',
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // ── Fetch existing product ────────────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getProductById(id);
        const product = response.data;

        const existingImage =
          product.images && typeof product.images[0] === 'string' && !product.images[0].includes('{}')
            ? product.images[0]
            : typeof product.image === 'string' && !product.image.includes('{}')
            ? product.image
            : null;

        setFormData({
          name: product.name || '',
          category: product.category || '',
          price: product.price || '',
          stock: product.stock || '',
          unit: product.unit || 'piece',
          variants: product.variants || [],
          preparationTime: product.preparationTime || '15',
          description: product.description || '',
          image: existingImage,
        });
      } catch (err) {
        setError('Failed to load product. It may not exist or you may not have access.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const vId = user?.vendorId || user?.supermarketId || user?.id || user?._id;

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', Number(formData.price));
      formDataToSend.append('stock', Number(formData.stock));
      formDataToSend.append('unit', formData.unit || 'piece');
      formDataToSend.append('variants', JSON.stringify(formData.variants || []));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('vendorId', vId);
      formDataToSend.append('vendor', vId);
      formDataToSend.append('supermarketId', vId);

      if (formData.image) {
        if (formData.image instanceof File) {
          const base64Str = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(formData.image);
          });
          formDataToSend.append('image', base64Str);
        } else if (
          typeof formData.image === 'string' &&
          formData.image.trim() !== '' &&
          !formData.image.includes('{}')
        ) {
          formDataToSend.append('image', formData.image);
        }
      }

      await updateProduct(id, formDataToSend);
      setMessage('Product updated successfully!');

      // Navigate back to product list after short delay
      setTimeout(() => navigate('/products'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container" style={{ padding: '28px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '60px auto' }} />
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '28px 20px' }}>
      <ProductForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/products')}
        saving={saving}
        isEdit={true}
        error={error}
        message={message}
      />
    </div>
  );
};

export default EditProduct;


