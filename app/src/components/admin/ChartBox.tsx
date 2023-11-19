import ModelChart from "@/components/admin/assemblies/ModelChart.tsx";
import { useEffect, useState } from "react";
import {
  BillingChartResponse,
  ErrorChartResponse,
  ModelChartResponse,
  RequestChartResponse,
} from "@/admin/types.ts";

import { ArcElement, Chart, Filler, LineElement, PointElement } from "chart.js";
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector } from "react-redux";
import { selectMenu } from "@/store/menu.ts";
import { getMemory } from "@/utils/memory.ts";
import { themeEvent } from "@/events/theme.ts";
import RequestChart from "@/components/admin/assemblies/RequestChart.tsx";
import BillingChart from "@/components/admin/assemblies/BillingChart.tsx";
import ErrorChart from "@/components/admin/assemblies/ErrorChart.tsx";
import { useEffectAsync } from "@/utils/hook.ts";
import {
  getBillingChart,
  getErrorChart,
  getModelChart,
  getRequestChart,
} from "@/admin/api.ts";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
);

function resize(task: number): number {
  Object.values(Chart.instances).forEach((chart) => {
    chart.resize();
  });

  return Number(
    setTimeout(() => {
      clearTimeout(task);
      window.addEventListener("resize", () => {
        Object.values(Chart.instances).forEach((chart) => {
          chart.resize();
        });
      });
    }, 500),
  );
}

function ChartBox() {
  const open = useSelector(selectMenu);
  let timeout: number = 0;

  useEffect(() => {
    timeout = resize(timeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [open]);

  const [dark, setDark] = useState<boolean>(getMemory("theme") !== "light");
  themeEvent.bind((theme: string) => setDark(theme === "dark"));

  const [model, setModel] = useState<ModelChartResponse>({
    date: [],
    value: [],
  });

  const [request, setRequest] = useState<RequestChartResponse>({
    date: [],
    value: [],
  });

  const [billing, setBilling] = useState<BillingChartResponse>({
    date: [],
    value: [],
  });

  const [error, setError] = useState<ErrorChartResponse>({
    date: [],
    value: [],
  });

  useEffectAsync(async () => {
    setModel(await getModelChart());
    setRequest(await getRequestChart());
    setBilling(await getBillingChart());
    setError(await getErrorChart());
  }, []);

  return (
    <div className={`chart-boxes`}>
      <div className={`chart-box`}>
        <ModelChart labels={model.date} datasets={model.value} dark={dark} />
      </div>
      <div className={`chart-box`}>
        <RequestChart
          labels={request.date}
          datasets={request.value}
          dark={dark}
        />
      </div>
      <div className={`chart-box`}>
        <BillingChart
          labels={billing.date}
          datasets={billing.value}
          dark={dark}
        />
      </div>
      <div className={`chart-box`}>
        <ErrorChart labels={error.date} datasets={error.value} dark={dark} />
      </div>
    </div>
  );
}

export default ChartBox;
