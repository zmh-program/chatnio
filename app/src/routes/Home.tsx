import "@/assets/pages/home.less";
import "@/assets/pages/chat.less";
import ChatWrapper from "@/components/home/ChatWrapper.tsx";
import SideBar from "@/components/home/SideBar.tsx";
import { useSelector } from "react-redux";
import { selectMarket } from "@/store/chat.ts";
import ModelMarket from "@/components/home/ModelMarket.tsx";

function Home() {
  const market = useSelector(selectMarket);

  return (
    <div className={`main`}>
      <SideBar />
      {market ? <ModelMarket /> : <ChatWrapper />}
    </div>
  );
}

export default Home;
