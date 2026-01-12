import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  authLoading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
    removeUser: () => initialState,
  },
});

export const { addUser, setAccessToken, setAuthLoading, removeUser } =
  userSlice.actions;
export default userSlice.reducer;
