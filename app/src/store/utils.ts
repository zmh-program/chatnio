import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./index.ts";

export function dispatchWrapper(
  action: (state: RootState, payload?: any) => any,
) {
  return (payload?: any) => {
    const dispatch = useDispatch();
    dispatch(action(payload));
  };
}

export function getSelector(reducer: string, key: string) {
  return useSelector((state: any) => state[reducer][key]);
}
