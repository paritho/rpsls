import Home from "./pages/home.js";
import Training from "./pages/training.js";

const { bind } = HyperHTMLElement,
  { app } = ARoute,
  appBody = document.getElementById("app-body");

const setActive = (pageName) => {
    const oldActive = document.querySelector(".nav-item.active"),
      newActive = document.getElementById(`${pageName}Link`);
    if (oldActive) {
      oldActive.classList.remove("active");
    }
    if (newActive) {
      newActive.classList.add("active");
    }
  },
  HomePage = new Home(),
  TrainingPage = new Training();

app.get("/", () => {
  setActive("home");
  bind(appBody)`${HomePage}`;
});

app.get("/training", () => {
  setActive("training");
  bind(appBody)`${TrainingPage}`;
});

app.navigate("/");

export { HomePage, TrainingPage };
