import { Bar } from "react-chartjs-2";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getModelColor } from "@/admin/colors.ts";
import { Loader2 } from "lucide-react";
import Tips from "@/components/Tips.tsx";

type ModelChartProps = {
  labels: string[];
  datasets: {
    model: string;
    data: number[];
  }[];
  dark?: boolean;
};
function ModelChart({ labels, datasets, dark }: ModelChartProps) {
  const { t } = useTranslation();
  const data = useMemo(() => {
    return {
      labels,
      datasets: datasets.map((dataset) => {
        return {
          label: dataset.model,
          data: dataset.data,
          backgroundColor: getModelColor(dataset.model),
        };
      }),
    };
  }, [labels, datasets]);

  const options = useMemo(() => {
    const text = dark ? "#fff" : "#000";

    return {
      responsive: true,
      scales: {
        x: {
          stacked: true,
          grid: {
            drawBorder: false,
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          stacked: true,
          grid: {
            drawBorder: false,
            display: false,
          },
        },
      },
      plugins: {
        title: {
          display: false,
        },
        legend: {
          position: "right",
          display: true,
          labels: {
            color: text,
          },
        },
      },
      color: text,
      borderWidth: 0,
      defaultFontColor: text,
      defaultFontSize: 16,
      defaultFontFamily: "Andika",
    };
  }, [dark]);

  return (
    <div className={`chart`}>
      <p className={`chart-title mb-2`}>
        <p className={`flex flex-row items-center`}>
          {t("admin.model-chart")}
          <Tips content={t("admin.model-chart-tip")} />
        </p>
        {labels.length === 0 && (
          <Loader2 className={`h-4 w-4 inline-block animate-spin`} />
        )}
      </p>
      {
        //@ts-ignore
        <Bar id={`model-chart`} data={data} options={options} />
      }
    </div>
  );
}

export default ModelChart;
