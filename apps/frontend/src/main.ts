import { createApp } from "vue";
import "element-plus/dist/index.css";
import "./main.css";
import App from "./App.vue";
import router from "./router";
import ModalPlugin from "./components/GlobalModal/modalManager";

const app = createApp(App);
app.use(router);
app.use(ModalPlugin);
app.mount("#app");
