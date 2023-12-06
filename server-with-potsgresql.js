import { createApp } from "./app.js";
import { MovieModel } from "./models/postgresql/movie.js";

createApp({ movieModel: MovieModel });
