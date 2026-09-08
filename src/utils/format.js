/**
 * Shared frontend utility/formatter functions.
 */

/**
 * Format a number as Ethiopian Birr (ETB).
 * @param {number} amount
 * @returns {string}  e.g. "ETB 1,250.00"
 */
export const formatETB = (amount) => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) return 'ETB 0.00';
    return `ETB ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format an ISO date string to a human-readable date.
 * @param {string} isoString
 * @returns {string}  e.g. "Sep 8, 2026"
 */
export const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return isoString;
    }
};

/**
 * Format an ISO date string to a human-readable date + time.
 * @param {string} isoString
 * @returns {string}  e.g. "Sep 8, 2026 · 2:35 PM"
 */
export const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
        const d = new Date(isoString);
        const date = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `${date} · ${time}`;
    } catch {
        return isoString;
    }
};

/**
 * Returns badge metadata for a product's stock level.
 * @param {number} stock
 * @returns {{ label: string, className: string }}
 */
export const getStockBadge = (stock) => {
    if (stock === undefined || stock === null) return { label: 'Unknown', className: 'badge-default' };
    if (stock <= 0) return { label: 'Out of Stock', className: 'badge-error' };
    if (stock <= 5) return { label: 'Low Stock', className: 'badge-warning' };
    return { label: 'In Stock', className: 'badge-success' };
};

/**
 * Truncate a string to a maximum length with ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 60) => {
    if (!str) return '';
    return str.length > maxLength ? str.slice(0, maxLength).trimEnd() + '…' : str;
};
