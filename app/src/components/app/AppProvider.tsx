import NavBar from "./NavBar.tsx";
import { ThemeProvider } from "@/components/ThemeProvider.tsx";
import DialogManager from "@/dialogs";
import Broadcast from "@/components/Broadcast.tsx";
import { useEffectAsync } from "@/utils/hook.ts";
import { allModels } from "@/conf.ts";
import axios from "axios";
import { channelModels } from "@/admin/channel.ts";

function AppProvider() {
  useEffectAsync(async () => {
    if (allModels.length !== 0) return;

    const res = await axios.get("/v1/models");
    res.data.forEach((model: string) => {
      if (!allModels.includes(model)) allModels.push(model);
      if (!channelModels.includes(model)) channelModels.push(model);
    });
  }, [allModels]);

  return (
    <>
      <Broadcast />
      <NavBar />
      <ThemeProvider />
      <DialogManager />
    </>
  );
}

export default AppProvider;
