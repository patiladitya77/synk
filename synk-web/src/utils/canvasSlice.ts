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
  },
});

export const { setUserCanvases } = canvasSlice.actions;
export default canvasSlice.reducer;
