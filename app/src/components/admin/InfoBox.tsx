import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CircleDollarSign, Users2, Wallet } from "lucide-react";

function InfoBox() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    today: 0,
    month: 0,
    users: 0,
  });

  return (
    <div className={`info-boxes`}>
      <div className={`info-box`}>
        <div className={`box-wrapper`}>
          <div className={`box-title`}>{t("admin.billing-today")}</div>
          <div className={`box-value money`}>{form.today}</div>
        </div>
        <div className={`box-icon`}>
          <CircleDollarSign />
        </div>
      </div>

      <div className={`info-box`}>
        <div className={`box-wrapper`}>
          <div className={`box-title`}>{t("admin.billing-month")}</div>
          <div className={`box-value money`}>{form.month}</div>
        </div>
        <div className={`box-icon`}>
          <Wallet />
        </div>
      </div>

      <div className={`info-box`}>
        <div className={`box-wrapper`}>
          <div className={`box-title`}>{t("admin.subscription-users")}</div>
          <div className={`box-value`}>
            {form.users}
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
