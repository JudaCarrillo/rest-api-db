import express from "express";
import { createMovieRouter } from "./routes/movies.js";
import { corsMiddleware } from "./middleware/cors.js";
import { MovieModel } from "./models/postgresql/movie.js";

// Define la función createApp
export const createApp = ({ movieModel }) => {
  const app = express();
  app.use(express.json());
  app.disable("x-powered-by");
  app.use(corsMiddleware());
  app.use("/movies", createMovieRouter({ movieModel }));

  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () =>
    console.log(`Server running on port http://localhost:${PORT}`)
  );
};

createApp({ movieModel: MovieModel });
