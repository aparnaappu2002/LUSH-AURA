// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './Slices/userSlice';
import tokenReducer from './Slices/tokenSlice'
import productReducer from './Slices/productSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    token: tokenReducer,
    product:productReducer,
  },
});

export default store;
