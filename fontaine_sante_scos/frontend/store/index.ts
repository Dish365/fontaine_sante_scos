import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";

// Import slices
import { supplierReducer } from "./slices/supplierSlice";
import { materialReducer } from "./slices/materialSlice";
import { environmentalReducer } from "./slices/environmentalSlice";
import { qualityReducer } from "./slices/qualitySlice";
import { userReducer } from "./slices/userSlice";
import { alertReducer } from "./slices/alertSlice";

export const store = configureStore({
  reducer: {
    supplier: supplierReducer,
    material: materialReducer,
    environmental: environmentalReducer,
    quality: qualityReducer,
    user: userReducer,
    alert: alertReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

// Types for Redux usage
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the application
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
