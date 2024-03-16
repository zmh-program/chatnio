import React, { useMemo } from "react";
import { parseNumber } from "@/utils/base.ts";
import { Check, Loader2 } from "lucide-react";

type MarkdownProgressbarProps = {
  children: React.ReactNode;
};

export function MarkdownProgressbar({ children }: MarkdownProgressbarProps) {
  const data = children?.toString() || "";
  const progress = useMemo(() => {
    const arr = data.split("\n").filter((line) => line.trim().length > 0);
    if (arr.length === 0) return 0;
    const result = arr[arr.length - 1];
    return parseNumber(result);
  }, [data]);

  return (
    <div className={`progress`}>
      <p
        className={`flex flex-row items-center justify-center text-primary select-none text-center text-white px-6`}
      >
        {progress < 100 ? (
          <Loader2
            className={`h-4 w-4 mr-2 inline-block animate-spin shrink-0`}
          />
        ) : (
          <Check className={`h-4 w-4 mr-2 inline-block animate-out shrink-0`} />
        )}
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
            className={`h-full w-full flex-1 bg-primary transition-all duration-300`}
            style={{ transform: `translateX(-${100 - progress}%)` }}
            data-max={100}
          />
        </div>
      )}
    </div>
  );
}
