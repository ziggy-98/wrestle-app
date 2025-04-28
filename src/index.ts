import config from "config"
import {createServer} from "./server/createServer";

export function main(){
    const port = config.get<string>("port");
    const server = createServer();
    server.listen(port, (error) => {
        if(error){
            console.error(error);
            process.exit(1);
        }
        console.log("Server listening on port 3000");
    });
}

main();