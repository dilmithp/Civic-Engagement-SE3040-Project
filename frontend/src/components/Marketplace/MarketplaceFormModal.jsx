import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

const INITIAL_FORM = {
  title: '',
  description: '',
  category: '',
  type: 'donation',
  price: '',
  contactInfo: '',
  newImages: [],
  existingImages: [],
  expiresAt: ''
};

const MarketplaceFormModal = ({ isOpen, initialData, onClose, onSubmit, submitting }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        type: initialData.type || 'donation',
        price: initialData.price ?? '',
        contactInfo: initialData.contactInfo || '',
        newImages: [],
        existingImages: Array.isArray(initialData.images) ? initialData.images : [],
        expiresAt: initialData.expiresAt ? initialData.expiresAt.split('T')[0] : ''
      });
    } else {
      setForm(INITIAL_FORM);
    }

    setErrors({});
  }, [isOpen, initialData]);

  const title = useMemo(() => (initialData ? 'Edit Listing' : 'Create Listing'), [initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.category.trim()) nextErrors.category = 'Category is required';
    if (!form.contactInfo.trim()) nextErrors.contactInfo = 'Contact information is required';
    if (form.type === 'sale' && (form.price === '' || Number(form.price) < 0)) {
      nextErrors.price = 'A valid price is required for sale listings';
    }
    const totalImageCount = form.existingImages.length + form.newImages.length;
    if (totalImageCount > 5) {
      nextErrors.images = 'You can attach up to 5 images';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    payload.append('title', form.title.trim());
    payload.append('description', form.description.trim());
    payload.append('category', form.category.trim());
    payload.append('type', form.type);
    payload.append('contactInfo', form.contactInfo.trim());

    if (form.type === 'sale') {
      payload.append('price', String(Number(form.price)));
    }

    if (form.expiresAt) {
      payload.append('expiresAt', form.expiresAt);
    }

    if (initialData?._id) {
      payload.append('existingImages', JSON.stringify(form.existingImages));
    }

    form.newImages.forEach((file) => {
      payload.append('images', file);
    });

    onSubmit(payload);
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const removeExistingImage = (index) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  };

  const handleNewImagesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    const remainingSlots = Math.max(0, 5 - form.existingImages.length - form.newImages.length);
    const accepted = selected.slice(0, remainingSlots);

    setForm((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...accepted]
    }));
  };

  const removeNewImage = (index) => {
    setForm((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-2xl">
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-textMain">{title}</h3>
          <button onClick={onClose} className="btn btn-icon btn-ghost" disabled={submitting}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group md:col-span-2 mb-0">
              <label>Title</label>
              <input value={form.title} onChange={(e) => setField('title', e.target.value)} maxLength={100} />
              {errors.title && <span className="text-xs text-red-600">{errors.title}</span>}
            </div>

            <div className="form-group md:col-span-2 mb-0">
              <label>Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                maxLength={1000}
              />
              {errors.description && <span className="text-xs text-red-600">{errors.description}</span>}
            </div>

            <div className="form-group mb-0">
              <label>Category</label>
              <input value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="Furniture, Electronics..." />
              {errors.category && <span className="text-xs text-red-600">{errors.category}</span>}
            </div>

            <div className="form-group mb-0">
              <label>Listing Type</label>
              <select value={form.type} onChange={(e) => setField('type', e.target.value)}>
                <option value="donation">Donation</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            {form.type === 'sale' && (
              <div className="form-group mb-0">
                <label>Price (LKR)</label>
                <input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setField('price', e.target.value)} />
                {errors.price && <span className="text-xs text-red-600">{errors.price}</span>}
              </div>
            )}

            <div className="form-group mb-0">
              <label>Contact Info</label>
              <input value={form.contactInfo} onChange={(e) => setField('contactInfo', e.target.value)} placeholder="Phone, email or social handle" />
              {errors.contactInfo && <span className="text-xs text-red-600">{errors.contactInfo}</span>}
            </div>

            <div className="form-group md:col-span-2 mb-0">
              <label>Images (up to 5)</label>
              <input
                id="marketplace-images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImagesChange}
              />
              <p className="text-xs text-textMuted mt-1">
                {form.newImages.length} new image(s) selected. Max total images per listing: 5.
              </p>
              {form.newImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.newImages.map((file, index) => (
                    <button
                      key={`${file.name}-${file.lastModified}-${index}`}
                      type="button"
                      className="text-xs px-2 py-1 rounded border border-border bg-surfaceHover"
                      onClick={() => removeNewImage(index)}
                      title="Click to remove"
                    >
                      {file.name} ({Math.max(1, Math.round(file.size / 1024))} KB)
                    </button>
                  ))}
                </div>
              )}
              {form.existingImages.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {form.existingImages.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative rounded border border-border overflow-hidden">
                      <img src={image} alt={`Listing ${index + 1}`} className="w-full h-20 object-cover" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded"
                        onClick={() => removeExistingImage(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && <span className="text-xs text-red-600">{errors.images}</span>}
            </div>

            <div className="form-group mb-0">
              <label>Expiry Date</label>
              <input type="date" value={form.expiresAt} onChange={(e) => setField('expiresAt', e.target.value)} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-default btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-default btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketplaceFormModal;
