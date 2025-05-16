import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import assetReducer from './features/assets/assetSlice';
import transactionReducer from './features/transactions/transactionSlice';
import ledgerReducer from './features/ledger/ledgerSlice';
import paymentReducer from './features/payments/paymentSlice';
import notificationReducer from './features/notifications/notificationSlice';
import dashboardReducer from './features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetReducer,
    transactions: transactionReducer,
    ledger: ledgerReducer,
    payments: paymentReducer,
    notifications: notificationReducer,
    dashboard: dashboardReducer,
  },
});
