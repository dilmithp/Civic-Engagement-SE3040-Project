import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, AlertCircle } from 'lucide-react';

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  'Withdrawn': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const IssueCard = ({ issue }) => {
  const { 
    _id, 
    title, 
    category, 
    status, 
    location, 
    upvotes, 
    createdAt,
    images 
  } = issue;

  const date = new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Link 
      to={`/dashboard/issues/${_id}`} 
      className="group block bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
        {images && images.length > 0 ? (
          <img 
            src={images[0].url} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 flex-col gap-2">
            <AlertCircle size={32} />
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[status] || statusColors['Pending']} shadow-sm backdrop-blur-sm bg-white/90 dark:bg-black/90 capitalize`}>
          {status}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h3 className="font-semibold text-lg text-textMain line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
        </div>
        
        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 mb-3 border border-primary-100 dark:border-primary-800">
          {category}
        </span>

        <div className="flex flex-col gap-1.5 text-sm mb-4">
          <div className="flex items-center text-textMuted overflow-hidden">
            <MapPin size={14} className="shrink-0 mr-1.5" />
            <span className="truncate">{location.address || 'Location generic'}</span>
          </div>
          <div className="flex items-center text-textMuted">
            <Clock size={14} className="shrink-0 mr-1.5" />
            <span>{date}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border flex justify-end items-center text-sm">
          <span className="text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
};

export default IssueCard;
