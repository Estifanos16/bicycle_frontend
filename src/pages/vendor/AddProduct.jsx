import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createProduct } from '../../services/api';
import ProductForm from '../../components/product/ProductForm';

const EMPTY_FORM = {
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
};

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formKey, setFormKey] = useState(0);

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

      await createProduct(formDataToSend);
      setMessage('Product created successfully!');
      setFormData(EMPTY_FORM);
      setFormKey(prev => prev + 1); // Force form remount to clear previews

      // Navigate to dashboard after short delay
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProductForm
      key={formKey}
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/')}
      saving={saving}
      isEdit={false}
      error={error}
      message={message}
    />
  );
};

export default AddProduct;


