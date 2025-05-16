import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MfaVerification from './MfaVerification';

const ProtectedRoute = ({ children }) => {
  const { user, mfaRequired } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If MFA is required but not yet verified, show the MFA verification component
  if (mfaRequired) {
    return <MfaVerification />;
  }

  return children;
};

export default ProtectedRoute;
