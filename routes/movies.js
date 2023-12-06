import { Router } from "express";
import { MovieController } from "../controllers/movies.js";

export const createMovieRouter = ({ movieModel }) => {
  const moviesRouter = Router();
  const movieController = new MovieController(movieModel);

  // retrieve movies by genre
  moviesRouter.get("/", movieController.getMovies);

  // retrieve all movies
  moviesRouter.get("/", movieController.getMovies);

  // create movie
  moviesRouter.post("/", movieController.create);

  // retrieve movie by id
  moviesRouter.get("/:id", movieController.getById);

  // delete movie
  moviesRouter.delete("/:id", movieController.delete);

  // update movie
  moviesRouter.patch("/:id", movieController.update);

  return moviesRouter;
};
