import { Toaster } from "@/components/ui/toaster.tsx";
import QuotaDialog from "./QuotaDialog.tsx";
import ApikeyDialog from "./ApikeyDialog.tsx";
import PackageDialog from "./PackageDialog.tsx";
import SubscriptionDialog from "./SubscriptionDialog.tsx";
import ShareManagementDialog from "./ShareManagementDialog.tsx";
import InvitationDialog from "./InvitationDialog.tsx";
import SettingsDialog from "@/dialogs/SettingsDialog.tsx";
import MaskDialog from "@/dialogs/MaskDialog.tsx";

function DialogManager() {
  return (
    <>
      <Toaster />
      <QuotaDialog />
      <ApikeyDialog />
      <PackageDialog />
      <SubscriptionDialog />
      <ShareManagementDialog />
      <InvitationDialog />
      <MaskDialog />
      <SettingsDialog />
    </>
  );
}

export default DialogManager;
