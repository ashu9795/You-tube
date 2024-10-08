import express from 'express';
import cors from 'cors'; // Cross Origin Resource Sharing (CORS) is a security protocol that helps prevent cross-origin attacks.
import cookieParser from 'cookie-parser';
// use is used to use the middleware in the express application

import userRouter from './routes/user.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import videoRouter from './routes/video.routes.js';
import commentRouter from './routes/comment.routes.js';
import likeRouter from './routes/like.routes.js';
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

const app = express();

app.use(cors({     
    origin : process.env.CORS_ORIGIN,
    credentials : true           // it allow to send the cookie from the server to the client side; 

})); 

app.use(express.json({limit : "120kb"}));   //it allow to send data in json format at a particular limit;

app.use(express.urlencoded({extended : true})); //it allow to send data in urlencoded format;

app.use(express.static('public')); //it allow to serve static files like images, css, js etc.  from the public folder;
app.use(cookieParser()); //it allow to parse the cookie data;
//Routes
app.get('/', (req, res) => {
    res.send('Welcome to my API!');
  });

//routes declaration

app.use("/api/v1/users", userRouter);

app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlists", playlistRouter);


export {app}