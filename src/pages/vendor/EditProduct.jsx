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
    images: [],
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

        const existingImages = product.images && Array.isArray(product.images)
          ? product.images.filter(img => img && typeof img === 'string' && !img.includes('{}') && !img.includes('[object Object]'))
          : [];

        const existingImage = existingImages.length > 0
          ? existingImages[0]
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
          images: existingImages,
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
  const handleSubmit = async () => {
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

      // Handle multiple images - send URLs as JSON, files as FormData
      const images = formData.images || [];
      const urlImages = [];
      const fileImages = [];

      for (const img of images) {
        if (img instanceof File) {
          fileImages.push(img);
        } else if (
          typeof img === 'string' &&
          img.trim() !== '' &&
          !img.includes('{}') &&
          !img.includes('[object Object]')
        ) {
          urlImages.push(img);
        }
      }

      // Append URL images as JSON array
      if (urlImages.length > 0) {
        formDataToSend.append('images', JSON.stringify(urlImages));
      }

      // Append file images directly for multer to handle
      fileImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      await updateProduct(id, formDataToSend);
      setMessage('Product updated successfully!');

      // Navigate to dashboard after short delay
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '28px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '60px auto' }} />
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <ProductForm
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/')}
      saving={saving}
      isEdit={true}
      error={error}
      message={message}
    />
  );
};

export default EditProduct;


