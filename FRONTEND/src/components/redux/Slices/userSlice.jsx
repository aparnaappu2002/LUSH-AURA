// src/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // Store user object
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser(state, action) {
      state.user = action.payload; // Set user object
    },
    removeUser(state) {
      state.user = null; // Clear user object
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
