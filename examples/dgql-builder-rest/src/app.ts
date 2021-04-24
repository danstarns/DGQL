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

export async function start() {
  const HTTP_PORT = process.env.HTTP_PORT
    ? Number(process.env.HTTP_PORT)
    : 4000;
  await app.listen(HTTP_PORT);
  console.log(`REST endpoint online http://localhost:${HTTP_PORT}`);
}

export default app;
