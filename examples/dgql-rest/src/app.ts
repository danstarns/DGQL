import express from "express";
import bodyParser from "body-parser";
import * as api from "./api";

const app = express();
app.use(bodyParser.json());

function handler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };
}

app.get("/movie", handler(api.movie.getMovie));
app.post("/movie", handler(api.movie.createMovie));
app.put("/movie/:id", handler(api.movie.updateMovie));
app.delete("/movie/:id", handler(api.movie.deleteMovie));

app.get("/person", handler(api.person.getPerson));
app.post("/person", handler(api.person.createPerson));
app.put("/person/:id", handler(api.person.updatePerson));
app.delete("/person/:id", handler(api.person.deletePerson));

app.get("/genre", handler(api.genre.getGenre));
app.post("/genre", handler(api.genre.createGenre));
app.put("/genre/:id", handler(api.genre.updateGenre));
app.delete("/genre/:id", handler(api.genre.deleteGenre));

export async function start() {
  const HTTP_PORT = process.env.HTTP_PORT
    ? Number(process.env.HTTP_PORT)
    : 4000;
  await app.listen(HTTP_PORT);
  console.log(`REST endpoint online http://localhost:${HTTP_PORT}`);
}

export default app;
