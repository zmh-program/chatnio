import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Loader2 } from "lucide-react";

type RequestChartProps = {
  labels: string[];
  datasets: number[];
  dark?: boolean;
};
function RequestChart({ labels, datasets, dark }: RequestChartProps) {
  const { t } = useTranslation();
  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: t("admin.requests"),
          fill: true,
          data: datasets,
          borderColor: "rgba(109,179,255,1)",
          backgroundColor: "rgba(109,179,255,0.5)",
        },
      ],
    };
  }, [labels, datasets]);

  const options = useMemo(() => {
    const text = dark ? "#fff" : "#000";

    return {
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
          display: true,
          labels: {
            color: text,
          },
        },
      },
      color: text,
      borderWidth: 0,
    };
  }, [dark]);

  return (
    <div className={`chart`}>
      <p className={`chart-title mb-2`}>
        <p>{t("admin.request-chart")}</p>
        {labels.length === 0 && (
          <Loader2 className={`h-4 w-4 inline-block animate-spin`} />
        )}
      </p>
      <Line id={`request-chart`} data={data} options={options} />
    </div>
  );
}

export default RequestChart;
