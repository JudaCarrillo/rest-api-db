import { validateMovie, validatePartialMovie } from "../schemas/movies.js";

export class MovieController {
  constructor(movieModel) {
    this.movieModel = movieModel;
  }

  getMovies = async (req, res) => {
    const { genre } = req.query;

    if (genre) {
      // if genre parameter is provide, filter all movies by genre
      const moviesByGenre = await this.movieModel.getByGenre({ genre });
      return res.json(moviesByGenre);
    } else {
      // if genre parameter is not provide, get all movies
      const allMovies = await this.movieModel.getAll();
      return res.json(allMovies);
    }
  };

  getById = async (req, res) => {
    const { id } = req.params;
    const movie = await this.movieModel.getById({ id });
    if (movie) return res.json(movie);
    res.status(404).json({ message: "Movie not found" });
  };

  create = async (req, res) => {
    const result = validateMovie(req.body);

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = await this.movieModel.create({ input: result.data });
    res.status(201).json(newMovie); // update client cache
  };

  delete = async (req, res) => {
    const { id } = req.params;
    const result = await this.movieModel.delete({ id });

    if (!result) {
      return res.status(404).json({ message: "Movie not found" });
    }

    return res.json({ message: "Movie deleted" });
  };

  update = async (req, res) => {
    const result = validatePartialMovie(req.body);
    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const updatedMovie = await this.movieModel.update({
      id,
      input: result.data,
    });

    return res.json(updatedMovie);
  };
}
