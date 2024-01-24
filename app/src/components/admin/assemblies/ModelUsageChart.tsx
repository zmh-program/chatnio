import { Doughnut } from "react-chartjs-2";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import Tips from "@/components/Tips.tsx";
import { sum } from "@/utils/base.ts";
import { getModelColor } from "@/admin/colors.ts";

type ModelChartProps = {
  labels: string[];
  datasets: {
    model: string;
    data: number[];
  }[];
  dark?: boolean;
};

type DataUsage = {
  model: string;
  usage: number;
};

function ModelUsageChart({ labels, datasets, dark }: ModelChartProps) {
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

  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => item.model),
      datasets: [
        {
          data: data.map((item) => item.usage),
          backgroundColor: data.map((item) => getModelColor(item.model)),
          borderWidth: 0,
        },
      ],
    };
  }, [labels, datasets]);

  const options = useMemo(() => {
    const text = dark ? "#fff" : "#000";

    return {
      responsive: true,
      color: text,
      borderWidth: 0,
      defaultFontColor: text,
      defaultFontSize: 16,
      defaultFontFamily: "Andika",
      // set labels to right side
      plugins: {
        legend: {
          position: "right",
        },
      },
    };
  }, [dark]);

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
      {
        // @ts-ignore
        <Doughnut id={`model-usage-chart`} data={chartData} options={options} />
      }
    </div>
  );
}

export default ModelUsageChart;
