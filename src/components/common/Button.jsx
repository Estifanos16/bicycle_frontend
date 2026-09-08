import React from 'react';

/**
 * Button — shared primitive component.
 * Props: variant ('primary' | 'secondary' | 'danger'), size ('sm' | 'md' | 'lg'),
 *        disabled, loading, onClick, children, type, style, className
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    style = {},
    className = '',
    ...rest
}) => {
    const base = `btn-${variant}`;
    const sizeClass = size !== 'md' ? `btn-${size}` : '';

    return (
        <button
            type={type}
            className={[base, sizeClass, className].filter(Boolean).join(' ')}
            disabled={disabled || loading}
            onClick={onClick}
            style={style}
            {...rest}
        >
            {loading ? 'Loading...' : children}
        </button>
    );
};

export default Button;
