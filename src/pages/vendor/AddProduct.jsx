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
};

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

      await createProduct(formDataToSend);
      setMessage('Product created successfully!');
      setFormData(EMPTY_FORM);

      // Navigate back to product list after short delay
      setTimeout(() => navigate('/products'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '28px 20px' }}>
      <ProductForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/products')}
        saving={saving}
        isEdit={false}
        error={error}
        message={message}
      />
    </div>
  );
};

export default AddProduct;


