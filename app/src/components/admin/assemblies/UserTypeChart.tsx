import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { UserTypeChartResponse } from "@/admin/types.ts";
import Tips from "@/components/Tips.tsx";
import { DonutChart, Legend } from "@tremor/react";

type UserTypeChartProps = {
  data: UserTypeChartResponse;
};

function UserTypeChart({ data }: UserTypeChartProps) {
  const { t } = useTranslation();

  const chart = useMemo(() => {
    return [
      { name: t("admin.identity.normal"), value: data.normal },
      { name: t("admin.identity.api_paid"), value: data.api_paid },
      { name: t("admin.identity.basic_plan"), value: data.basic_plan },
      { name: t("admin.identity.standard_plan"), value: data.standard_plan },
      { name: t("admin.identity.pro_plan"), value: data.pro_plan },
    ];
  }, [data]);

  return (
    <div className={`chart`}>
      <p className={`chart-title mb-2`}>
        <p className={`flex flex-row items-center w-full`}>
          <p>
            {t("admin.user-type-chart")}
            <Tips content={t("admin.user-type-chart-tip")} />
          </p>
          <p className={`text-sm ml-auto chart-title-info`}>
            {t("admin.user-type-chart-info", { total: data.total })}
          </p>
        </p>
        {data.total === 0 && (
          <Loader2 className={`h-4 w-4 inline-block animate-spin`} />
        )}
      </p>
      <div className={`flex flex-row`}>
        <DonutChart
          className={`common-chart p-4 w-[65%]`}
          variant={`donut`}
          data={chart}
          showAnimation={true}
          colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
        />
        <Legend
          className={`common-chart p-4 w-[35%]`}
          categories={chart.map((item) => item.name)}
          colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
        />
      </div>
    </div>
  );
}

export default UserTypeChart;
