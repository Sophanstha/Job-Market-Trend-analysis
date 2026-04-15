import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { type AppDispatch , type RootState } from ".";
// import type { RootState } from "@reduxjs/toolkit/query";


export const useAppDispatch = ()=> useDispatch<AppDispatch>()
export const useAppSelector : TypedUseSelectorHook<RootState> = useSelector