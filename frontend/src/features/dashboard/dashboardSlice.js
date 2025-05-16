import { createSlice } from '@reduxjs/toolkit';

// Get dashboard layout from localStorage if available
const getSavedLayout = () => {
  const savedLayout = localStorage.getItem('dashboardLayout');
  if (savedLayout) {
    try {
      return JSON.parse(savedLayout);
    } catch (error) {
      console.error('Error parsing saved dashboard layout:', error);
      return null;
    }
  }
  return null;
};

// Default layout if none is saved
const defaultLayout = [
  { id: 'portfolio-summary', type: 'summary', title: 'Portfolio Summary', col: 1, row: 1, size: 'full' },
  { id: 'asset-distribution', type: 'assets', title: 'Asset Distribution', col: 1, row: 2, size: 'half' },
  { id: 'recent-transactions', type: 'transactions', title: 'Recent Transactions', col: 2, row: 2, size: 'half' },
  { id: 'security-status', type: 'security', title: 'Security Status', col: 1, row: 3, size: 'half' },
  { id: 'payment-activity', type: 'payments', title: 'Payment Activity', col: 2, row: 3, size: 'half' }
];

const initialState = {
  layout: getSavedLayout() || defaultLayout,
  availableWidgets: [
    { id: 'portfolio-summary', type: 'summary', title: 'Portfolio Summary' },
    { id: 'asset-distribution', type: 'assets', title: 'Asset Distribution' },
    { id: 'recent-transactions', type: 'transactions', title: 'Recent Transactions' },
    { id: 'security-status', type: 'security', title: 'Security Status' },
    { id: 'payment-activity', type: 'payments', title: 'Payment Activity' },
    { id: 'market-trends', type: 'market', title: 'Market Trends' },
    { id: 'quick-actions', type: 'actions', title: 'Quick Actions' }
  ],
  isEditing: false
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addWidget: (state, action) => {
      const newWidget = {
        ...action.payload,
        id: `${action.payload.type}-${Date.now()}`,
        col: 1,
        row: state.layout.length + 1,
        size: 'half'
      };
      state.layout.push(newWidget);
      localStorage.setItem('dashboardLayout', JSON.stringify(state.layout));
    },
    removeWidget: (state, action) => {
      state.layout = state.layout.filter(widget => widget.id !== action.payload);
      localStorage.setItem('dashboardLayout', JSON.stringify(state.layout));
    },
    updateLayout: (state, action) => {
      state.layout = action.payload;
      localStorage.setItem('dashboardLayout', JSON.stringify(state.layout));
    },
    resetLayout: (state) => {
      state.layout = defaultLayout;
      localStorage.setItem('dashboardLayout', JSON.stringify(defaultLayout));
    },
    toggleEditMode: (state) => {
      state.isEditing = !state.isEditing;
    }
  }
});

export const { addWidget, removeWidget, updateLayout, resetLayout, toggleEditMode } = dashboardSlice.actions;
export default dashboardSlice.reducer;
