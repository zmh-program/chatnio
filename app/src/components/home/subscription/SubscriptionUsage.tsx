import { SubscriptionIcon } from "@/conf/subscription.tsx";
import React from "react";
import Icon from "@/components/utils/Icon.tsx";

type UsageProps = {
  icon: string | React.ReactElement;
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
        {typeof icon === "string" ? (
          <SubscriptionIcon type={icon} className={`h-4 w-4 mr-1`} />
        ) : (
          <Icon icon={icon} className={`h-4 w-4 mr-1`} />
        )}
        {name}
        <div className={`grow`} />
        {typeof usage === "number" ? (
          <div className={`sub-value`}>
            <p>{usage}</p>
          </div>
        ) : (
          <div className={`sub-value`}>
            <p>{usage.used}</p> /{" "}
            <p> {usage.total === -1 ? "∞" : usage.total} </p>
          </div>
        )}
      </div>
    )
  );
}

export default SubscriptionUsage;
