import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaSearch, FaFilter, FaEllipsisH } from 'react-icons/fa';

/**
 * SavedSearches component allows users to save and manage search criteria
 * for assets, transactions, and other items.
 */
function SavedSearches({ type = 'asset', onApplySearch, initialFilters = {} }) {
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(initialFilters);
  const [activeSearch, setActiveSearch] = useState(null);
  
  // Load saved searches from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`saved_searches_${type}`);
    if (savedData) {
      try {
        setSavedSearches(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing saved searches:', error);
        setSavedSearches([]);
      }
    }
  }, [type]);
  
  // Save searches to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`saved_searches_${type}`, JSON.stringify(savedSearches));
  }, [savedSearches, type]);
  
  // Update current filters when initialFilters change
  useEffect(() => {
    setCurrentFilters(initialFilters);
  }, [initialFilters]);
  
  const saveCurrentSearch = () => {
    if (!searchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }
    
    // Check if a search with this name already exists
    const existingIndex = savedSearches.findIndex(search => search.name === searchName);
    
    if (existingIndex >= 0) {
      // Update existing search
      const updatedSearches = [...savedSearches];
      updatedSearches[existingIndex] = {
        ...updatedSearches[existingIndex],
        filters: currentFilters,
        updatedAt: new Date().toISOString()
      };
      setSavedSearches(updatedSearches);
    } else {
      // Create new search
      const newSearch = {
        id: Date.now().toString(),
        name: searchName,
        type,
        filters: currentFilters,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSavedSearches([...savedSearches, newSearch]);
    }
    
    setSearchName('');
    setShowSaveDialog(false);
  };
  
  const deleteSearch = (id) => {
    const updatedSearches = savedSearches.filter(search => search.id !== id);
    setSavedSearches(updatedSearches);
    
    if (activeSearch === id) {
      setActiveSearch(null);
    }
  };
  
  const applySearch = (search) => {
    setActiveSearch(search.id);
    if (onApplySearch) {
      onApplySearch(search.filters);
    }
  };
  
  const getFilterSummary = (filters) => {
    // Create a human-readable summary of the filters
    const parts = [];
    
    if (filters.keyword) {
      parts.push(`"${filters.keyword}"`);
    }
    
    if (filters.type && filters.type !== 'all') {
      parts.push(`Type: ${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}`);
    }
    
    if (filters.minValue) {
      parts.push(`Min: $${filters.minValue}`);
    }
    
    if (filters.maxValue) {
      parts.push(`Max: $${filters.maxValue}`);
    }
    
    if (filters.status && filters.status !== 'all') {
      parts.push(`Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`);
    }
    
    if (filters.dateRange) {
      parts.push(`Date: ${filters.dateRange}`);
    }
    
    return parts.join(', ') || 'No filters';
  };
  
  const clearActiveSearch = () => {
    setActiveSearch(null);
    if (onApplySearch) {
      onApplySearch({
        keyword: '',
        type: 'all',
        minValue: '',
        maxValue: '',
        status: 'all'
      });
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Saved Searches
        </h3>
        <div className="flex space-x-2">
          {activeSearch && (
            <button
              onClick={clearActiveSearch}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-medium rounded-md flex items-center"
            >
              <FaFilter className="mr-1" /> Clear Filters
            </button>
          )}
          <button
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            className="px-3 py-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-medium rounded-md flex items-center"
          >
            <FaSave className="mr-1" /> Save Current
          </button>
        </div>
      </div>
      
      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter a name for this search"
              className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              onClick={saveCurrentSearch}
              className="px-3 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-medium rounded-md"
            >
              Save
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p>Current filters: {getFilterSummary(currentFilters)}</p>
          </div>
        </div>
      )}
      
      {/* Saved Searches List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {savedSearches.length > 0 ? (
          savedSearches.map((search) => (
            <div 
              key={search.id} 
              className={`p-3 rounded-md flex items-center justify-between ${activeSearch === search.id ? 'bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            >
              <div className="flex-grow cursor-pointer" onClick={() => applySearch(search)}>
                <div className="flex items-center">
                  <FaSearch className="text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="font-medium text-gray-800 dark:text-white">{search.name}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getFilterSummary(search.filters)}
                </p>
              </div>
              <button
                onClick={() => deleteSearch(search.id)}
                className="ml-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                aria-label="Delete saved search"
              >
                <FaTrash />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>No saved searches yet.</p>
            <p className="text-sm mt-1">Save your current search criteria for quick access later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedSearches;
