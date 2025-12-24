import { useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState } from "../store";

//in order that typescript not will be confuced
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;
