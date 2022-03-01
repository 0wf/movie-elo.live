import "./App.css";
import Axios from "axios";
import { useState, useEffect } from "react";

import { IoMdSend } from "react-icons/io";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router className="dark:bg-neutral-900 h-screen App">
      <div className="dark:bg-neutral-900 bg-gray-100 dark:text-neutral-200 h-screen">
        <h1 className="text-center  font-mont text-5xl md:text-6xl lg:text-7xl mb-1 mt-4 lg:mt-6">
          Movie Elo
        </h1>
        <div className="flex flex-ro md:justify-center md:gap-24 mt-4 ">
          <Link
            to="/addmovies"
            className="font-li text-xl font-light md:mx-0 mx-auto shadow:md hover:underline underline-offset-2"
          >
            add movie
          </Link>
          <Link
            to="/"
            className="font-li text-xl font-light md:mx-0 mx-auto shadow:md hover:underline underline-offset-2"
          >
            rank
          </Link>
          <Link
            to="/Leaderboards"
            className="font-li text-xl font-light md:mx-0 mx-auto shadow:md hover:underline underline-offset-2"
          >
            leaderboards
          </Link>
        </div>
        <Routes>
          <Route path="/" element={<Rank />} />
          <Route path="/addmovies" element={<AddMovies />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
        </Routes>
      </div>
    </Router>
  );
}

function Rank() {
  let [movieOne, setMovieOne] = useState("");
  let [movieTwo, setMovieTwo] = useState("");
  const [url, setUrl] = useState("");

  const win = (num) => {
    console.log("clicked");
    fetch("http://localhost:3001/win", {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieOneId: movieOne.movieId,
        movieTwoId: movieTwo.movieId,
        num: num,
      }),
    });
    mash();
  };

  function mash() {
    Axios.get("http://localhost:3001/mash")
      .then((response) => {
        console.log(response);
        const myData = response.data;
        const movies = myData;
        console.log("pog");
        setUrl(myData);
        setMovieOne(movies[0]);
        setMovieTwo(movies[1]);
        console.log(movies[0].url);
        console.log(movies[1].url);
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    mash();
  }, []);

  return (
    <div className="mt-4 xl:mt-8">
      <h2 className="text-3xl text-center font-medium font-li">
        which movie is better?
      </h2>
      <div className="mt-6 gap-12 flex flex-row justify-center">
        <img
          className="w-2/5 md:w-1/5 hover:brightness-50 cursor-pointer"
          src={movieOne.url}
          alt=""
          onClick={() => {
            win(1);
          }}
        ></img>
        <img
          className="w-2/5 md:w-1/5 hover:brightness-50 cursor-pointer"
          src={movieTwo.url}
          alt=""
          onClick={() => {
            win(2);
          }}
        ></img>
      </div>
      <div className="w-screen flex flex-row justify-center">
        <button
          className="
      font-mont font-bolds text-white m-6 mt-5 border-2 border-black p-2 bg-black rounded-md shadow-sm
      hover:bg-white hover:text-black
      "
          onClick={() => {
            win(0);
          }}
        >
          i don't know
        </button>
      </div>
    </div>
  );
}

function Leaderboards() {
  const [movieList, setMovieList] = useState([]);

  const getMovieList = () => {
    Axios.get("http://localhost:3001/get").then((response) => {
      console.log(response);
      const myData = response.data;
      setMovieList(myData);
    });
  };

  useEffect(() => getMovieList(), []);

  let rank = 0;

  return (
    <div className="flex flex-row justify-center mt-4 md:mt-8">
      <table className="mx-auto font-li table-style  font-semibold font-serif">
        <tr className="bg-gray-100 dark:bg-neutral-900">
          <th></th>
          <th className="text-left">Rank and Title</th>
          <th className=" px-4 text-center">Rating</th>
        </tr>
        {movieList.map((val) => {
          return (
            <tr>
              <td>
                <img width="90" src={val.url} atl=""></img>
              </td>
              <td>
                {(rank = rank + 1)}. {val.movieName}
              </td>
              <td className=" text-center">{val.elo}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
}

function AddMovies() {
  let [movies, setMovies] = useState([]);

  const [showSearch, setShowSearch] = useState(false);

  const [inputValue, setInputValue] = useState("");

  function reveal(event) {
    event.preventDefault();
    search();
  }

  function search() {
    Axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=178dbc8b84b0df82c1e0fca28f4fea91&language=en-US&query=${inputValue}&page=1&include_adult=false`
    )
      .then((response) => {
        console.log(response);
        const myData = response.data;
        movies = myData;
        setMovies(myData);
        console.log(movies.results[0].title);
      })
      .then(() => {
        setShowSearch(true);
      });
  }

  function Results() {
    const submitMovie = (id) => {
      console.log("clicked");
      fetch("http://localhost:3001/insert", {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId: id }),
      });
      setShowSearch(false);
      setInputValue("");
    };

    return (
      <div className="mt-3">
        <div
          className="grid gap-x-2
      lg:grid-cols-8 md:grid-cols-6 xs:grid-cols-2 grid-cols-2
      grid-flow-row px-2 text-sm"
        >
          {movies.results.map((movie) => {
            if (movie.poster_path && movie.popularity > 5)
              return (
                <div className="font-link my-4 w-full">
                  <img
                    className="w-full 
                  rounded-xl
                  hover:brightness-50 hover:cursor-pointer"
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt=""
                    onClick={() => {
                      submitMovie(movie.id);
                    }}
                  ></img>
                  <h3 className="text-left pl-1 font-li font-extrabold">
                    {movie.title}
                  </h3>
                  <h2 className="font-li font-extrabold text-left pl-1">
                    {movie.release_date
                      ? movie.release_date.substring(0, 4)
                      : null}
                  </h2>
                </div>
              );
          })}
        </div>
      </div>
    );
  }

  const SendIcon = ({ icon }) => {
    return <div>{icon}</div>;
  };

  return (
    <div className="mt-6">
      <form onSubmit={reveal} className="flex justify-center">
        <input
          type="text"
          value={inputValue}
          className="font-li shadow-lg pl-2 rounded-lg border-2 dark:bg-neutral-800 border-stone-700 dark:border-neutral-800"
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <button
          type="submit"
          className="font-link ml-1 text-stone-700 dark:text-neutral-200"
        >
          <SendIcon icon={<IoMdSend size="28" />} />
        </button>
      </form>
      {showSearch ? <Results /> : null}
    </div>
  );
}

export default App;
