import React, { useMemo, useState } from 'react';
import { AlertCircle, Loader2, Plus, Search, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { marketplaceService } from '../../services/marketplaceService';
import MarketplaceCard from '../../components/Marketplace/MarketplaceCard';
import MarketplaceFormModal from '../../components/Marketplace/MarketplaceFormModal';

const TYPES = ['all', 'donation', 'sale'];
const STATUSES = ['all', 'available', 'reserved', 'sold', 'expired'];

const Marketplace = () => {
  const { user } = useAuth();

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  const activeCount = useMemo(() => listings.filter((l) => l.status === 'available').length, [listings]);

  const normalizeListResponse = (response) => {
    const payload = response?.data || response;
    const data = payload?.data || payload;
    return data?.listings || [];
  };

  const loadListings = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.q = search.trim();

      const response = tab === 'mine'
        ? await marketplaceService.getMyListings(params)
        : await marketplaceService.getListings(params);

      setListings(normalizeListResponse(response));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadListings();
  }, [tab, typeFilter, statusFilter]);

  const openCreate = () => {
    setEditingListing(null);
    setIsModalOpen(true);
  };

  const openEdit = (listing) => {
    setEditingListing(listing);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingListing(null);
  };

  const saveListing = async (payload) => {
    setSaving(true);
    setError('');

    try {
      if (editingListing?._id) {
        await marketplaceService.updateListing(editingListing._id, payload);
      } else {
        await marketplaceService.createListing(payload);
      }

      closeModal();
      await loadListings();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;

    try {
      await marketplaceService.deleteListing(id);
      await loadListings();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete listing');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await marketplaceService.updateStatus(id, status);
      await loadListings();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update listing status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-700 to-primary-600 p-6 md:p-7 text-white">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Store size={13} />
              Circular Economy Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Community Marketplace</h1>
            <p className="text-primary-100 mt-1 text-sm md:text-base">
              Share, sell, or donate useful items with your neighborhood.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-sm">
              Active listings: <span className="font-bold">{activeCount}</span>
            </div>
            <button onClick={openCreate} className="btn btn-default bg-white text-primary-700 hover:bg-primary-50 border border-white/50">
              <Plus size={16} className="mr-1" />
              New Listing
            </button>
          </div>
        </div>
      </div>

      <div className="card rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-2 bg-background p-1 rounded-lg border border-border w-full md:w-auto">
            <button
              onClick={() => setTab('all')}
              className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${tab === 'all' ? 'bg-primary-100 text-primary-800' : 'text-textMuted hover:text-textMain'}`}
            >
              All Listings
            </button>
            <button
              onClick={() => setTab('mine')}
              className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${tab === 'mine' ? 'bg-primary-100 text-primary-800' : 'text-textMuted hover:text-textMain'}`}
            >
              My Listings
            </button>
          </div>

          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadListings()}
                placeholder="Search title, category or description"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>
            <button onClick={loadListings} className="btn btn-default btn-secondary">Search</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPES.map((item) => (
            <button
              key={item}
              onClick={() => setTypeFilter(item)}
              className={`btn btn-sm ${typeFilter === item ? 'btn-primary' : 'btn-ghost'} capitalize`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUSES.map((item) => (
            <button
              key={item}
              onClick={() => setStatusFilter(item)}
              className={`btn btn-sm ${statusFilter === item ? 'btn-primary' : 'btn-ghost'} capitalize`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-textMuted">
          <Loader2 size={30} className="animate-spin text-primary-600 mb-3" />
          Loading marketplace listings...
        </div>
      ) : listings.length === 0 ? (
        <div className="empty-state py-16 rounded-xl">
          <Store size={36} className="text-primary-500 mb-2" />
          <h3 className="text-lg font-semibold text-textMain">No listings found</h3>
          <p className="text-sm text-textMuted mt-1 max-w-lg">
            Try different filters or add a new listing to get the community marketplace moving.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <MarketplaceCard
              key={listing._id}
              listing={listing}
              canManage={tab === 'mine' || String(listing.owner) === String(user?.id)}
              onEdit={openEdit}
              onDelete={deleteListing}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      )}

      <MarketplaceFormModal
        isOpen={isModalOpen}
        initialData={editingListing}
        onClose={closeModal}
        onSubmit={saveListing}
        submitting={saving}
      />
    </div>
  );
};

export default Marketplace;
