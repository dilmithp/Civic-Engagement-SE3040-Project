import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, Package, RefreshCcw, Trash2, HandCoins, Tag, Phone } from 'lucide-react';

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

const MarketplaceCard = ({
  listing,
  canManage,
  currentUserId,
  onEdit,
  onDelete,
  onStatusChange,
  onRequest,
  onCancelRequest,
  onRequestResponse
}) => {
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
    pendingRequestBy,
    createdAt,
    expiresAt
  } = listing;

  const imageList = Array.isArray(images) ? images.filter(Boolean) : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [_id, imageList.length]);

  const statusClass = STATUS_STYLES[status] || 'badge-neutral';
  const hasPendingRequest = Boolean(pendingRequestBy);
  const isMyPendingRequest = hasPendingRequest && String(pendingRequestBy) === String(currentUserId || '');
  const hasMultipleImages = imageList.length > 1;
  const activeImage = imageList[activeImageIndex];

  const goToPreviousImage = () => {
    setActiveImageIndex((current) => (current === 0 ? imageList.length - 1 : current - 1));
  };

  const goToNextImage = () => {
    setActiveImageIndex((current) => (current === imageList.length - 1 ? 0 : current + 1));
  };

  return (
    <article className="card rounded-xl">
      <div className="relative bg-surfaceHover border-b border-border overflow-hidden">
        {activeImage ? (
          <div className="relative h-44">
            <img src={activeImage} alt={`${title} - image ${activeImageIndex + 1}`} className="w-full h-full object-cover" />

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={goToPreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/55 text-white hover:bg-black/70"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/55 text-white hover:bg-black/70"
                >
                  <ChevronRight size={16} />
                </button>

                <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur px-2 py-1 rounded-full">
                  {imageList.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Show image ${index + 1}`}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${index === activeImageIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-44 flex items-center justify-center text-textMuted">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package size={18} />
              No image
            </div>
          </div>
        )}
        <div className={`absolute top-3 right-3 badge ${statusClass} capitalize`}>{status}</div>
      </div>

      {imageList.length > 1 && (
        <div className="px-4 pt-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imageList.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={`shrink-0 rounded-md border-2 overflow-hidden transition-all ${index === activeImageIndex ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent opacity-75 hover:opacity-100'}`}
                aria-label={`Thumbnail ${index + 1}`}
              >
                <img src={image} alt={`${title} thumbnail ${index + 1}`} className="w-14 h-14 object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

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

        {status === 'available' && hasPendingRequest && (
          <div className="text-xs rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 inline-flex">
            Request pending owner review
          </div>
        )}

        {canManage && (
          <div className="pt-2 border-t border-border flex flex-wrap gap-2">
            <button onClick={() => onEdit(listing)} className="btn btn-sm btn-secondary">Edit</button>

            {status === 'available' && hasPendingRequest && (
              <>
                <button onClick={() => onRequestResponse(_id, 'approve')} className="btn btn-sm btn-primary">Approve Request</button>
                <button onClick={() => onRequestResponse(_id, 'reject')} className="btn btn-sm btn-ghost">Reject Request</button>
              </>
            )}

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

        {!canManage && status === 'available' && (
          <div className="pt-2 border-t border-border flex flex-wrap gap-2">
            {!hasPendingRequest && (
              <button onClick={() => onRequest(_id)} className="btn btn-sm btn-primary">Request Item</button>
            )}

            {isMyPendingRequest && (
              <button onClick={() => onCancelRequest(_id)} className="btn btn-sm btn-ghost">Cancel Request</button>
            )}

            {hasPendingRequest && !isMyPendingRequest && (
              <span className="text-xs text-textMuted inline-flex items-center">Another citizen already requested this item</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default MarketplaceCard;
