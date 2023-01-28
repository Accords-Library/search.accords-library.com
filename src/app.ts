import http from "http";
import { requestListener } from "./server";
import { synchronizeStrapiAndMeili } from "./syncho";
import * as dotenv from "dotenv";
dotenv.config();

await synchronizeStrapiAndMeili();

http.createServer(requestListener).listen(process.env.PORT, () => {
  console.log(`Server started on port: ${process.env.PORT}`);
});
