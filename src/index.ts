import config from "config"
import {createServer} from "./server/createServer";
import { Server } from "node:http"

export function startServer(){
    const port = config.get<string>("port");
    const app = createServer();
    return app.listen(port, (error) => {
        if(error){
            console.error(error);
            process.exit(1);
        }
        console.log("Server listening on port 3000");
        process.on("exit", () => {
            console.info("⛔️ Server Stopped");
        });
    });
}

if (require.main === module) {
    startServer();
}

export function stopServer(server: Server){
    server.close();
}