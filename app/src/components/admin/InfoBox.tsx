import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CircleDollarSign, Users2, Wallet } from "lucide-react";
import { useEffectAsync } from "@/utils/hook.ts";
import { getAdminInfo } from "@/admin/api/chart.ts";
import { InfoResponse } from "@/admin/types.ts";

function InfoBox() {
  const { t } = useTranslation();
  const [form, setForm] = useState<InfoResponse>({
    billing_today: 0,
    billing_month: 0,
    subscription_count: 0,
  });

  useEffectAsync(async () => {
    setForm(await getAdminInfo());
  }, []);

  return (
    <div className={`info-boxes`}>
      <div className={`info-box`}>
        <div className={`box-wrapper`}>
          <div className={`box-title`}>{t("admin.billing-today")}</div>
          <div className={`box-value money`}>
            {form.billing_today.toFixed(2)}
          </div>
        </div>
        <div className={`box-icon`}>
          <CircleDollarSign />
        </div>
      </div>

      <div className={`info-box`}>
        <div className={`box-wrapper`}>
          <div className={`box-title`}>{t("admin.billing-month")}</div>
          <div className={`box-value money`}>
            {form.billing_month.toFixed(2)}
          </div>
        </div>
        <div className={`box-icon`}>
          <Wallet />
        </div>
      </div>

      <div className={`info-box`}>
        <div className={`box-wrapper`}>
          <div className={`box-title`}>{t("admin.subscription-users")}</div>
          <div className={`box-value`}>
            {form.subscription_count}
            <span className={`box-subvalue`}>{t("admin.seat")}</span>
          </div>
        </div>
        <div className={`box-icon`}>
          <Users2 />
        </div>
      </div>
    </div>
  );
}

export default InfoBox;
