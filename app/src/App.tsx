import { Provider } from "react-redux";
import store from "./store/index.ts";
import AppProvider from "./components/app/AppProvider.tsx";
import { AppRouter } from "./router.tsx";
import { Toaster } from "@/components/ui/sonner";
import Spinner from "@/spinner.tsx";

function App() {
  return (
    <Provider store={store}>
      <Toaster />
      <Spinner />
      <AppProvider />
      <AppRouter />
    </Provider>
  );
}

export default App;
