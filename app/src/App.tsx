import { Provider } from "react-redux";
import store from "./store/index.ts";
import AppProvider from "./components/app/AppProvider.tsx";
import { AppRouter } from "./router.tsx";

function App() {
  return (
    <Provider store={store}>
      <AppProvider />
      <AppRouter />
    </Provider>
  );
}

export default App;
