const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const axios = require("axios").default;

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

const db = mysql.createConnection({
  socketPath: "/tmp/mysql.sock",
  user: "server",
  password: PASSWORD,
  database: "MovieElo",
});

app.get("/get", (req, res) => {
  const sqlSelect = "SELECT * FROM movies ORDER BY elo DESC";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.get("/mash", (req, res) => {
  console.log("mash");
  const sqlMash = "SELECT * FROM movies ORDER BY RAND() LIMIT 2";
  db.query(sqlMash, (err, result) => {
    if (err) console.log(err);
    res.json(result);
  });
});

app.post("/insert", (req, res) => {
  const movieId = req.body.movieId;
  axios
    .get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${KEY}&language=en-US`
    )
    .then((response) => {
      const movie = response.data;
      if (movie.adult === false && movie.popularity > 5) {
        const sqlInsert =
          "INSERT INTO movies (movieName, year, elo, url, movieId) VALUES (?, ?, ?, ?, ?)";
        db.query(
          sqlInsert,
          [
            movie.title,
            movie.release_date.substring(0, 4),
            1000,
            `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            movie.id,
          ],
          (err, result) => {
            if (err) console.log(err);
          }
        );
      }
    });
});

app.post("/win", (req, res) => {
  const num = req.body.num;
  const movieOneId = req.body.movieOneId;
  const movieTwoId = req.body.movieTwoId;

  if (num === 1 || num === 2) {
    const sqlUpdate = "UPDATE movies SET elo = ? WHERE movieId = ?";

    const sqlGetElo = "SELECT elo, movieId FROM movies WHERE movieId IN (?,?)";
    db.query(sqlGetElo, [movieOneId, movieTwoId], (err, result) => {
      let eloOne;
      let eloTwo;
      movieOneId === result[0].movieId
        ? (eloOne = result[0].elo)
        : (eloOne = result[1].elo);
      movieTwoId === result[1].movieId
        ? (eloTwo = result[1].elo)
        : (eloTwo = result[0].elo);

      const calcNewElo = (eloOne, eloTwo, score) => {
        const expectedScore = 1 / (1 + Math.pow(10, (eloTwo - eloOne) / 400));
        return eloOne + 14 * (score - expectedScore);
      };

      const newEloOne = calcNewElo(eloOne, eloTwo, 2 - num);

      const newEloTwo = calcNewElo(eloTwo, eloOne, num - 1);

      sqlUpdateElo = "UPDATE movies SET elo = ? WHERE movieId = ?";
      db.query(sqlUpdateElo, [newEloOne, movieOneId], (err, result) => {
        if (err) console.log(err);
      });
      db.query(sqlUpdateElo, [newEloTwo, movieTwoId], (err, result) => {
        if (err) console.log(err);
      });
    });
  }
  res.sendStatus(200);
});

app.listen(3001, () => {
  console.log("running on port 3001");
});
