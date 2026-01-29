import { AppService } from "./services";

const serverApp = new AppService();
serverApp.start();

export default serverApp.getApp();
