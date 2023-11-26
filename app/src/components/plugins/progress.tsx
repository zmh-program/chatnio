import { useMemo } from "react";
import { parseNumber } from "@/utils/base.ts";

export function parseProgressbar(data: string) {
  const progress = useMemo(() => {
    const arr = data.split("\n").filter((line) => line.trim().length > 0);
    if (arr.length === 0) return 0;
    const result = arr[arr.length - 1];
    return parseNumber(result);
  }, [data]);

  return (
    <div className={`progress`}>
      <p className={`text-primary select-none text-center text-white`}>
        Generating: {progress < 0 ? 0 : progress.toFixed()}%
      </p>
      {progress > 0 && (
        <div
          className={`progressbar relative h-4 w-full overflow-hidden rounded-full bg-muted min-w-[20vw] bg-white`}
          role={`progressbar`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          data-max={100}
        >
          <p
            className={`h-full w-full flex-1 bg-primary transition-all`}
            style={{ transform: `translateX(-${100 - progress}%)` }}
            data-max={100}
          />
        </div>
      )}
    </div>
  );
}
