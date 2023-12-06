import pg from "pg";
import { randomUUID } from "node:crypto";

const DEFAULT_CONFIG = {
  host: "ep-dark-dream-38405570.us-east-2.aws.neon.fl0.io",
  port: 5432,
  database: "moviesdb",
  user: "fl0user",
  password: "ueyLm4Z2MIWB",
  sslmode: "require",
  ssl: {
    rejectUnauthorized: false,
  },
};

const client = new pg.Client(process.env.DATABASE_URL || DEFAULT_CONFIG);

const connection = await client.connect();

export class MovieModel {
  static async getAll() {
    const query =
      "SELECT id, title, year, director, duration, poster, rate FROM movie;";
    const result = await client.query(query);
    return result.rows;
  }

  static async getByGenre({ genre }) {
    if (genre) {
      const lowerCaseGenre = genre.toLowerCase();

      const genreQuery = "SELECT id FROM genre WHERE LOWER(name) = $1;";
      const genreResult = await client.query(genreQuery, [lowerCaseGenre]);

      if (!genreResult.rows || genreResult.rows.length === 0) {
        return [];
      }

      const genreId = genreResult.rows[0].id;

      const moviesGenreQuery =
        "SELECT id_movie FROM movie_genres WHERE id_genre = $1;";
      const moviesGenreResult = await client.query(moviesGenreQuery, [genreId]);

      if (!moviesGenreResult.rows || moviesGenreResult.rows.length === 0) {
        return [];
      }

      const movieIds = moviesGenreResult.rows.map((movie) => movie.id_movie);

      const moviesQuery =
        "SELECT id, title, year, director, duration, poster, rate FROM movie WHERE id = ANY($1);";
      const moviesResult = await client.query(moviesQuery, [movieIds]);

      return moviesResult.rows;
    }
  }

  static async getById({ id }) {
    if (id) {
      const movieQuery =
        "SELECT id, title, year, director, duration, poster, rate FROM movie WHERE id = $1;";
      const movieResult = await client.query(movieQuery, [id]);
      return movieResult.rows;
    }
  }

  static async create({ input }) {
    const {
      title,
      year,
      director,
      duration,
      poster,
      genre: genreInput,
      rate,
    } = input;

    const genreQuery = "SELECT id FROM genre WHERE name = ANY($1)";
    const genreResult = await client.query(genreQuery, [genreInput]);

    if (!genreResult.rows || genreResult.rows.length === 0) {
      return null;
    }

    const genreIds = genreResult.rows.map((genre) => genre.id);
    const movieId = randomUUID();

    const movieQuery =
      "INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES ($1, $2, $3, $4, $5, $6, $7)";
    const movieValues = [
      movieId,
      title,
      year,
      director,
      duration,
      poster,
      rate,
    ];

    await client.query(movieQuery, movieValues);

    const movieGenreValues = genreIds.map((genreId) => [movieId, genreId]);

    for (const values of movieGenreValues) {
      const query =
        "INSERT INTO movie_genres (id_movie, id_genre) VALUES ($1, $2)";

      await client.query(query, values);
    }

    const newMovieQuery =
      "SELECT id, title, year, director, duration, poster, rate FROM movie WHERE id = $1;";
    const newMovie = await client.query(newMovieQuery, [movieId]);

    return newMovie.rows;
  }

  static async update({ id, input }) {
    if (!id || !input) {
      return false;
    }

    const { genre, ...updateFields } = input;

    if (Object.keys(updateFields).length > 0) {
      const updateQueryParts = [];
      const updateValues = [id];

      let valueIndex = 2;

      for (const [key, value] of Object.entries(updateFields)) {
        updateQueryParts.push(`${key} = $${valueIndex}`);
        updateValues.push(value);
        valueIndex++;
      }

      const updateQuery = `
          UPDATE movie
          SET ${updateQueryParts.join(", ")}
          WHERE id = $1
          RETURNING *
        `;

      await client.query(updateQuery, updateValues);
    }

    if (genre) {
      const genreQuery = "SELECT id FROM genre WHERE name = ANY($1)";
      const genreResult = await client.query(genreQuery, [[genre]]);

      const genreDeleteQuery = "DELETE FROM movie_genres WHERE id_movie = $1";
      await client.query(genreDeleteQuery, [id]);

      const genreIds = genreResult.rows.map((genre) => genre.id);
      const movieGenreValues = genreIds.map((genreId) => [id, genreId]);

      for (const values of movieGenreValues) {
        const query =
          "INSERT INTO movie_genres (id_movie, id_genre) VALUES ($1, $2)";

        await client.query(query, values);
      }
    }

    const updatedMovie = await client.query(
      "SELECT * FROM movie WHERE id = $1",
      [id]
    );

    return updatedMovie.rows;
  }

  static async delete({ id }) {
    if (id) {
      const checkReferenceQuery =
        "SELECT * FROM movie_genres WHERE id_movie = $1";
      const checkReferenceResult = await client.query(checkReferenceQuery, [
        id,
      ]);

      if (checkReferenceResult.rows && checkReferenceResult.rows.length > 0) {
        const deleteGenresQuery =
          "DELETE FROM movie_genres WHERE id_movie = $1";
        await client.query(deleteGenresQuery, [id]);
      }

      const deleteMovieQuery = "DELETE FROM movie WHERE id = $1";
      await client.query(deleteMovieQuery, [id]);

      return true;
    }
  }
}
