import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { AreaChart } from "@tremor/react";

type BillingChartProps = {
  labels: string[];
  datasets: number[];
};
function BillingChart({ labels, datasets }: BillingChartProps) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    return datasets.map((data, index) => ({
      date: labels[index],
      [t("admin.billing")]: data,
    }));
  }, [labels, datasets, t("admin.billing")]);

  return (
    <div className={`chart`}>
      <div className={`chart-title mb-2`}>
        <p>{t("admin.billing-chart")}</p>
        {labels.length === 0 && (
          <Loader2 className={`h-4 w-4 inline-block animate-spin`} />
        )}
      </div>
      <AreaChart
        className={`common-chart`}
        data={data}
        categories={[t("admin.billing")]}
        index={"date"}
        colors={["orange"]}
        showAnimation={true}
        valueFormatter={(value) => `￥${value.toFixed(2)}`}
      />
    </div>
  );
}

export default BillingChart;
