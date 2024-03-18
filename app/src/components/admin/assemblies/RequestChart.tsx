import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { AreaChart } from "@tremor/react";
import { getReadableNumber } from "@/utils/processor.ts";

type RequestChartProps = {
  labels: string[];
  datasets: number[];
};

function RequestChart({ labels, datasets }: RequestChartProps) {
  const { t } = useTranslation();
  const data = useMemo(() => {
    return datasets.map((data, index) => ({
      date: labels[index],
      [t("admin.requests")]: data,
    }));
  }, [labels, datasets, t("admin.requests")]);

  return (
    <div className={`chart`}>
      <div className={`chart-title mb-2`}>
        <p>{t("admin.request-chart")}</p>
        {labels.length === 0 && (
          <Loader2 className={`h-4 w-4 inline-block animate-spin`} />
        )}
      </div>
      <AreaChart
        className={`common-chart`}
        data={data}
        categories={[t("admin.requests")]}
        index={"date"}
        colors={["blue"]}
        showAnimation={true}
        valueFormatter={(value) => getReadableNumber(value, 1)}
      />
    </div>
  );
}

export default RequestChart;
