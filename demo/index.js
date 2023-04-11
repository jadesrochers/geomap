import * as ReactDOMClient from "react-dom/client";
import { App } from "./component/App.js";

const container = document.getElementById('app');

const root = ReactDOMClient.createRoot(container)

root.render(<App />);
