import axios from 'axios'
import store from '../components/redux/Store'
import { addToken } from '../components/redux/Slices/tokenSlice'
const instance=axios.create({
    baseURL: import.meta.env.VITE_USERAXIOS,
    withCredentials:true
})


instance.interceptors.request.use(
  (config) => {
    const state = store.getState(); // Get the entire Redux state
    //console.log("Redux state:", state);
    const token = store.getState().token.token;
    //console.log(token)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await instance.post('/refreshToken', {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.accessToken;

        store.dispatch(addToken(newAccessToken)); // Update Redux store with the new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return instance(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.log('Refresh token failed:', refreshError);
        window.location.href = '/login'; // Redirect to login on token refresh failure
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default instance