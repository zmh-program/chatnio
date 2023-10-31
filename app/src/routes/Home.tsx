import "@/assets/pages/home.less";
import "@/assets/pages/chat.less";
import ChatWrapper from "@/components/home/ChatWrapper.tsx";
import SideBar from "@/components/home/SideBar.tsx";

function Home() {
  return (
    <div className={`main`}>
      <SideBar />
      <ChatWrapper />
    </div>
  );
}

export default Home;
