// src/slices/tokenSlice.js
import {createSlice} from '@reduxjs/toolkit'

const initialState = {
  token: null, // Store authentication token
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    addToken(state, action) {
      state.token = action.payload; // Set token
    }
  },
});

export const { addToken } = tokenSlice.actions;
export default tokenSlice.reducer;
