import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Toaster,toast } from 'react-hot-toast';
import { useEffect } from 'react';
import axios from '../axios/userAxios'; // Replace with your actual axios instance
import { removeUser } from '../components/redux/Slices/userSlice';
import { useDispatch } from 'react-redux';



const ProtectedRouteUser = ({ children }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        if (!user) return;
        const response = await axios.get(`/checkstatus/${user?.id || user?._id}`); // Endpoint to check user status
        if (response.data.status === 'inactive') {
          // User is blocked; clear session and redirect to login
          dispatch(removeUser());
          dispatch(removeToken());
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Your account has been blocked by the admin.');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        toast.error('Error validating user session.');
      }
    };

    checkUserStatus();
  }, [user, dispatch]);


  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRouteUser;
