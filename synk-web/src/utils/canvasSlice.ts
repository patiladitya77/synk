import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICanvas } from "@/types/canvas";

interface CanvasState {
  canvases: ICanvas[] | null;
}

const initialState: CanvasState = {
  canvases: null,
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    setUserCanvases: (state, action: PayloadAction<ICanvas[]>) => {
      state.canvases = action.payload;
    },
    removeUserCanvases: (state, action) => {
      state.canvases =
        state.canvases?.filter((c) => c.id != action.payload) ?? null;
    },
  },
});

export const { setUserCanvases, removeUserCanvases } = canvasSlice.actions;
export default canvasSlice.reducer;
