import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";

export default function App() {

  return (
    //browserRouter makes possible to navigate with url:
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
