import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart4, LineChartIcon, Loader2 } from "lucide-react";
import Tips from "@/components/Tips.tsx";
import { AreaChart, BarChart } from "@tremor/react";
import { getReadableNumber } from "@/utils/processor.ts";
import { getModelColor } from "@/admin/colors.ts";
import { Button } from "@/components/ui/button.tsx";

type ModelChartProps = {
  labels: string[];
  datasets: {
    model: string;
    data: number[];
  }[];
};

function ModelChart({ labels, datasets }: ModelChartProps) {
  const { t } = useTranslation();
  const [area, setArea] = useState(false);
  const data = useMemo(() => {
    return labels.map((label, idx) => {
      const v: Record<string, any> = { date: label };
      datasets.forEach((dataset) => {
        if (dataset.data[idx] === 0 && !area) return;
        v[dataset.model] = dataset.data[idx];
      });

      return v;
    });
  }, [area, labels, datasets]);

  const categories = useMemo(
    () => datasets.map((dataset) => dataset.model),
    [datasets],
  );

  const colors = useMemo(
    () => datasets.map((dataset) => getModelColor(dataset.model)),
    [datasets],
  );

  return (
    <div className={`chart`}>
      <div className={`chart-title mb-2`}>
        <div className={`flex flex-row items-center`}>
          {t("admin.model-chart")}
          <Tips content={t("admin.model-chart-tip")} />
        </div>
        {labels.length === 0 && (
          <Loader2 className={`h-4 w-4 inline-block animate-spin`} />
        )}
        <div className={`grow`} />
        <Button
          variant={`ghost`}
          size={`icon-sm`}
          onClick={() => setArea(!area)}
        >
          {area ? (
            <BarChart4 className={`h-4 w-4`} />
          ) : (
            <LineChartIcon className={`h-4 w-4`} />
          )}
        </Button>
      </div>
      {!area ? (
        <BarChart
          className={`common-chart`}
          data={data}
          index={"date"}
          layout={`horizontal`}
          stack={true}
          categories={categories}
          colors={colors}
          valueFormatter={(value) => getReadableNumber(value, 1, true)}
          showLegend={false}
        />
      ) : (
        <AreaChart
          className={`common-chart`}
          data={data}
          index={"date"}
          stack={true}
          categories={categories}
          colors={colors}
          valueFormatter={(value) => getReadableNumber(value, 1, true)}
          showLegend={false}
        />
      )}
    </div>
  );
}

export default ModelChart;
