import { Doughnut } from "react-chartjs-2";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { UserTypeChartResponse } from "@/admin/types.ts";
import Tips from "@/components/Tips.tsx";

type UserTypeChartProps = {
  data: UserTypeChartResponse;
  dark?: boolean;
};

function UserTypeChart({ data, dark }: UserTypeChartProps) {
  const { t } = useTranslation();

  const chart = useMemo(() => {
    return {
      labels: [
        t("admin.identity.normal"),
        t("admin.identity.api_paid"),
        t("admin.identity.basic_plan"),
        t("admin.identity.standard_plan"),
        t("admin.identity.pro_plan"),
      ],
      datasets: [
        {
          data: [
            data.normal,
            data.api_paid,
            data.basic_plan,
            data.standard_plan,
            data.pro_plan,
          ],
          backgroundColor: ["#fff", "#aaa", "#ffa64e", "#ff840b", "#ff7e00"],
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

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
      {
        // @ts-ignore
        <Doughnut id={`user-type-chart`} data={chart} options={options} />
      }
    </div>
  );
}

export default UserTypeChart;
