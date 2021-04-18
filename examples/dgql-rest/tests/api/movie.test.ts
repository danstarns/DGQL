import request from "supertest";
import app from "../../src/app";
import { generate } from "randomstring";
import { driver } from "../neo4j";

describe("movie", () => {
  describe("create", () => {
    test("should throw title should be a required", async () => {
      const payload = {
        movie: {},
      };

      const res = await request(app).post("/movie").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual("title @validate required");
    });

    test("should throw title should be a string", async () => {
      const payload = {
        movie: {
          title: Math.floor(Math.random() * 1000),
        },
      };

      const res = await request(app).post("/movie").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual("title @validate invalid type expected String");
    });

    test("should throw imdbRating should be a required", async () => {
      const payload = {
        movie: {
          title: generate({
            charset: "alphabetic",
          }),
        },
      };

      const res = await request(app).post("/movie").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual("imdbRating @validate required");
    });

    test("should throw imdbRating should be a number", async () => {
      const payload = {
        movie: {
          title: generate({
            charset: "alphabetic",
          }),
          imdbRating: generate({
            charset: "alphabetic",
          }),
        },
      };

      const res = await request(app).post("/movie").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual(
        "imdbRating @validate invalid type expected Number"
      );
    });

    test("should create a new movie", async () => {
      const payload = {
        movie: {
          title: generate({
            charset: "alphabetic",
          }),
          imdbRating: 8.7,
        },
      };

      const res = await request(app).post("/movie").send(payload);

      expect(res.status).toEqual(201);
      expect(res.body).toHaveProperty("movie");
      expect(res.body.movie.movieId).toBeTruthy();
    });

    test("should create a new movie with a genre and actor", async () => {
      const session = driver.session();
      try {
        const genre = {
          genreId: generate({
            charset: "alphabetic",
          }),
          name: generate({
            charset: "alphabetic",
          }),
        };

        const person = {
          personId: generate({
            charset: "alphabetic",
          }),
          born: 2021,
          name: generate({
            charset: "alphabetic",
          }),
        };

        const payload = {
          movie: {
            title: generate({
              charset: "alphabetic",
            }),
            imdbRating: 8.7,
            genres: [genre.genreId],
            actors: [person.personId],
          },
        };

        await session.run(
          `
          CREATE (:Genre $genre)
          CREATE (:Person $person)
        `,
          { genre, person }
        );

        const res = await request(app).post("/movie").send(payload);

        expect(res.status).toEqual(201);
        expect(res.body).toHaveProperty("movie");
        expect(res.body.movie.movieId).toBeTruthy();

        const find = await session.run(`
          MATCH (movie:Movie {movieId: "${res.body.movie.movieId}"})
          RETURN movie {
            movieId: movie.movieId, 
            imdbRating: movie.imdbRating,
            genres: [(movie)-[:IN_GENRE]->(g:Genre) | {genreId: g.genreId, name: g.name}],
            actors: [(movie)<-[:ACTED_IN]->(p:Person) | {personId: p.personId, name: p.name, born: p.born}]
          } AS movie
        `);

        const obj = find.records[0].get("movie");

        expect(obj).toMatchObject({
          movieId: res.body.movie.movieId,
          imdbRating: payload.movie.imdbRating,
          genres: [genre],
          actors: [person],
        });
      } finally {
        await session.close();
      }
    });
  });

  describe("read", () => {
    test("should find movies with regex", async () => {
      const session = driver.session();

      const titleOverlap = generate({
        charset: "alphabetic",
      });

      const movie1 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        title: titleOverlap,
        imdbRating: 8.7,
      };

      const movie2 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        title: titleOverlap,
        imdbRating: 8.7,
      };

      const person1 = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: generate({
          charset: "alphabetic",
        }),
        born: 2021,
      };

      const person2 = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: generate({
          charset: "alphabetic",
        }),
        born: 2021,
      };

      const genre = {
        genreId: generate({
          charset: "alphabetic",
        }),
        name: generate({
          charset: "alphabetic",
        }),
      };

      try {
        await session.run(
          `
          CREATE (m1:Movie $movie1)
          CREATE (m2:Movie $movie2)
          CREATE (p1:Person $person1)
          CREATE (p2:Person $person2)
          CREATE (g:Genre $genre)
          MERGE (m1)<-[:ACTED_IN]-(p1)
          MERGE (m2)<-[:ACTED_IN]-(p2)
          MERGE (m1)-[:IN_GENRE]->(g)
          MERGE (m2)-[:IN_GENRE]->(g)
        `,
          {
            movie1,
            movie2,
            person1,
            person2,
            genre,
          }
        );

        const res = await request(app).get(
          `/movie?search=${titleOverlap.toLowerCase()}`
        );

        expect(res.status).toEqual(200);
        expect(res.body.movies.length).toEqual(2);

        const movieOne = res.body.movies.find(
          (x) => x.movieId === movie1.movieId
        );
        expect(movieOne).toEqual({
          ...movie1,
          actors: [person1],
          genres: [genre],
        });

        const movieTwo = res.body.movies.find(
          (x) => x.movieId === movie2.movieId
        );
        expect(movieTwo).toEqual({
          ...movie2,
          actors: [person2],
          genres: [genre],
        });
      } finally {
        await session.close();
      }
    });

    test("should find movies and sort by imdbRating ASC", async () => {
      const session = driver.session();

      const titleOverlap = generate({
        charset: "alphabetic",
      });

      const movie1 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        imdbRating: 10.0,
        title: titleOverlap,
      };

      const movie2 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        imdbRating: 9.9,
        title: titleOverlap,
      };

      try {
        await session.run(
          `
          CREATE (m1:Movie $movie1)
          CREATE (m2:Movie $movie2)
        `,
          {
            movie1,
            movie2,
          }
        );

        const res = await request(app).get(
          `/movie?search=${titleOverlap.toLowerCase()}&sort=ASC`
        );

        expect(res.status).toEqual(200);
        expect(res.body.movies.length).toEqual(2);

        const movieOne = res.body.movies[1];
        expect(movieOne).toEqual({
          ...movie1,
          actors: [],
          genres: [],
        });

        const movieTwo = res.body.movies[0];
        expect(movieTwo).toEqual({
          ...movie2,
          actors: [],
          genres: [],
        });
      } finally {
        await session.close();
      }
    });

    test("should find movies and sort by year DESC", async () => {
      const session = driver.session();

      const titleOverlap = generate({
        charset: "alphabetic",
      });

      const movie1 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        imdbRating: 10.0,
        title: titleOverlap,
      };

      const movie2 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        imdbRating: 9.9,
        title: titleOverlap,
      };

      try {
        await session.run(
          `
          CREATE (m1:Movie $movie1)
          CREATE (m2:Movie $movie2)
        `,
          {
            movie1,
            movie2,
          }
        );

        const res = await request(app).get(
          `/movie?search=${titleOverlap.toLowerCase()}&sort=DESC`
        );

        expect(res.status).toEqual(200);
        expect(res.body.movies.length).toEqual(2);

        const movieOne = res.body.movies[0];
        expect(movieOne).toEqual({
          ...movie1,
          actors: [],
          genres: [],
        });

        const movieTwo = res.body.movies[1];
        expect(movieTwo).toEqual({
          ...movie2,
          actors: [],
          genres: [],
        });
      } finally {
        await session.close();
      }
    });
  });

  describe("update", () => {
    test("should return 404 when not found movie", async () => {
      const id = generate({
        charset: "alphabetic",
      });

      const res = await request(app).post(`/movie/${id}`);

      expect(res.status).toEqual(404);
    });

    test("should throw title should be a string", async () => {
      const session = driver.session();

      const movie = {
        movieId: generate({
          charset: "alphabetic",
        }),
        imdbRating: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
      };

      const newMovie = {
        imdbRating: generate({
          charset: "alphabetic",
        }),
        title: 123,
      };

      try {
        await session.run(
          `
            CREATE (:Movie $movie)
          `,
          {
            movie,
          }
        );

        const res = await request(app).put(`/movie/${movie.movieId}`).send({
          movie: newMovie,
        });

        expect(res.status).toEqual(500);
        expect(res.text).toEqual(
          "title @validate invalid type expected String"
        );
      } finally {
        await session.close();
      }
    });

    test("should throw imdbRating should be a number", async () => {
      const session = driver.session();

      const movie = {
        movieId: generate({
          charset: "alphabetic",
        }),
        imdbRating: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
      };

      const newMovie = {
        imdbRating: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
      };

      try {
        await session.run(
          `
            CREATE (:Movie $movie)
          `,
          {
            movie,
          }
        );

        const res = await request(app).put(`/movie/${movie.movieId}`).send({
          movie: newMovie,
        });

        expect(res.status).toEqual(500);
        expect(res.text).toEqual(
          "imdbRating @validate invalid type expected Number"
        );
      } finally {
        await session.close();
      }
    });

    test("should update and return movie", async () => {
      const session = driver.session();

      const movie = {
        movieId: generate({
          charset: "alphabetic",
        }),
        imdbRating: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
      };

      const newMovie = {
        imdbRating: Math.floor(Math.random() * 1000),
        title: generate({
          charset: "alphabetic",
        }),
      };

      try {
        await session.run(
          `
            CREATE (m:Movie $movie)
          `,
          {
            movie,
          }
        );

        const res = await request(app).put(`/movie/${movie.movieId}`).send({
          movie: newMovie,
        });

        expect(res.status).toEqual(200);
        expect(res.body.movies.length).toEqual(1);

        const movieOne = res.body.movies[0];
        expect(movieOne).toEqual({
          movieId: movie.movieId,
          ...newMovie,
        });
      } finally {
        await session.close();
      }
    });
  });

  describe("delete", () => {
    test("should return 404 when not found movie", async () => {
      const id = generate({
        charset: "alphabetic",
      });

      const res = await request(app).delete(`/movie/${id}`);

      expect(res.status).toEqual(404);
    });

    test("should find and delete a movie", async () => {
      const session = driver.session();

      const movie = {
        movieId: generate({
          charset: "alphabetic",
        }),
        imdbRating: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
      };

      try {
        await session.run(
          `
            CREATE (m:Movie $movie)
          `,
          {
            movie,
          }
        );

        const res = await request(app).delete(`/movie/${movie.movieId}`);
        expect(res.status).toEqual(200);

        const reFind = await session.run(
          `
            MATCH (m:Movie {movieId: $movieId})
            RETURN m
          `,
          {
            movieId: movie.movieId,
          }
        );
        expect(reFind.records.length).toEqual(0);
      } finally {
        await session.close();
      }
    });
  });
});
