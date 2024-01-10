import { NProgress } from "@tanem/react-nprogress";
import { useDispatch, useSelector } from "react-redux";
import { decreaseTask, increaseTask, selectIsTasking } from "@/store/auth.ts";
import { useEffect } from "react";
import {
  closeSpinnerType,
  openSpinnerType,
  spinnerEvent,
} from "@/events/spinner.ts";

function Spinner() {
  const dispatch = useDispatch();

  useEffect(() => {
    spinnerEvent.bind((event) => {
      switch (event.type) {
        case openSpinnerType:
          dispatch(increaseTask(event.id));
          break;
        case closeSpinnerType:
          dispatch(decreaseTask(event.id));
          break;
      }
    });
  }, []);

  const isAnimating = useSelector(selectIsTasking);

  return (
    <NProgress isAnimating={isAnimating}>
      {({ animationDuration, isFinished, progress }) => (
        <div
          className={`spinner`}
          style={{
            opacity: isFinished ? 0 : 1,
            transitionDuration: `${animationDuration}ms`,
            width: `${progress * 100}vw`,
          }}
        ></div>
      )}
    </NProgress>
  );
}

export default Spinner;
