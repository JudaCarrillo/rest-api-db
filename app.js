import express from "express"; // require --> commonJS
import { createMovieRouter } from "./routes/movies.js";
import { corsMiddleware } from "./middleware/cors.js";

export const createApp = ({ movieModel }) => {
  const app = express();
  app.use(express.json()); // retrieve request
  app.disable("x-powered-by"); // disable the header X-Powered-By: Express

  // CORS PRE-Flight
  app.use(corsMiddleware());

  // Route movies
  app.use("/movies", createMovieRouter({ movieModel }));

  // Live
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () =>
    console.log(`Server running on port http://localhost:${PORT}`)
  );
};
