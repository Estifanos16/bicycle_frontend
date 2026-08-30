import React, { useState, useEffect } from 'react';
import { useVendor } from '../context/VendorContext';
import { AuthContext } from '../context/AuthContext';

const VendorSettings = () => {
  const { user } = React.useContext(AuthContext);
  const { vendorProfile, fetchVendorProfile, saveVendorProfile, loading } = useVendor();
  const [activeTab, setActiveTab] = useState('branding');
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
  const [completionPercentage, setCompletionPercentage] = useState(45);

  // Store Branding & Info State
  const [branding, setBranding] = useState({
    storeName: '',
    storeSlug: '',
    storeCategory: '',
    businessBio: '',
    coverBanner: null,
    storeLogo: null
  });

  // Business & Operations State
  const [operations, setOperations] = useState({
    streetAddress: '',
    city: '',
    region: '',
    postalCode: '',
    phoneNumber: '',
    supportEmail: '',
    minimumOrderAmount: 0,
    autoAcceptOrders: false,
    preparationTime: '',
    operatingHours: {
      monday: { open: false, openTime: '09:00', closeTime: '18:00' },
      tuesday: { open: false, openTime: '09:00', closeTime: '18:00' },
      wednesday: { open: false, openTime: '09:00', closeTime: '18:00' },
      thursday: { open: false, openTime: '09:00', closeTime: '18:00' },
      friday: { open: false, openTime: '09:00', closeTime: '18:00' },
      saturday: { open: false, openTime: '09:00', closeTime: '18:00' },
      sunday: { open: false, openTime: '09:00', closeTime: '18:00' }
    }
  });

  // Banking & Payout State - Multi-account support
  const [banking, setBanking] = useState({
    cbeAccounts: [{ id: 1, accountHolderName: '', bankName: 'cbe', accountNumber: '', branchName: '', isPrimary: true }],
    otherBankAccounts: [{ id: 1, accountHolderName: '', bankName: '', accountNumber: '', branchName: '', isPrimary: true }],
    telebirrAccounts: [{ id: 1, phone: '', registeredName: '', isPrimary: true }],
    otherWalletAccounts: [{ id: 1, walletType: '', phone: '', registeredName: '', isPrimary: true }],
    taxId: '',
    verificationDocument: null
  });

  const [activePaymentSection, setActivePaymentSection] = useState('cbe');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Auto-generate store slug from store name
  useEffect(() => {
    if (branding.storeName) {
      const slug = branding.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setBranding(prev => ({ ...prev, storeSlug: slug }));
    }
  }, [branding.storeName]);

  // Pre-fill form data from vendor profile
  useEffect(() => {
    if (vendorProfile) {
      // Pre-fill branding
      if (vendorProfile.branding) {
        setBranding(prev => ({
          ...prev,
          storeName: vendorProfile.branding.storeName || prev.storeName,
          storeSlug: vendorProfile.branding.storeSlug || prev.storeSlug,
          storeCategory: vendorProfile.branding.storeCategory || prev.storeCategory,
          businessBio: vendorProfile.branding.businessBio || prev.businessBio,
          storeLogo: vendorProfile.branding.storeLogo || prev.storeLogo,
          storeBanner: vendorProfile.branding.storeBanner || prev.storeBanner
        }));
      }

      // Pre-fill operations
      if (vendorProfile.operations) {
        setOperations(prev => ({
          ...prev,
          streetAddress: vendorProfile.operations.streetAddress || prev.streetAddress,
          city: vendorProfile.operations.city || prev.city,
          region: vendorProfile.operations.region || prev.region,
          postalCode: vendorProfile.operations.postalCode || prev.postalCode,
          phoneNumber: vendorProfile.operations.phoneNumber || prev.phoneNumber,
          supportEmail: vendorProfile.operations.supportEmail || prev.supportEmail,
          minimumOrderAmount: vendorProfile.operations.minimumOrderAmount ?? prev.minimumOrderAmount,
          autoAcceptOrders: vendorProfile.operations.autoAcceptOrders ?? prev.autoAcceptOrders,
          preparationTime: vendorProfile.operations.preparationTime || prev.preparationTime,
          operatingHours: vendorProfile.operations.operatingHours || prev.operatingHours
        }));
      }

      // Pre-fill banking
      if (vendorProfile.banking) {
        setBanking(prev => ({
          ...prev,
          cbeAccounts: vendorProfile.banking.cbeAccounts || prev.cbeAccounts,
          otherBankAccounts: vendorProfile.banking.otherBankAccounts || prev.otherBankAccounts,
          telebirrAccounts: vendorProfile.banking.telebirrAccounts || prev.telebirrAccounts,
          otherWalletAccounts: vendorProfile.banking.otherWalletAccounts || prev.otherWalletAccounts,
          taxId: vendorProfile.banking.taxId || prev.taxId,
          verificationDocument: vendorProfile.banking.verificationDocument || prev.verificationDocument
        }));
      }
    }
  }, [vendorProfile]);

  // Fetch vendor profile on mount
  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const handleSave = async () => {
    setErrors({});
    setSaveStatus('saving');

    // Validation
    const newErrors = {};

    // Branding validation
    if (!branding.storeName.trim()) newErrors.storeName = 'Store name is required';
    if (!branding.storeCategory) newErrors.storeCategory = 'Store category is required';
    if (branding.businessBio.length > 500) newErrors.businessBio = 'Bio must be 500 characters or less';

    // Operations validation
    if (!operations.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!/^(\+251|09|07)[0-9]{8}$/.test(operations.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Invalid Ethiopian phone number (use +251, 09, or 07 format)';
    }
    if (!operations.supportEmail.trim()) newErrors.supportEmail = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(operations.supportEmail)) {
      newErrors.supportEmail = 'Invalid email format';
    }

    // Banking validation - Multi-account structure
    // Validate at least one account per category is filled
    if (banking.cbeAccounts.length === 0 || !banking.cbeAccounts[0].accountNumber) {
      newErrors.cbeAccounts = 'At least one CBE account is required';
    } else {
      banking.cbeAccounts.forEach((acc, idx) => {
        if (!acc.accountNumber) newErrors[`cbe_${idx}_accountNumber`] = 'Account number is required';
        if (acc.bankName === 'cbe' && acc.accountNumber && !/^[0-9]{13}$/.test(acc.accountNumber)) {
          newErrors[`cbe_${idx}_accountNumber`] = 'CBE account must be 13 digits';
        }
        if (!acc.accountHolderName) newErrors[`cbe_${idx}_accountHolderName`] = 'Account holder name is required';
      });
    }

    if (banking.otherBankAccounts.length === 0 || !banking.otherBankAccounts[0].accountNumber) {
      newErrors.otherBankAccounts = 'At least one Other Bank account is required';
    } else {
      banking.otherBankAccounts.forEach((acc, idx) => {
        if (!acc.accountNumber) newErrors[`otherBank_${idx}_accountNumber`] = 'Account number is required';
        if (!acc.bankName) newErrors[`otherBank_${idx}_bankName`] = 'Bank name is required';
        if (!acc.accountHolderName) newErrors[`otherBank_${idx}_accountHolderName`] = 'Account holder name is required';
      });
    }

    if (banking.telebirrAccounts.length === 0 || !banking.telebirrAccounts[0].phone) {
      newErrors.telebirrAccounts = 'At least one Telebirr account is required';
    } else {
      banking.telebirrAccounts.forEach((acc, idx) => {
        if (!acc.phone) newErrors[`telebirr_${idx}_phone`] = 'Phone number is required';
        if (acc.phone && !/^(\+251|09|07)[0-9]{8}$/.test(acc.phone.replace(/\s/g, ''))) {
          newErrors[`telebirr_${idx}_phone`] = 'Invalid Ethiopian phone number (use +251, 09, or 07 format)';
        }
        if (!acc.registeredName) newErrors[`telebirr_${idx}_registeredName`] = 'Registered name is required';
      });
    }

    if (banking.otherWalletAccounts.length === 0 || !banking.otherWalletAccounts[0].phone) {
      newErrors.otherWalletAccounts = 'At least one Other Wallet account is required';
    } else {
      banking.otherWalletAccounts.forEach((acc, idx) => {
        if (!acc.phone) newErrors[`otherWallet_${idx}_phone`] = 'Phone number is required';
        if (acc.phone && !/^(\+251|09|07)[0-9]{8}$/.test(acc.phone.replace(/\s/g, ''))) {
          newErrors[`otherWallet_${idx}_phone`] = 'Invalid Ethiopian phone number (use +251, 09, or 07 format)';
        }
        if (!acc.walletType) newErrors[`otherWallet_${idx}_walletType`] = 'Wallet type is required';
        if (!acc.registeredName) newErrors[`otherWallet_${idx}_registeredName`] = 'Registered name is required';
      });
    }

    // TIN validation - 10 digits
    if (banking.taxId && !/^[0-9]{10}$/.test(banking.taxId)) {
      newErrors.taxId = 'TIN must be 10 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    // Prepare profile data for API
    const profileData = {
      branding,
      operations,
      banking
    };

    // Save to API
    const result = await saveVendorProfile(profileData);
    
    if (result) {
      setSaveStatus('success');
      setCompletionPercentage(85);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleImageUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'coverBanner') {
          setBranding(prev => ({ ...prev, coverBanner: reader.result }));
        } else if (field === 'storeLogo') {
          setBranding(prev => ({ ...prev, storeLogo: reader.result }));
        } else if (field === 'verificationDocument') {
          setBanking(prev => ({ ...prev, verificationDocument: file.name }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setOperations(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  // Add account helper functions
  const addAccount = (category) => {
    const newId = Date.now();
    if (category === 'cbe') {
      setBanking(prev => ({
        ...prev,
        cbeAccounts: [...prev.cbeAccounts, { id: newId, accountHolderName: '', bankName: 'cbe', accountNumber: '', branchName: '', isPrimary: false }]
      }));
    } else if (category === 'otherBank') {
      setBanking(prev => ({
        ...prev,
        otherBankAccounts: [...prev.otherBankAccounts, { id: newId, accountHolderName: '', bankName: '', accountNumber: '', branchName: '', isPrimary: false }]
      }));
    } else if (category === 'telebirr') {
      setBanking(prev => ({
        ...prev,
        telebirrAccounts: [...prev.telebirrAccounts, { id: newId, phone: '', registeredName: '', isPrimary: false }]
      }));
    } else if (category === 'otherWallet') {
      setBanking(prev => ({
        ...prev,
        otherWalletAccounts: [...prev.otherWalletAccounts, { id: newId, walletType: '', phone: '', registeredName: '', isPrimary: false }]
      }));
    }
  };

  const removeAccount = (category, accountId) => {
    if (category === 'cbe') {
      setBanking(prev => ({
        ...prev,
        cbeAccounts: prev.cbeAccounts.filter(acc => acc.id !== accountId)
      }));
    } else if (category === 'otherBank') {
      setBanking(prev => ({
        ...prev,
        otherBankAccounts: prev.otherBankAccounts.filter(acc => acc.id !== accountId)
      }));
    } else if (category === 'telebirr') {
      setBanking(prev => ({
        ...prev,
        telebirrAccounts: prev.telebirrAccounts.filter(acc => acc.id !== accountId)
      }));
    } else if (category === 'otherWallet') {
      setBanking(prev => ({
        ...prev,
        otherWalletAccounts: prev.otherWalletAccounts.filter(acc => acc.id !== accountId)
      }));
    }
  };

  const updateAccount = (category, accountId, field, value) => {
    if (category === 'cbe') {
      setBanking(prev => ({
        ...prev,
        cbeAccounts: prev.cbeAccounts.map(acc => acc.id === accountId ? { ...acc, [field]: value } : acc)
      }));
    } else if (category === 'otherBank') {
      setBanking(prev => ({
        ...prev,
        otherBankAccounts: prev.otherBankAccounts.map(acc => acc.id === accountId ? { ...acc, [field]: value } : acc)
      }));
    } else if (category === 'telebirr') {
      setBanking(prev => ({
        ...prev,
        telebirrAccounts: prev.telebirrAccounts.map(acc => acc.id === accountId ? { ...acc, [field]: value } : acc)
      }));
    } else if (category === 'otherWallet') {
      setBanking(prev => ({
        ...prev,
        otherWalletAccounts: prev.otherWalletAccounts.map(acc => acc.id === accountId ? { ...acc, [field]: value } : acc)
      }));
    }
  };

  const setPrimaryAccount = (category, accountId) => {
    if (category === 'cbe') {
      setBanking(prev => ({
        ...prev,
        cbeAccounts: prev.cbeAccounts.map(acc => ({ ...acc, isPrimary: acc.id === accountId }))
      }));
    } else if (category === 'otherBank') {
      setBanking(prev => ({
        ...prev,
        otherBankAccounts: prev.otherBankAccounts.map(acc => ({ ...acc, isPrimary: acc.id === accountId }))
      }));
    } else if (category === 'telebirr') {
      setBanking(prev => ({
        ...prev,
        telebirrAccounts: prev.telebirrAccounts.map(acc => ({ ...acc, isPrimary: acc.id === accountId }))
      }));
    } else if (category === 'otherWallet') {
      setBanking(prev => ({
        ...prev,
        otherWalletAccounts: prev.otherWalletAccounts.map(acc => ({ ...acc, isPrimary: acc.id === accountId }))
      }));
    }
  };

  const tabs = [
    { id: 'branding', label: 'Store Branding & Info', icon: '🏪' },
    { id: 'operations', label: 'Business & Operations', icon: '⚙️' },
    { id: 'banking', label: 'Banking & Payout', icon: '💳' }
  ];

  return (
    <div className="vendor-settings">
      {/* Header Banner */}
      <div className="settings-header">
        <div className="header-content">
          <div>
            <h1>Store Settings</h1>
            <p>Manage your store profile, operations, and payout preferences</p>
          </div>
          <div className="completion-indicator">
            <div className="completion-bar">
              <div 
                className="completion-fill" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="completion-text">{completionPercentage}% Complete</span>
          </div>
        </div>
        <button 
          className={`save-button ${saveStatus}`}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {saveStatus === 'error' && (
          <div className="toast error">
            Please fix the validation errors before saving.
          </div>
        )}

        {saveStatus === 'success' && (
          <div className="toast success">
            Settings saved successfully!
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="tab-panel">
            <h2>Store Branding & Information</h2>
            
            {/* Cover Banner Upload */}
            <div className="form-section">
              <label>Store Cover Banner</label>
              <div className="image-upload-zone">
                {branding.coverBanner ? (
                  <div className="image-preview">
                    <img src={branding.coverBanner} alt="Cover Banner" />
                    <button 
                      className="remove-image"
                      onClick={() => setBranding(prev => ({ ...prev, coverBanner: null }))}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <p>Drag & drop or click to upload</p>
                    <span className="upload-hint">Recommended: 1200x300px</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('coverBanner', e.target.files[0])}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Store Logo Upload */}
            <div className="form-section">
              <label>Store Logo</label>
              <div className="logo-upload-zone">
                {branding.storeLogo ? (
                  <div className="logo-preview">
                    <img src={branding.storeLogo} alt="Store Logo" />
                    <button 
                      className="remove-logo"
                      onClick={() => setBranding(prev => ({ ...prev, storeLogo: null }))}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="logo-placeholder">
                    <span className="upload-icon">🏷️</span>
                    <p>Upload Logo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('storeLogo', e.target.files[0])}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Store Name */}
            <div className="form-section">
              <label>Store Name *</label>
              <input
                type="text"
                value={branding.storeName}
                onChange={(e) => setBranding(prev => ({ ...prev, storeName: e.target.value }))}
                placeholder="Enter your store name"
                className={errors.storeName ? 'error' : ''}
              />
              {errors.storeName && <span className="error-message">{errors.storeName}</span>}
            </div>

            {/* Store Slug */}
            <div className="form-section">
              <label>Store URL</label>
              <div className="url-display">
                <span>bicycleapp.com/store/</span>
                <input
                  type="text"
                  value={branding.storeSlug}
                  readOnly
                  className="readonly"
                />
              </div>
            </div>

            {/* Store Category */}
            <div className="form-section">
              <label>Store Category *</label>
              <select
                value={branding.storeCategory}
                onChange={(e) => setBranding(prev => ({ ...prev, storeCategory: e.target.value }))}
                className={errors.storeCategory ? 'error' : ''}
              >
                <option value="">Select Category</option>
                <option value="supermarket">Supermarket</option>
                <option value="grocery">Grocery</option>
                <option value="bakery">Bakery</option>
                <option value="specialty">Specialty Goods</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="electronics">Electronics</option>
              </select>
              {errors.storeCategory && <span className="error-message">{errors.storeCategory}</span>}
            </div>

            {/* Business Bio */}
            <div className="form-section">
              <label>Business Bio</label>
              <textarea
                value={branding.businessBio}
                onChange={(e) => setBranding(prev => ({ ...prev, businessBio: e.target.value }))}
                placeholder="Tell customers about your store..."
                maxLength={500}
                rows={4}
                className={errors.businessBio ? 'error' : ''}
              />
              <div className="char-counter">
                {branding.businessBio.length}/500
              </div>
              {errors.businessBio && <span className="error-message">{errors.businessBio}</span>}
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="tab-panel">
            <h2>Business & Operations</h2>

            {/* Operating Hours */}
            <div className="form-section">
              <label>Operating Hours</label>
              <div className="operating-hours">
                {Object.entries(operations.operatingHours).map(([day, hours]) => (
                  <div key={day} className="hours-row">
                    <div className="day-name">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={hours.open}
                          onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <span className={hours.open ? 'active' : ''}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                    </div>
                    {hours.open && (
                      <div className="time-pickers">
                        <input
                          type="time"
                          value={hours.openTime}
                          onChange={(e) => handleOperatingHoursChange(day, 'openTime', e.target.value)}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hours.closeTime}
                          onChange={(e) => handleOperatingHoursChange(day, 'closeTime', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Location Settings */}
            <div className="form-section">
              <label>Physical Store Address</label>
              <input
                type="text"
                placeholder="Street Address"
                value={operations.streetAddress}
                onChange={(e) => setOperations(prev => ({ ...prev, streetAddress: e.target.value }))}
              />
              <div className="address-row">
                <input
                  type="text"
                  placeholder="City"
                  value={operations.city}
                  onChange={(e) => setOperations(prev => ({ ...prev, city: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Region/State"
                  value={operations.region}
                  onChange={(e) => setOperations(prev => ({ ...prev, region: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={operations.postalCode}
                  onChange={(e) => setOperations(prev => ({ ...prev, postalCode: e.target.value }))}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <label>Contact Information</label>
              <input
                type="tel"
                placeholder="Phone Number *"
                value={operations.phoneNumber}
                onChange={(e) => setOperations(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className={errors.phoneNumber ? 'error' : ''}
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              <input
                type="email"
                placeholder="Support Email *"
                value={operations.supportEmail}
                onChange={(e) => setOperations(prev => ({ ...prev, supportEmail: e.target.value }))}
                className={errors.supportEmail ? 'error' : ''}
              />
              {errors.supportEmail && <span className="error-message">{errors.supportEmail}</span>}
            </div>

            {/* Order Rules */}
            <div className="form-section">
              <label>Order Rules & Constraints</label>
              <input
                type="number"
                placeholder="Minimum Order Amount ($)"
                value={operations.minimumOrderAmount}
                onChange={(e) => setOperations(prev => ({ ...prev, minimumOrderAmount: Number(e.target.value) }))}
              />
              <div className="toggle-row">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={operations.autoAcceptOrders}
                    onChange={(e) => setOperations(prev => ({ ...prev, autoAcceptOrders: e.target.checked }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span>Auto-Accept Orders</span>
              </div>
              <label>Default Preparation Time (Optional)</label>
              <select
                value={operations.preparationTime}
                onChange={(e) => setOperations(prev => ({ ...prev, preparationTime: e.target.value }))}
              >
                <option value="">Select default preparation time</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="variable">Variable / Set per product</option>
              </select>
              <div className="alert-badge info">
                <span>ℹ️</span>
                <p>Item-specific preparation times can be defined directly on the Product Management page for instant items vs. made-to-order meals.</p>
              </div>
              <p className="prep-note">
                Default estimated time to prepare an order. Can be overridden per product in Product Management.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="tab-panel">
            <h2>Banking & Payout Credentials</h2>

            {/* Required Accounts Notice */}
            <div className="prep-note" style={{marginBottom: '24px'}}>
              <strong>Required Accounts</strong>
              <p style={{margin: '4px 0 0 0'}}>You must add at least one account for each payment method (CBE, Other Bank, Telebirr, Other Wallet) to enable payouts.</p>
            </div>

            {/* 4-Card Payment Method Selection */}
            <div className="form-section">
              <label>Payout Method</label>
              <div className="payout-methods ethiopian-methods">
                <div
                  className={`payout-card ${activePaymentSection === 'cbe' ? 'active' : ''}`}
                  onClick={() => setActivePaymentSection('cbe')}
                >
                  <span className="payout-icon">🏦</span>
                  <span>CBE</span>
                </div>
                <div
                  className={`payout-card ${activePaymentSection === 'otherBank' ? 'active' : ''}`}
                  onClick={() => setActivePaymentSection('otherBank')}
                >
                  <span className="payout-icon">🏦</span>
                  <span>Other Bank</span>
                </div>
                <div
                  className={`payout-card ${activePaymentSection === 'telebirr' ? 'active' : ''}`}
                  onClick={() => setActivePaymentSection('telebirr')}
                >
                  <span className="payout-icon">📱</span>
                  <span>Telebirr</span>
                </div>
                <div
                  className={`payout-card ${activePaymentSection === 'otherWallet' ? 'active' : ''}`}
                  onClick={() => setActivePaymentSection('otherWallet')}
                >
                  <span className="payout-icon">👛</span>
                  <span>Other Wallet</span>
                </div>
              </div>
            </div>

            {/* CBE Accounts Section */}
            {activePaymentSection === 'cbe' && (
              <div className="account-section">
                <div className="section-header">
                  <h3>🏦 CBE (Commercial Bank of Ethiopia)</h3>
                  <button 
                    className="add-account-btn"
                    onClick={() => addAccount('cbe')}
                  >
                    + Add CBE Account
                  </button>
                </div>
                {errors.cbeAccounts && <span className="error-message">{errors.cbeAccounts}</span>}
                {banking.cbeAccounts.map((account, idx) => (
                  <div key={account.id} className="account-card">
                    <div className="account-header">
                      <span>CBE Account #{idx + 1}</span>
                      <div className="account-actions">
                        <button 
                          className={`primary-toggle ${account.isPrimary ? 'active' : ''}`}
                          onClick={() => setPrimaryAccount('cbe', account.id)}
                        >
                          {account.isPrimary ? '⭐ Primary' : 'Set Primary'}
                        </button>
                        {banking.cbeAccounts.length > 1 && (
                          <button 
                            className="remove-account-btn"
                            onClick={() => removeAccount('cbe', account.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Account Holder Full Name *"
                      value={account.accountHolderName}
                      onChange={(e) => updateAccount('cbe', account.id, 'accountHolderName', e.target.value)}
                      className={errors[`cbe_${idx}_accountHolderName`] ? 'error' : ''}
                    />
                    {errors[`cbe_${idx}_accountHolderName`] && <span className="error-message">{errors[`cbe_${idx}_accountHolderName`]}</span>}
                    <input
                      type="text"
                      placeholder="Account Number (13 digits) *"
                      value={account.accountNumber}
                      onChange={(e) => updateAccount('cbe', account.id, 'accountNumber', e.target.value)}
                      className={errors[`cbe_${idx}_accountNumber`] ? 'error' : ''}
                    />
                    {errors[`cbe_${idx}_accountNumber`] && <span className="error-message">{errors[`cbe_${idx}_accountNumber`]}</span>}
                    <span className="input-hint">CBE account must be exactly 13 digits</span>
                    <input
                      type="text"
                      placeholder="Branch Name / Code"
                      value={account.branchName}
                      onChange={(e) => updateAccount('cbe', account.id, 'branchName', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Other Bank Accounts Section */}
            {activePaymentSection === 'otherBank' && (
              <div className="account-section">
                <div className="section-header">
                  <h3>🏦 Other Bank (Awash, Dashen, Abyssinia, Coop, Wegagen, etc.)</h3>
                  <button 
                    className="add-account-btn"
                    onClick={() => addAccount('otherBank')}
                  >
                    + Add Bank Account
                  </button>
                </div>
                {errors.otherBankAccounts && <span className="error-message">{errors.otherBankAccounts}</span>}
                {banking.otherBankAccounts.map((account, idx) => (
                  <div key={account.id} className="account-card">
                    <div className="account-header">
                      <span>Bank Account #{idx + 1}</span>
                      <div className="account-actions">
                        <button 
                          className={`primary-toggle ${account.isPrimary ? 'active' : ''}`}
                          onClick={() => setPrimaryAccount('otherBank', account.id)}
                        >
                          {account.isPrimary ? '⭐ Primary' : 'Set Primary'}
                        </button>
                        {banking.otherBankAccounts.length > 1 && (
                          <button 
                            className="remove-account-btn"
                            onClick={() => removeAccount('otherBank', account.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Account Holder Full Name *"
                      value={account.accountHolderName}
                      onChange={(e) => updateAccount('otherBank', account.id, 'accountHolderName', e.target.value)}
                      className={errors[`otherBank_${idx}_accountHolderName`] ? 'error' : ''}
                    />
                    {errors[`otherBank_${idx}_accountHolderName`] && <span className="error-message">{errors[`otherBank_${idx}_accountHolderName`]}</span>}
                    <select
                      value={account.bankName}
                      onChange={(e) => updateAccount('otherBank', account.id, 'bankName', e.target.value)}
                      className={errors[`otherBank_${idx}_bankName`] ? 'error' : ''}
                    >
                      <option value="">Select Bank</option>
                      <option value="awash">Awash Bank</option>
                      <option value="dashen">Dashen Bank</option>
                      <option value="bank-of-abyssinia">Bank of Abyssinia</option>
                      <option value="wegagen">Wegagen Bank</option>
                      <option value="nib">NIB International Bank</option>
                      <option value="coop">Cooperative Bank of Oromia</option>
                      <option value="berhan">Berhan Bank</option>
                      <option value="buna">Buna International Bank</option>
                      <option value="hijra">Hijra Bank</option>
                      <option value="amhara">Amhara Bank</option>
                      <option value="sidama">Sidama Bank</option>
                      <option value="goh">Goh Betoch Bank</option>
                      <option value="zamzam">Zamzam Bank</option>
                      <option value="ethio">Ethio Bank</option>
                      <option value="buna-sidama">Buna S.C. Bank</option>
                      <option value="addis">Addis Bank</option>
                      <option value="anb">Africa Nile Bank</option>
                      <option value="tsehay">Tsehay Bank</option>
                      <option value="abel">Abel Bank</option>
                    </select>
                    {errors[`otherBank_${idx}_bankName`] && <span className="error-message">{errors[`otherBank_${idx}_bankName`]}</span>}
                    <input
                      type="text"
                      placeholder="Account Number *"
                      value={account.accountNumber}
                      onChange={(e) => updateAccount('otherBank', account.id, 'accountNumber', e.target.value)}
                      className={errors[`otherBank_${idx}_accountNumber`] ? 'error' : ''}
                    />
                    {errors[`otherBank_${idx}_accountNumber`] && <span className="error-message">{errors[`otherBank_${idx}_accountNumber`]}</span>}
                    <input
                      type="text"
                      placeholder="Branch Name / Code"
                      value={account.branchName}
                      onChange={(e) => updateAccount('otherBank', account.id, 'branchName', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Telebirr Accounts Section */}
            {activePaymentSection === 'telebirr' && (
              <div className="account-section">
                <div className="section-header">
                  <h3>📱 Telebirr</h3>
                  <button 
                    className="add-account-btn"
                    onClick={() => addAccount('telebirr')}
                  >
                    + Add Telebirr Account
                  </button>
                </div>
                {errors.telebirrAccounts && <span className="error-message">{errors.telebirrAccounts}</span>}
                {banking.telebirrAccounts.map((account, idx) => (
                  <div key={account.id} className="account-card">
                    <div className="account-header">
                      <span>Telebirr Account #{idx + 1}</span>
                      <div className="account-actions">
                        <button 
                          className={`primary-toggle ${account.isPrimary ? 'active' : ''}`}
                          onClick={() => setPrimaryAccount('telebirr', account.id)}
                        >
                          {account.isPrimary ? '⭐ Primary' : 'Set Primary'}
                        </button>
                        {banking.telebirrAccounts.length > 1 && (
                          <button 
                            className="remove-account-btn"
                            onClick={() => removeAccount('telebirr', account.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="tel"
                      placeholder="Registered Phone Number (+251 format) *"
                      value={account.phone}
                      onChange={(e) => updateAccount('telebirr', account.id, 'phone', e.target.value)}
                      className={errors[`telebirr_${idx}_phone`] ? 'error' : ''}
                    />
                    {errors[`telebirr_${idx}_phone`] && <span className="error-message">{errors[`telebirr_${idx}_phone`]}</span>}
                    <span className="input-hint">Format: +2519XXXXXXXX or 09XXXXXXXX</span>
                    <input
                      type="text"
                      placeholder="Registered Full Name *"
                      value={account.registeredName}
                      onChange={(e) => updateAccount('telebirr', account.id, 'registeredName', e.target.value)}
                      className={errors[`telebirr_${idx}_registeredName`] ? 'error' : ''}
                    />
                    {errors[`telebirr_${idx}_registeredName`] && <span className="error-message">{errors[`telebirr_${idx}_registeredName`]}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Other Wallet Accounts Section */}
            {activePaymentSection === 'otherWallet' && (
              <div className="account-section">
                <div className="section-header">
                  <h3>👛 Other Wallet (CBE Birr, Awash Birr, E-Birr, Kacha, etc.)</h3>
                  <button 
                    className="add-account-btn"
                    onClick={() => addAccount('otherWallet')}
                  >
                    + Add Wallet Account
                  </button>
                </div>
                {errors.otherWalletAccounts && <span className="error-message">{errors.otherWalletAccounts}</span>}
                {banking.otherWalletAccounts.map((account, idx) => (
                  <div key={account.id} className="account-card">
                    <div className="account-header">
                      <span>Wallet Account #{idx + 1}</span>
                      <div className="account-actions">
                        <button 
                          className={`primary-toggle ${account.isPrimary ? 'active' : ''}`}
                          onClick={() => setPrimaryAccount('otherWallet', account.id)}
                        >
                          {account.isPrimary ? '⭐ Primary' : 'Set Primary'}
                        </button>
                        {banking.otherWalletAccounts.length > 1 && (
                          <button 
                            className="remove-account-btn"
                            onClick={() => removeAccount('otherWallet', account.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <select
                      value={account.walletType}
                      onChange={(e) => updateAccount('otherWallet', account.id, 'walletType', e.target.value)}
                      className={errors[`otherWallet_${idx}_walletType`] ? 'error' : ''}
                    >
                      <option value="">Select Wallet Type</option>
                      <option value="cbe-birr">CBE Birr</option>
                      <option value="awash-birr">Awash Birr</option>
                      <option value="e-birr">E-Birr</option>
                      <option value="kacha">Kacha</option>
                      <option value="m-birr">M-Birr</option>
                      <option value="telebirr">Telebirr (as wallet)</option>
                      <option value="amole">Amole</option>
                      <option value="buna-birr">Buna Birr</option>
                      <option value="walle">Walle</option>
                    </select>
                    {errors[`otherWallet_${idx}_walletType`] && <span className="error-message">{errors[`otherWallet_${idx}_walletType`]}</span>}
                    <input
                      type="tel"
                      placeholder="Registered Phone Number (+251 format) *"
                      value={account.phone}
                      onChange={(e) => updateAccount('otherWallet', account.id, 'phone', e.target.value)}
                      className={errors[`otherWallet_${idx}_phone`] ? 'error' : ''}
                    />
                    {errors[`otherWallet_${idx}_phone`] && <span className="error-message">{errors[`otherWallet_${idx}_phone`]}</span>}
                    <span className="input-hint">Format: +2519XXXXXXXX or 09XXXXXXXX</span>
                    <input
                      type="text"
                      placeholder="Registered Full Name *"
                      value={account.registeredName}
                      onChange={(e) => updateAccount('otherWallet', account.id, 'registeredName', e.target.value)}
                      className={errors[`otherWallet_${idx}_registeredName`] ? 'error' : ''}
                    />
                    {errors[`otherWallet_${idx}_registeredName`] && <span className="error-message">{errors[`otherWallet_${idx}_registeredName`]}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Global Verification Section */}
            <div className="account-section global-verification">
              <h3>📋 Global Business & Tax Verification</h3>
              <div className="prep-note" style={{marginBottom: '16px'}}>
                <p style={{margin: 0}}>Verification documents submitted here apply to all linked bank and wallet accounts.</p>
              </div>
              <label>Tax Identification Number (TIN)</label>
              <input
                type="text"
                placeholder="Enter 10-digit TIN"
                value={banking.taxId}
                onChange={(e) => setBanking(prev => ({ ...prev, taxId: e.target.value }))}
                className={errors.taxId ? 'error' : ''}
              />
              {errors.taxId && <span className="error-message">{errors.taxId}</span>}
              <span className="input-hint">TIN must be exactly 10 digits</span>
              
              <label>Business Verification Document</label>
              <div className="upload-zone">
                {banking.verificationDocument ? (
                  <div className="uploaded-file">
                    <span>📄</span>
                    <span>{banking.verificationDocument}</span>
                    <button 
                      onClick={() => setBanking(prev => ({ ...prev, verificationDocument: null }))}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📤</span>
                    <p>Upload Trade License / Business Registration Certificate</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleImageUpload('verificationDocument', e.target.files[0])}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSettings;
