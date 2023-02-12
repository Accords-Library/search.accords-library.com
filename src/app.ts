import http from "http";
import { config } from "dotenv";
import { requestListener } from "./server";
import { synchronizeStrapiAndMeili } from "./syncho";

config();

await synchronizeStrapiAndMeili();

http.createServer(requestListener).listen(process.env.PORT, () => {
  console.log(`Server started on port: ${process.env.PORT}`);
});
