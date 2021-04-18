import request from "supertest";
import app from "../../src/app";
import { generate } from "randomstring";
import { driver } from "../neo4j";

describe("person", () => {
  describe("create", () => {
    test("should throw name should be required", async () => {
      const payload = {
        person: {
          born: generate({
            charset: "numeric",
          }),
        },
      };

      const res = await request(app).post("/person").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual("name @validate required");
    });

    test("should throw name should be a string", async () => {
      const payload = {
        person: {
          name: Math.floor(Math.random() * 1000),
          born: generate({
            charset: "numeric",
          }),
        },
      };

      const res = await request(app).post("/person").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual("name @validate invalid type expected String");
    });

    test("should throw born should be required", async () => {
      const payload = {
        person: {
          name: generate({
            charset: "alphabetic",
          }),
        },
      };

      const res = await request(app).post("/person").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual("born @validate required");
    });

    test("should throw born should be a number", async () => {
      const payload = {
        person: {
          name: generate({
            charset: "alphabetic",
          }),
          born: generate({
            charset: "alphabetic",
          }),
        },
      };

      const res = await request(app).post("/person").send(payload);

      expect(res.status).toEqual(500);
      expect(res.text).toEqual("born @validate invalid type expected Number");
    });

    test("should create a new person", async () => {
      const payload = {
        person: {
          name: generate({
            charset: "alphabetic",
          }),
          born: Math.floor(Math.random() * 1000),
        },
      };

      const res = await request(app).post("/person").send(payload);

      expect(res.status).toEqual(201);
      expect(res.body).toHaveProperty("person");
      expect(res.body.person.personId).toBeTruthy();
    });
  });

  describe("read", () => {
    test("should find persons with regex", async () => {
      const session = driver.session();

      const nameOverlap = generate({
        charset: "alphabetic",
      });

      const movie1 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
        imdbRating: 8.7,
      };

      const movie2 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
        imdbRating: 8.7,
      };

      const person1 = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: nameOverlap,
        born: 2021,
      };

      const person2 = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: nameOverlap,
        born: 2021,
      };

      try {
        await session.run(
          `
            CREATE (m1:Movie $movie1)
            CREATE (m2:Movie $movie2)
            CREATE (p1:Person $person1)
            CREATE (p2:Person $person2)
            MERGE (m1)<-[:ACTED_IN]-(p1)
            MERGE (m2)<-[:ACTED_IN]-(p2)
          `,
          {
            movie1,
            movie2,
            person1,
            person2,
          }
        );

        const res = await request(app).get(
          `/person?search=${nameOverlap.toLowerCase()}`
        );

        expect(res.status).toEqual(200);
        expect(res.body.persons.length).toEqual(2);

        const personOne = res.body.persons.find(
          (x) => x.personId === person1.personId
        );
        expect(personOne).toEqual({
          ...person1,
          movies: [movie1],
        });

        const personTwo = res.body.persons.find(
          (x) => x.personId === person2.personId
        );
        expect(personTwo).toEqual({
          ...person2,
          movies: [movie2],
        });
      } finally {
        await session.close();
      }
    });

    test("should find persons and sort by born ASC", async () => {
      const session = driver.session();

      const nameOverlap = generate({
        charset: "alphabetic",
      });

      const movie1 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
        imdbRating: 8.7,
      };

      const movie2 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
        imdbRating: 8.7,
      };

      const person1 = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: nameOverlap,
        born: 2021,
      };

      const person2 = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: nameOverlap,
        born: 2020,
      };

      try {
        await session.run(
          `
            CREATE (m1:Movie $movie1)
            CREATE (m2:Movie $movie2)
            CREATE (p1:Person $person1)
            CREATE (p2:Person $person2)
            MERGE (m1)<-[:ACTED_IN]-(p1)
            MERGE (m2)<-[:ACTED_IN]-(p2)
          `,
          {
            movie1,
            movie2,
            person1,
            person2,
          }
        );

        const res = await request(app).get(
          `/person?search=${nameOverlap.toLowerCase()}&sort=ASC`
        );

        expect(res.status).toEqual(200);
        expect(res.body.persons.length).toEqual(2);

        const personOne = res.body.persons[1];
        expect(personOne).toEqual({
          ...person1,
          movies: [movie1],
        });

        const personTwo = res.body.persons[0];
        expect(personTwo).toEqual({
          ...person2,
          movies: [movie2],
        });
      } finally {
        await session.close();
      }
    });

    test("should find persons and sort by born DESC", async () => {
      const session = driver.session();

      const nameOverlap = generate({
        charset: "alphabetic",
      });

      const movie1 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
        imdbRating: 8.7,
      };

      const movie2 = {
        movieId: generate({
          charset: "alphabetic",
        }),
        title: generate({
          charset: "alphabetic",
        }),
        imdbRating: 8.7,
      };

      const person1 = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: nameOverlap,
        born: 2021,
      };

      const person2 = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: nameOverlap,
        born: 2020,
      };

      try {
        await session.run(
          `
            CREATE (m1:Movie $movie1)
            CREATE (m2:Movie $movie2)
            CREATE (p1:Person $person1)
            CREATE (p2:Person $person2)
            MERGE (m1)<-[:ACTED_IN]-(p1)
            MERGE (m2)<-[:ACTED_IN]-(p2)
          `,
          {
            movie1,
            movie2,
            person1,
            person2,
          }
        );

        const res = await request(app).get(
          `/person?search=${nameOverlap.toLowerCase()}&sort=DESC`
        );

        expect(res.status).toEqual(200);
        expect(res.body.persons.length).toEqual(2);

        const personOne = res.body.persons[0];
        expect(personOne).toEqual({
          ...person1,
          movies: [movie1],
        });

        const personTwo = res.body.persons[1];
        expect(personTwo).toEqual({
          ...person2,
          movies: [movie2],
        });
      } finally {
        await session.close();
      }
    });
  });

  describe("update", () => {
    test("should return 404 when not found person", async () => {
      const id = generate({
        charset: "alphabetic",
      });

      const res = await request(app).post(`/person/${id}`);

      expect(res.status).toEqual(404);
    });

    test("should throw name should be a string", async () => {
      const session = driver.session();

      const person = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: generate({
          charset: "alphabetic",
        }),
        born: generate({
          charset: "numeric",
        }),
      };

      const newPerson = {
        name: 123,
      };

      try {
        await session.run(
          `
            CREATE (:Person $person)
          `,
          {
            person,
          }
        );

        const res = await request(app).put(`/person/${person.personId}`).send({
          person: newPerson,
        });

        expect(res.status).toEqual(500);
        expect(res.text).toEqual("name @validate invalid type expected String");
      } finally {
        await session.close();
      }
    });

    test("should throw born should be a number", async () => {
      const session = driver.session();

      const person = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: generate({
          charset: "alphabetic",
        }),
        born: generate({
          charset: "numeric",
        }),
      };

      const newPerson = {
        born: generate({
          charset: "numeric",
        }),
      };

      try {
        await session.run(
          `
            CREATE (:Person $person)
          `,
          {
            person,
          }
        );

        const res = await request(app).put(`/person/${person.personId}`).send({
          person: newPerson,
        });

        expect(res.status).toEqual(500);
        expect(res.text).toEqual("born @validate invalid type expected Number");
      } finally {
        await session.close();
      }
    });

    test("should update and return person", async () => {
      const session = driver.session();

      const person = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: generate({
          charset: "alphabetic",
        }),
        born: Math.floor(Math.random() * 1000),
      };

      const newPerson = {
        name: generate({
          charset: "alphabetic",
        }),
        born: Math.floor(Math.random() * 1000),
      };

      try {
        await session.run(
          `
            CREATE (:Person $person)
          `,
          {
            person,
          }
        );

        const res = await request(app).put(`/person/${person.personId}`).send({
          person: newPerson,
        });

        expect(res.status).toEqual(200);
        expect(res.body.persons.length).toEqual(1);

        const personOne = res.body.persons[0];
        expect(personOne).toEqual({
          personId: person.personId,
          ...newPerson,
        });
      } finally {
        await session.close();
      }
    });
  });

  describe("delete", () => {
    test("should return 404 when not found person", async () => {
      const id = generate({
        charset: "alphabetic",
      });

      const res = await request(app).delete(`/person/${id}`);

      expect(res.status).toEqual(404);
    });

    test("should find and delete a person", async () => {
      const session = driver.session();

      const person = {
        personId: generate({
          charset: "alphabetic",
        }),
        name: generate({
          charset: "alphabetic",
        }),
        born: generate({
          charset: "numeric",
        }),
      };

      try {
        await session.run(
          `
            CREATE (:Person $person)
          `,
          {
            person,
          }
        );

        const res = await request(app).delete(`/person/${person.personId}`);
        expect(res.status).toEqual(200);

        const reFind = await session.run(
          `
            MATCH (p:Person {personId: $personId})
            RETURN p
          `,
          {
            personId: person.personId,
          }
        );
        expect(reFind.records.length).toEqual(0);
      } finally {
        await session.close();
      }
    });
  });
});
