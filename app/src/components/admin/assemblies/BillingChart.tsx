import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

type BillingChartProps = {
  labels: string[];
  datasets: number[];
  dark?: boolean;
};
function BillingChart({ labels, datasets, dark }: BillingChartProps) {
  const { t } = useTranslation();
  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "CNY",
          fill: true,
          data: datasets,
          backgroundColor: "rgba(255,205,111,0.78)",
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
      <p className={`mb-2`}>{t("admin.billing-chart")}</p>
      <Line id={`billing-chart`} data={data} options={options} />
    </div>
  );
}

export default BillingChart;
