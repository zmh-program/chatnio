import {useDispatch, useSelector} from "react-redux";

export function dispatchWrapper(action: (state: any, payload?: any) => any) {
  return (payload?: any) => {
    const dispatch = useDispatch();
    dispatch(action(payload));
  };
}

export function getSelector(reducer: string, key: string) {
  return useSelector((state: any) => state[reducer][key]);
}

