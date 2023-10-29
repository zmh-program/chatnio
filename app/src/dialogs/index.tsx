import { Toaster } from "@/components/ui/toaster.tsx";
import Quota from "./Quota.tsx";
import ApiKey from "./ApiKey.tsx";
import Package from "./Package.tsx";
import Subscription from "./Subscription.tsx";
import ShareManagement from "./ShareManagement.tsx";
import Invitation from "./Invitation.tsx";

function DialogManager() {
  return (
    <>
      <Toaster />
      <Quota />
      <ApiKey />
      <Package />
      <Subscription />
      <ShareManagement />
      <Invitation />
    </>
  );
}

export default DialogManager;
