// // src/store.js
// import { configureStore } from '@reduxjs/toolkit';
// import userReducer from './Slices/userSlice';
// import tokenReducer from './Slices/tokenSlice'
// import productReducer from './Slices/productSlice'

// const store = configureStore({
//   reducer: {
//     user: userReducer,
//     token: tokenReducer,
//     product:productReducer,
//   },
// });

// export default store;

// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default: localStorage for web
import { combineReducers } from 'redux';
import userReducer from './Slices/userSlice';
import tokenReducer from './Slices/tokenSlice';
import productReducer from './Slices/productSlice';

// Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  token: tokenReducer,
  product: productReducer,
});

// Configure persist
const persistConfig = {
  key: 'root', // Key for localStorage
  storage, // Use localStorage as the default storage
  whitelist: ['user', 'product', 'token'], // State slices you want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable warnings for non-serializable values in state
    }),
});

// Export the persistor
export const persistor = persistStore(store);

export default store;
