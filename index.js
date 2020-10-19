import "./components/Navbar.js";
import { HomePage, TrainingPage } from "./router.js";

import { robot } from "./contestants/NewBot/robot.js";
import { boto } from "./contestants/boto/robot.js";

const players = {
  robot1: robot(),
  robot2: boto()
};

HomePage.contestants = players;
HomePage.render();
TrainingPage.contestants = players;
TrainingPage.render();
feather.replace();