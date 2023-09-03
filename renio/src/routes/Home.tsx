import "../assets/home.less";

function SideBar() {
    return (
      <div className={`sidebar`}>
      </div>
    )
}

function ChatWrapper() {
    return (
      <div className={`chat-container`}>
      </div>
    )
}

function Home() {
    return (
      <div className={`main`}>
        <SideBar />
        <ChatWrapper />
      </div>
    )
}

export default Home
