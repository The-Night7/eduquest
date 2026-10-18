import "@fontsource/press-start-2p";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import "./ui/styles.css";
import { startApp } from "./ui/app";

const root = document.getElementById("app");
if (!root) throw new Error("#app introuvable");
startApp(root);
