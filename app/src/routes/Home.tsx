import "@/assets/pages/home.less";
import "@/assets/pages/chat.less";
import ChatWrapper from "@/components/home/ChatWrapper.tsx";
import SideBar from "@/components/home/SideBar.tsx";
import { useSelector } from "react-redux";
import { selectMarket } from "@/store/chat.ts";
import ModelMarket from "@/components/home/ModelMarket.tsx";
import ErrorBoundary from "@/components/ErrorBoundary.tsx";

function Home() {
  const market = useSelector(selectMarket);

  return (
    <ErrorBoundary>
      <div className={`main`}>
        <SideBar />
        {market ? <ModelMarket /> : <ChatWrapper />}
      </div>
    </ErrorBoundary>
  );
}

export default Home;
