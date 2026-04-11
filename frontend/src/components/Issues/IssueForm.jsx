import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ImagePlus, X, Loader, ArrowLeft, MapPin, Search } from 'lucide-react';
import { issueService } from '../../services/issueService';
import LocationPickerMap from './LocationPickerMap';

const CATEGORIES = [
  'Pothole',
  'Broken Streetlight',
  'Illegal Dumping',
  'Water Leak',
  'Damaged Sidewalk',
  'Graffiti',
  'Traffic Signal',
  'Other'
];

const IssueForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    address: '',
    lat: 0,
    lng: 0,
    images: [] // Only used in Create Mode
  });

  useEffect(() => {
    if (isEditMode) {
      fetchIssueForEdit();
    }
  }, [id, isEditMode]);

  const fetchIssueForEdit = async () => {
    try {
      setLoading(true);
      const res = await issueService.getIssueById(id);
      const data = res.data;
      
      // If status isn't pending, prevent edit (frontend barrier)
      if (data.status !== 'Pending') {
        setError('You can only edit an issue if its status is Pending.');
        return;
      }

      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        address: data.location?.address || '',
        lat: data.location?.coordinates[1] || 0,
        lng: data.location?.coordinates[0] || 0,
        images: []
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load issue. It may have been deleted or you do not have permission.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (isEditMode) return; // Images untouchable in Edit Mode

    const files = Array.from(e.target.files);
    
    if (imagesPreview.length + files.length > 5) {
      setError("You can only upload a maximum of 5 images.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagesPreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
    
    URL.revokeObjectURL(imagesPreview[indexToRemove]);
    setImagesPreview(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Click 'Use My Location' GPS
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setFormData(prev => ({ ...prev, lat, lng }));
        
        try {
          const res = await issueService.reverseGeocode(lat, lng);
          if (res.data?.displayName) setFormData(prev => ({ ...prev, address: res.data.displayName }));
        } catch (err) {
          console.error("Geocoding failed", err);
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location.");
        setLocationLoading(false);
      }
    );
  };

  // Map Click event handler
  const handleMapLocationSelect = async (lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    
    try {
      setGeocodeLoading(true);
      const res = await issueService.reverseGeocode(lat, lng);
      if (res.data?.displayName) {
        setFormData(prev => ({ ...prev, address: res.data.displayName }));
      }
    } catch (err) {
      console.error("Map click reverse geocoding failed", err);
    } finally {
      setGeocodeLoading(false);
    }
  };

  // Text Address Search button handler
  const handleAddressSearch = async () => {
    if (!formData.address.trim()) return;
    
    try {
      setGeocodeLoading(true);
      const res = await issueService.forwardGeocode(formData.address);
      if (res.data && res.data.latitude && res.data.longitude) {
        setFormData(prev => ({ 
          ...prev, 
          lat: parseFloat(res.data.latitude), 
          lng: parseFloat(res.data.longitude) 
        }));
      } else {
        setError("Could not find coordinates for that address.");
      }
    } catch (err) {
      console.error("Address search forward geocoding failed", err);
      setError("Address search failed.");
    } finally {
      setGeocodeLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.lat === 0 && formData.lng === 0) {
      setError("Please select a location on the map, use GPS, or search a valid address.");
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        // Send JSON payload for updates
        const payload = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          address: formData.address,
          latitude: formData.lat,
          longitude: formData.lng
        };
        await issueService.updateIssue(id, payload);
        navigate(`/dashboard/issues/${id}`);

      } else {
        // Send FormData for new records (images included)
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('address', formData.address);
        data.append('latitude', formData.lat);
        data.append('longitude', formData.lng);

        formData.images.forEach(img => {
          data.append('images', img);
        });

        await issueService.createIssue(data);
        navigate('/dashboard/issues');
      }
      
    } catch (err) {
      console.error('Error modifying issue:', err);
      const validationErr = err.response?.data?.errors?.[0]?.msg;
      const serverMsg = err.response?.data?.message;
      setError(validationErr || serverMsg || 'Failed to save issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Link 
        to={isEditMode ? `/dashboard/issues/${id}` : "/dashboard/issues"} 
        className="inline-flex items-center text-sm font-medium text-textMuted hover:text-textMain mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Link>

      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border bg-surfaceHover/50">
          <h1 className="text-2xl font-bold text-textMain tracking-tight">
            {isEditMode ? 'Edit Issue Report' : 'Report a New Issue'}
          </h1>
          <p className="text-textMuted mt-1">
            {isEditMode 
              ? 'Modify the details or location of your report.' 
              : 'Provide details about the civic issue in your area so appropriate action can be taken.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5" htmlFor="title">Issue Title <span className="text-red-500">*</span></label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Brief summary of the issue (e.g. Pothole on Main St)"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-textMain"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5" htmlFor="category">Category <span className="text-red-500">*</span></label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-textMain capitalize"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5" htmlFor="description">Description <span className="text-red-500">*</span></label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Provide more details to help authorities locate and understand the issue."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-textMain resize-none"
              />
            </div>

            {/* Location Section */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-textMain" htmlFor="address">
                  Issue Location <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {geocodeLoading && <span className="text-xs text-primary-500 flex items-center"><Loader size={12} className="animate-spin mr-1"/> Syncing...</span>}
                  <button 
                    type="button" 
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 px-3 py-1.5 rounded transition-colors disabled:opacity-50 border border-primary-100 dark:border-primary-800"
                  >
                    {locationLoading ? <Loader size={14} className="animate-spin mr-1.5" /> : <MapPin size={14} className="mr-1.5" />}
                    Use My GPS
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Type an address and click Search, OR click directly on the map below"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-textMain shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={geocodeLoading || !formData.address}
                  className="bg-background border border-border px-4 py-2.5 rounded-lg hover:bg-surfaceHover transition-colors flex items-center justify-center text-textMain disabled:opacity-50"
                  title="Search map for address"
                >
                  <Search size={20} />
                </button>
              </div>

              {/* Graphical Interactive Map Picker */}
              <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-sm relative group bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
                <LocationPickerMap 
                  position={{ lat: formData.lat, lng: formData.lng }} 
                  onLocationSelect={handleMapLocationSelect} 
                />
              </div>
            </div>

            {/* Image Upload - ONLY available for new issues */}
            {!isEditMode && (
              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-textMain mb-1.5">Evidence Images (up to 5)</label>
                <div className="mt-1 border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-surfaceHover transition-colors cursor-pointer bg-background relative">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={imagesPreview.length >= 5}
                  />
                  <div className="flex flex-col items-center">
                    <ImagePlus className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-textMain">Click or drag images here to upload</p>
                    <p className="text-xs text-textMuted mt-1">JPEG, PNG up to 5MB each</p>
                  </div>
                </div>

                {imagesPreview.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {imagesPreview.map((src, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="text-white h-6 w-6" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/issues')}
              className="px-6 py-2.5 border border-border rounded-lg font-medium text-textMain hover:bg-surfaceHover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (isEditMode && formData.title === '')}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {loading && <Loader size={16} className="animate-spin mr-2" />}
              {isEditMode ? (loading ? 'Saving Changes...' : 'Save Changes') : (loading ? 'Submitting...' : 'Submit Issue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;
