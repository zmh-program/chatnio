import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

type ErrorChartProps = {
  labels: string[];
  datasets: number[];
  dark?: boolean;
};
function ErrorChart({ labels, datasets, dark }: ErrorChartProps) {
  const { t } = useTranslation();
  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: t("admin.times"),
          fill: true,
          data: datasets,
          backgroundColor: "rgba(255,85,85,0.6)",
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
      <p className={`mb-2`}>{t("admin.error-chart")}</p>
      <Line id={`error-chart`} data={data} options={options} />
    </div>
  );
}

export default ErrorChart;
