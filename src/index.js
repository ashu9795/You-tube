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
app.listen(process.env.PORT || 8000, () => {
console.log(`Server is running on port  : ${process.env.PORT || 8000}`);}
    )
    }
)
.catch((err) => {
    console.log("MOnGODB connection failed" , err);

    
})
