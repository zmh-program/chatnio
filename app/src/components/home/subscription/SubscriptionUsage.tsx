import React from "react";
import Icon from "@/components/utils/Icon.tsx";

type UsageProps = {
  icon: React.ReactElement;
  name: string;
  usage:
    | {
        used: number;
        total: number;
      }
    | number
    | undefined;
};

function SubscriptionUsage({ icon, name, usage }: UsageProps) {
  return (
    usage && (
      <div className={`sub-column`}>
        <Icon icon={icon} className={`h-4 w-4 mr-1`} />
        {name}
        <div className={`grow`} />
        {typeof usage === "number" ? (
          <div className={`sub-value`}>
            <p>{usage}</p>
          </div>
        ) : (
          <div className={`sub-value`}>
            <p>{usage.used}</p> / <p> {usage.total} </p>
          </div>
        )}
      </div>
    )
  );
}

export default SubscriptionUsage;
