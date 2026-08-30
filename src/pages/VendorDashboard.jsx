import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useVendor } from '../context/VendorContext';
import { Link } from 'react-router-dom';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const { vendorProfile, calculateProfileCompletion, getVerificationStatus, isStoreOpen } = useVendor();

  const completionPercentage = calculateProfileCompletion();
  const verificationStatus = getVerificationStatus();
  const storeOpen = isStoreOpen();

  return (
    <div className="container">
      <div className="page-header" style={{padding:'6px 0'}}>
        <h1 style={{fontSize:'1.2rem',margin:'0 0 2px 0'}}>
          {vendorProfile?.branding?.storeName || 'Vendor Dashboard'}
        </h1>
        <p className="muted" style={{fontSize:'0.7rem',margin:0}}>Manage your store and view performance</p>
      </div>

      {/* Profile Completion Card */}
      <div className="card" style={{padding:'16px', marginBottom:'16px', borderRadius:'12px', background:'linear-gradient(135deg, #FF5500 0%, #FF7700 100%)', color:'white'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
          <h3 style={{margin:0, fontSize:'1rem'}}>Profile Completion</h3>
          <span style={{fontSize:'2rem', fontWeight:'700'}}>{completionPercentage}%</span>
        </div>
        <div style={{background:'rgba(255,255,255,0.3)', borderRadius:'8px', height:'8px', marginBottom:'12px'}}>
          <div 
            style={{
              background:'white',
              borderRadius:'8px',
              height:'100%',
              width:`${completionPercentage}%`,
              transition:'width 0.3s ease'
            }}
          />
        </div>
        <p style={{margin:0, fontSize:'0.85rem', opacity:0.9}}>
          {completionPercentage < 100 ? 'Complete your profile to enable all features' : 'Your profile is complete!'}
        </p>
        {completionPercentage < 100 && (
          <Link 
            to="/vendor/settings" 
            style={{
              display:'inline-block',
              marginTop:'12px',
              padding:'8px 16px',
              background:'white',
              color:'#FF5500',
              textDecoration:'none',
              borderRadius:'8px',
              fontSize:'0.85rem',
              fontWeight:'600'
            }}
          >
            Complete Profile
          </Link>
        )}
      </div>

      {/* Verification Status Card */}
      <div className="card" style={{padding:'16px', marginBottom:'16px', borderRadius:'12px', background:'#F9FAFB', border:'1px solid #E5E7EB'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
          <h3 style={{margin:0, fontSize:'1rem', color:'#1F2937'}}>Verification Status</h3>
          <span style={{
            padding:'4px 12px',
            borderRadius:'20px',
            fontSize:'0.75rem',
            fontWeight:'600',
            background: verificationStatus === 'Verified' ? '#D1FAE5' : verificationStatus === 'Pending Verification' ? '#FEF3C7' : '#F3F4F6',
            color: verificationStatus === 'Verified' ? '#065F46' : verificationStatus === 'Pending Verification' ? '#92400E' : '#6B7280'
          }}>
            {verificationStatus}
          </span>
        </div>
        <p style={{margin:0, fontSize:'0.85rem', color:'#6B7280', marginBottom:'12px'}}>
          {verificationStatus === 'Verified' 
            ? 'Your business is verified. You can accept payments and process orders.'
            : verificationStatus === 'Pending Verification'
            ? 'Your verification documents are under review. This usually takes 1-2 business days.'
            : 'Upload your TIN and business documents to get verified and start accepting payments.'}
        </p>
        {verificationStatus !== 'Verified' && (
          <Link 
            to="/vendor/settings" 
            style={{
              display:'inline-block',
              padding:'8px 16px',
              background:'#FF5500',
              color:'white',
              textDecoration:'none',
              borderRadius:'8px',
              fontSize:'0.85rem',
              fontWeight:'600'
            }}
          >
            Upload Documents
          </Link>
        )}
      </div>

      {/* Store Status Card */}
      <div className="card" style={{padding:'16px', marginBottom:'16px', borderRadius:'12px', background:'#F9FAFB', border:'1px solid #E5E7EB'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
          <h3 style={{margin:0, fontSize:'1rem', color:'#1F2937'}}>Store Status</h3>
          <span style={{
            padding:'4px 12px',
            borderRadius:'20px',
            fontSize:'0.75rem',
            fontWeight:'600',
            background: storeOpen ? '#D1FAE5' : '#FEE2E2',
            color: storeOpen ? '#065F46' : '#991B1B'
          }}>
            {storeOpen ? '🟢 Open' : '🔴 Closed'}
          </span>
        </div>
        <p style={{margin:0, fontSize:'0.85rem', color:'#6B7280'}}>
          {storeOpen 
            ? 'Your store is currently open and accepting orders.'
            : 'Your store is currently closed based on your operating hours.'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{padding:'16px', borderRadius:'12px', background:'#F9FAFB', border:'1px solid #E5E7EB'}}>
        <h3 style={{margin:'0 0 16px 0', fontSize:'1rem', color:'#1F2937'}}>Quick Actions</h3>
        <div style={{display:'grid', gap:'12px'}}>
          <Link 
            to="/vendor/settings" 
            style={{
              display:'flex',
              alignItems:'center',
              gap:'12px',
              padding:'12px',
              background:'white',
              border:'1px solid #E5E7EB',
              borderRadius:'8px',
              textDecoration:'none',
              color:'#1F2937'
            }}
          >
            <span style={{fontSize:'1.5rem'}}>⚙️</span>
            <div>
              <div style={{fontWeight:'600', fontSize:'0.9rem'}}>Store Settings</div>
              <div style={{fontSize:'0.75rem', color:'#6B7280'}}>Update your profile and payout methods</div>
            </div>
          </Link>
          <Link 
            to="/products" 
            style={{
              display:'flex',
              alignItems:'center',
              gap:'12px',
              padding:'12px',
              background:'white',
              border:'1px solid #E5E7EB',
              borderRadius:'8px',
              textDecoration:'none',
              color:'#1F2937'
            }}
          >
            <span style={{fontSize:'1.5rem'}}>📦</span>
            <div>
              <div style={{fontWeight:'600', fontSize:'0.9rem'}}>Manage Products</div>
              <div style={{fontSize:'0.75rem', color:'#6B7280'}}>Add, edit, or remove products</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
