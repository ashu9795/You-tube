import connectDB from "./db/index.js";

import {app} from './app.js'
import  dotenv from "dotenv" // it activate all environment variable in complete file;


dotenv.config(
    {
        path : './.env'  // is present in root directory;
    }
)
connectDB()
.then( () => {
    app.on("error", (err) => {
        console.log("Error in server", err);
    })
    const port = process.env.PORT || 8000 || 3000;

    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
    
    }
)
.catch((err) => {
    console.log("MOnGODB connection failed" , err);

    
})