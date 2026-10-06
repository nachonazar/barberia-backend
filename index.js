import Server from "./server/config.js";
import router from "./src/routes/index.routes.js";
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const server = new Server();

server.app.use("/api", router);

server.manejoDeErrores();

server.listen();

export default server.app;