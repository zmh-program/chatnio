import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

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
      <p className={`mb-2`}>{t("admin.request-chart")}</p>
      <Line id={`request-chart`} data={data} options={options} />
    </div>
  );
}

export default RequestChart;
