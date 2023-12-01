import { useState } from "react";
import ChannelTable from "@/components/admin/assemblies/ChannelTable.tsx";
import ChannelEditor from "@/components/admin/assemblies/ChannelEditor.tsx";

function ChannelSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);

  return !enabled ? (
    <ChannelTable setEnabled={setEnabled} />
  ) : (
    <ChannelEditor setEnabled={setEnabled} />
  );
}

export default ChannelSettings;
