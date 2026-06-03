import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { key: 'electronics', label: 'Electronics', mark: 'E' },
  { key: 'clothing', label: 'Clothing', mark: 'C' },
  { key: 'home', label: 'Home', mark: 'H' },
  { key: 'beauty', label: 'Beauty', mark: 'B' },
  { key: 'sports', label: 'Sports', mark: 'S' },
  { key: 'toys', label: 'Toys', mark: 'T' },
  { key: 'motors', label: 'Motors', mark: 'M' },
];

const CategoryBar = () => (
  <div className="category-bar" role="navigation" aria-label="product categories">
    {categories.map((category) => (
      <Link
        key={category.key}
        to={`/products?category=${encodeURIComponent(category.label)}`}
        className="category"
      >
        <div className="icon">{category.mark}</div>
        <div className="label">{category.label}</div>
      </Link>
    ))}
  </div>
);

export default CategoryBar;
