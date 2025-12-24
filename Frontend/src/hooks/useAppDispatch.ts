import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";


//in order that typescript not will be confuced
export const useAppDispatch = () => useDispatch<AppDispatch>();
