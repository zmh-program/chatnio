import { useState } from "react";
import ChannelTable from "@/components/admin/assemblies/ChannelTable.tsx";
import ChannelEditor from "@/components/admin/assemblies/ChannelEditor.tsx";

function ChannelSettings() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [id, setId] = useState<number>(-1);

  return (
    <>
      <ChannelTable setEnabled={setEnabled} setId={setId} display={!enabled} />
      <ChannelEditor setEnabled={setEnabled} id={id} display={enabled} />
    </>
  );
}

export default ChannelSettings;
