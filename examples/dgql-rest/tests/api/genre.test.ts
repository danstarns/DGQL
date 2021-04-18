import request from "supertest";
import app from "../../src/app";
import { generate } from "randomstring";
import { driver } from "../neo4j";

describe("genre", () => {
  describe("create", () => {
    test("should throw if genre already exists", async () => {
      const session = driver.session();

      const payload = {
        genre: {
          name: generate({
            charset: "alphabetic",
          }),
        },
      };

      try {
        await session.run(`
            CREATE (:Genre {name: "${payload.genre.name}"})
        `);

        const res = await request(app).post("/genre").send(payload);

        expect(res.status).toEqual(500);
        expect(res.text).toEqual(`Genre ${payload.genre.name} already exists`);
      } finally {
        await session.close();
      }
    });

    test("should throw name should be required", async () => {
      const payload = {
        genre: {},
      };

      const res = await request(app).post("/genre").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual("name @validate required");
    });

    test("should throw name should be a string", async () => {
      const payload = {
        genre: {
          name: 123,
        },
      };

      const res = await request(app).post("/genre").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual("name @validate invalid type expected String");
    });

    test("should create a new genre", async () => {
      const payload = {
        genre: {
          name: generate({
            charset: "alphabetic",
          }),
        },
      };

      const res = await request(app).post("/genre").send(payload);

      expect(res.status).toEqual(201);
      expect(res.body).toHaveProperty("genre");
      expect(res.body.genre.genreId).toBeTruthy();
    });
  });

  describe("read", () => {
    test("should find genres with regex", async () => {
      const session = driver.session();

      const nameOverLap = generate({
        charset: "alphabetic",
      });

      const genre1 = {
        genreId: generate({
          charset: "alphabetic",
        }),
        name: nameOverLap,
      };

      const genre2 = {
        genreId: generate({
          charset: "alphabetic",
        }),
        name: nameOverLap,
      };

      try {
        await session.run(
          `
          CREATE (g1:Genre $genre1)
          CREATE (g2:Genre $genre2)
        `,
          {
            genre1,
            genre2,
          }
        );

        const res = await request(app).get(
          `/genre?search=${nameOverLap.toLowerCase()}`
        );

        expect(res.status).toEqual(200);
        expect(res.body.genres.length).toEqual(2);

        const genreOne = res.body.genres.find(
          (x) => x.genreId === genre1.genreId
        );
        expect(genreOne).toMatchObject(genre1);

        const movieTwo = res.body.genres.find(
          (x) => x.genreId === genre2.genreId
        );
        expect(movieTwo).toMatchObject(genre2);
      } finally {
        await session.close();
      }
    });
  });

  describe("update", () => {
    test("should throw Genre not found", async () => {
      const id = generate({
        charset: "alphabetic",
      });

      const res = await request(app).put(`/genre/${id}`);

      expect(res.status).toEqual(404);
    });

    test("should throw name should be required", async () => {
      const session = driver.session();

      const payload = {
        genre: {},
      };

      const id = generate({
        charset: "alphabetic",
      });

      const name = generate({
        charset: "alphabetic",
      });

      try {
        await session.run(
          `
            CREATE (:Genre {genreId: $id, name: $name})
          `,
          { id, name }
        );

        const res = await request(app).put(`/genre/${id}`).send(payload);

        expect(res.status).toEqual(500);
        expect(res.text).toEqual("name @validate required");
      } finally {
        await session.close();
      }
    });

    test("should throw name should be a string", async () => {
      const session = driver.session();

      const payload = {
        genre: {
          name: Math.floor(Math.random() * 10000),
        },
      };

      const id = generate({
        charset: "alphabetic",
      });

      try {
        await session.run(
          `
            CREATE (:Genre {genreId: $id, name: "some name"})
          `,
          { id }
        );

        const res = await request(app).put(`/genre/${id}`).send(payload);

        expect(res.status).toEqual(500);
        expect(res.text).toEqual("name @validate invalid type expected String");
      } finally {
        await session.close();
      }
    });

    test("should throw Genre with name already exists", async () => {
      const session = driver.session();

      const name1 = generate({
        charset: "alphabetic",
      });
      const name2 = generate({
        charset: "alphabetic",
      });
      const id = generate({
        charset: "alphabetic",
      });

      try {
        await session.run(`
            CREATE (:Genre {name: "${name2}"})
            CREATE (:Genre {genreId: "${id}", name: "${name1}"})
        `);

        const res = await request(app)
          .put(`/genre/${id}`)
          .send({
            genre: {
              name: name2,
            },
          });

        expect(res.status).toEqual(500);
        expect(res.text).toEqual(`Genre ${name2} already exists`);
      } finally {
        await session.close();
      }

      const res = await request(app).post(`/genre/${id}`);

      expect(res.status).toEqual(404);
    });

    test("should find and update genre name", async () => {
      const session = driver.session();

      const genre = {
        genreId: generate({
          charset: "alphabetic",
        }),
        name: generate({
          charset: "alphabetic",
        }),
      };

      const newGenre = {
        name: generate({
          charset: "alphabetic",
        }),
      };

      try {
        await session.run(
          `
              CREATE (m:Genre $genre)
            `,
          {
            genre,
          }
        );

        const res = await request(app).put(`/genre/${genre.genreId}`).send({
          genre: newGenre,
        });

        expect(res.status).toEqual(200);
        expect(res.body.genres.length).toEqual(1);

        const genreOne = res.body.genres[0];
        expect(genreOne).toEqual({
          genreId: genre.genreId,
          ...newGenre,
        });
      } finally {
        await session.close();
      }
    });
  });

  describe("delete", () => {
    test("should return 404 when not found genre", async () => {
      const id = generate({
        charset: "alphabetic",
      });

      const res = await request(app).delete(`/genre/${id}`);

      expect(res.status).toEqual(404);
    });

    test("should find and delete a genre", async () => {
      const session = driver.session();

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
            CREATE (:Genre $genre)
          `,
          {
            genre,
          }
        );

        const res = await request(app).delete(`/genre/${genre.genreId}`);
        expect(res.status).toEqual(200);

        const reFind = await session.run(
          `
            MATCH (g:Genre {genreId: $genreId})
            RETURN g
          `,
          {
            genreId: genre.genreId,
          }
        );
        expect(reFind.records.length).toEqual(0);
      } finally {
        await session.close();
      }
    });
  });
});
