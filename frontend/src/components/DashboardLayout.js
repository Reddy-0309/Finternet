import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCog, FaPlus, FaUndo } from 'react-icons/fa';
import DashboardWidget from './DashboardWidget';
import { toggleEditMode, resetLayout, addWidget, removeWidget } from '../features/dashboard/dashboardSlice';

function DashboardLayout() {
  const dispatch = useDispatch();
  const { layout, availableWidgets, isEditing } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);
  const { assets } = useSelector((state) => state.assets);
  const { transactions } = useSelector((state) => state.transactions);
  const { payments } = useSelector((state) => state.payments);
  
  // Toggle edit mode
  const handleToggleEditMode = () => {
    dispatch(toggleEditMode());
  };
  
  // Reset layout to default
  const handleResetLayout = () => {
    if (window.confirm('Are you sure you want to reset your dashboard layout? This cannot be undone.')) {
      dispatch(resetLayout());
    }
  };
  
  // Add a new widget
  const handleAddWidget = (widget) => {
    dispatch(addWidget(widget));
  };
  
  // Remove a widget
  const handleRemoveWidget = (widgetId) => {
    dispatch(removeWidget(widgetId));
  };
  
  // Get widget data based on type
  const getWidgetData = (type) => {
    switch (type) {
      case 'assets':
        return assets;
      case 'transactions':
        return transactions;
      case 'payments':
        return payments;
      case 'security':
        return {
          mfaEnabled: user?.mfaEnabled || false,
          lastLogin: new Date().toLocaleString(),
          loginAttempts: 1
        };
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex space-x-3">
          {isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={handleResetLayout}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
              >
                <FaUndo className="mr-2" /> Reset Layout
              </button>
              <div className="relative group">
                <button
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Widget
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 hidden group-hover:block">
                  <div className="py-2">
                    {availableWidgets.map((widget) => (
                      <button
                        key={widget.id}
                        onClick={() => handleAddWidget(widget)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {widget.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleToggleEditMode}
            className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'} font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center ${isEditing ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}
          >
            <FaCog className="mr-2" /> {isEditing ? 'Save Layout' : 'Customize'}
          </button>
        </div>
      </div>
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {layout.map((widget) => (
          <div 
            key={widget.id} 
            className={widget.size === 'full' ? 'md:col-span-2' : ''}
          >
            <DashboardWidget 
              type={widget.type} 
              title={widget.title} 
              data={getWidgetData(widget.type)}
              onRemove={isEditing ? () => handleRemoveWidget(widget.id) : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardLayout;
