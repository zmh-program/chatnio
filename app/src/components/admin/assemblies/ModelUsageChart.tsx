import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import Tips from "@/components/Tips.tsx";
import { sum } from "@/utils/base.ts";
import { DonutChart, Legend } from "@tremor/react";
import { getReadableNumber } from "@/utils/processor.ts";
import { getModelColor } from "@/admin/colors.ts";

type ModelChartProps = {
  labels: string[];
  datasets: {
    model: string;
    data: number[];
  }[];
};

type DataUsage = {
  model: string;
  usage: number;
};

function ModelUsageChart({ labels, datasets }: ModelChartProps) {
  const { t } = useTranslation();

  const usage = useMemo((): Record<string, number> => {
    const usage: Record<string, number> = {};
    datasets.forEach((dataset) => {
      usage[dataset.model] = sum(dataset.data);
    });
    return usage;
  }, [datasets]);

  const data = useMemo((): DataUsage[] => {
    const models: string[] = Object.keys(usage);
    const data: number[] = models.map((model) => usage[model]);

    // sort by usage
    return models
      .map((model, i): DataUsage => ({ model, usage: data[i] }))
      .sort((a, b) => b.usage - a.usage);
  }, [usage]);

  const chart = useMemo(() => {
    return data.map((item) => {
      return { name: item.model, value: item.usage };
    });
  }, [labels, datasets]);

  const categories = useMemo(() => {
    return chart.map(
      (item) => `${item.name} (${getReadableNumber(item.value, 1)})`,
    )
  }, [chart]);

  type CustomTooltipTypeDonut = {
    payload: any;
    active: boolean | undefined;
    label: any;
  };

  const customTooltip = (props: CustomTooltipTypeDonut) => {
    const { payload, active } = props;
    if (!active || !payload) return null;
    const categoryPayload = payload?.[0];
    if (!categoryPayload) return null;
    return (
      <div className="chart-tooltip min-w-56 w-max z-10 rounded-tremor-default border border-tremor-border bg-tremor-background p-2 text-tremor-default shadow-tremor-dropdown">
        <div className="flex flex-1 space-x-2.5">
          <div
            className={`flex w-1.5 flex-col bg-${categoryPayload?.color}-500 rounded`}
          />
          <div className="w-full">
            <div className="flex items-center justify-between space-x-8">
              <p className="whitespace-nowrap text-right text-tremor-content">
                {categoryPayload.name}
              </p>
              <p className="whitespace-nowrap text-right font-medium text-tremor-content-emphasis">
                {getReadableNumber(categoryPayload.value, 1)} tokens
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`chart`}>
      <p className={`chart-title mb-2`}>
        <p className={`flex flex-row items-center`}>
          {t("admin.model-usage-chart")}
          <Tips content={t("admin.model-chart-tip")} />
        </p>
        {labels.length === 0 && (
          <Loader2 className={`h-4 w-4 inline-block animate-spin`} />
        )}
      </p>
      <div className={`flex flex-row`}>
        <DonutChart
          className={`common-chart p-4 w-[50%]`}
          variant={`donut`}
          data={chart}
          showAnimation={true}
          valueFormatter={(value) => getReadableNumber(value, 1)}
          customTooltip={customTooltip}
        />
        <Legend
          className={`common-chart p-2 w-[50%] z-0`}
          // keep 6 items max
          categories={categories.slice(0, 6)}
          colors={chart.slice(0, 6).map((item) => getModelColor(item.name))}
        />
      </div>
    </div>
  );
}

export default ModelUsageChart;
