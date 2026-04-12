import React from 'react';
import { Clock3, Package, RefreshCcw, Trash2, HandCoins, Tag, Phone } from 'lucide-react';

const STATUS_STYLES = {
  available: 'badge-green',
  reserved: 'badge-amber',
  sold: 'badge-sky',
  expired: 'badge-neutral'
};

const formatDate = (date) => {
  if (!date) return 'No date';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const MarketplaceCard = ({ listing, canManage, onEdit, onDelete, onStatusChange }) => {
  const {
    _id,
    title,
    description,
    category,
    type,
    price,
    status,
    images,
    contactInfo,
    createdAt,
    expiresAt
  } = listing;

  const statusClass = STATUS_STYLES[status] || 'badge-neutral';

  return (
    <article className="card rounded-xl">
      <div className="relative h-44 bg-surfaceHover border-b border-border overflow-hidden">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-textMuted">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package size={18} />
              No image
            </div>
          </div>
        )}
        <div className={`absolute top-3 right-3 badge ${statusClass} capitalize`}>{status}</div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-textMain line-clamp-1">{title}</h3>
          <span className="badge badge-teal whitespace-nowrap capitalize">{type}</span>
        </div>

        <p className="text-sm text-textMuted line-clamp-2">{description}</p>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="badge badge-neutral">
            <Tag size={12} />
            {category}
          </span>
          <span className="badge badge-neutral">
            <Phone size={12} />
            {contactInfo}
          </span>
          <span className="badge badge-neutral">
            <Clock3 size={12} />
            {formatDate(createdAt)}
          </span>
          <span className="badge badge-neutral">
            Expires {formatDate(expiresAt)}
          </span>
        </div>

        <div className="pt-1">
          {type === 'sale' ? (
            <div className="text-lg font-bold text-primary-700">LKR {Number(price || 0).toLocaleString()}</div>
          ) : (
            <div className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
              <HandCoins size={15} />
              Donation
            </div>
          )}
        </div>

        {canManage && (
          <div className="pt-2 border-t border-border flex flex-wrap gap-2">
            <button onClick={() => onEdit(listing)} className="btn btn-sm btn-secondary">Edit</button>

            {status !== 'sold' && status !== 'expired' && (
              <button
                onClick={() => onStatusChange(_id, status === 'available' ? 'reserved' : 'available')}
                className="btn btn-sm btn-ghost"
              >
                <RefreshCcw size={13} className="mr-1" />
                {status === 'available' ? 'Reserve' : 'Set Available'}
              </button>
            )}

            {status !== 'sold' && status !== 'expired' && (
              <button onClick={() => onStatusChange(_id, 'sold')} className="btn btn-sm btn-primary">Mark Sold</button>
            )}

            <button onClick={() => onDelete(_id)} className="btn btn-sm btn-danger">
              <Trash2 size={13} className="mr-1" />
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default MarketplaceCard;
