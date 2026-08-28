import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { key: 'electronics', label: 'Electronics', mark: 'E' },
  { key: 'clothing', label: 'Clothing', mark: 'C' },
  { key: 'home', label: 'Home', mark: 'H' },
  { key: 'beauty', label: 'Beauty', mark: 'B' },
  { key: 'sports', label: 'Sports', mark: 'S' },
  { key: 'toys', label: 'Toys', mark: 'T' },
  { key: 'motors', label: 'Motors', mark: 'M' },
  { key: 'food', label: 'Food', mark: 'F' },
  { key: 'grocery', label: 'Grocery', mark: 'G' },
  { key: 'health', label: 'Health', mark: 'H' },
  { key: 'books', label: 'Books', mark: 'B' },
  { key: 'music', label: 'Music', mark: 'M' },
  { key: 'garden', label: 'Garden', mark: 'G' },
  { key: 'pets', label: 'Pets', mark: 'P' },
  { key: 'baby', label: 'Baby', mark: 'B' },
  { key: 'automotive', label: 'Automotive', mark: 'A' },
  { key: 'office', label: 'Office', mark: 'O' },
  { key: 'fitness', label: 'Fitness', mark: 'F' },
  { key: 'jewelry', label: 'Jewelry', mark: 'J' },
  { key: 'art', label: 'Art', mark: 'A' },
  { key: 'games', label: 'Games', mark: 'G' },
];

const CategoryBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        // Scrolling down - show category bar
        setIsVisible(false);
      } else {
        // Scrolling up - hide category bar
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const checkScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div 
      className="category-bar" 
      role="navigation" 
      aria-label="product categories"
      style={{
        position: 'fixed',
        top: '70px',
        left: 0,
        right: 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.8s ease',
        zIndex: 900,
        margin: '0 auto',
        maxWidth: '1200px',
        padding: '0 18px'
      }}
    >
      <div style={{
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        padding: '6px',
        background: 'var(--color-bg)',
        borderRadius: '8px',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--color-border)',
        position: 'relative'
      }}>
        {canScrollLeft && (
          <button 
            onClick={scrollLeft}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--color-text)',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              marginRight: '4px'
            }}
          >
            &lt;
          </button>
        )}
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: '0 4px',
            width: '100%'
          }}
        >
          {categories.map((category) => (
            <Link
              key={category.key}
              to={`/products?category=${encodeURIComponent(category.label)}`}
              className="category"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 6px',
                minWidth: '60px',
                textAlign: 'center',
                color: 'var(--color-muted)',
                fontSize: '11px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background .15s ease, transform .12s ease, color .15s ease',
                textDecoration: 'none',
                flexShrink: 0
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg,#fff,#fafafa)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary)',
                fontWeight: '700',
                fontSize: '12px'
              }}>{category.mark}</div>
              <div>{category.label}</div>
            </Link>
          ))}
        </div>
        {canScrollRight && (
          <button 
            onClick={scrollRight}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--color-text)',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '4px'
            }}
          >
            &gt;
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryBar;
