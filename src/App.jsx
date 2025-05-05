// import React from 'react';
// import { useState, useEffect } from 'react';


// const Card = ({title}) => {
//   const [count, setCount] = useState(0); 
//   const [hasLiked, setHasLiked] = useState(false);

//    useEffect(() => {
//     console.log(`${title} has been liked: ${hasLiked}`) ;
//    }, [title, hasLiked]);
   
 
//   return (
//     <div className="card" onClick={() => setCount((prevState)=> prevState + 1)}>
//       <h2>{title} <br />{count ? count : null} </h2>



//       <button onClick={() => setHasLiked(!hasLiked)}>
//         {hasLiked ? '💙' : '💚'}
//       </button>
//     </div>
//   )
// }

// const App = () => {
//   return (
//     <div className='card-container'> 
//       {/* <h2>Functional Arrow Components</h2> */}

//       <Card  title = 'GOT'/>
//       <Card  title = 'Power' />
//       <Card  title = 'KOB'/> 
//     </div>
//   )
// }

// export default App
import React, { useEffect, useState } from 'react';
import Search from './component/search.jsx';
import Spinner from './component/Spinner.jsx';
import Movie_card from './component/Movie_card.jsx';
import {useDebounce} from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {  
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}


const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState ([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);


  // Debounce the search term to prevent making too many API requests
  useDebounce(()=> {setDebouncedSearchTerm(searchTerm); 
 }, 500,[searchTerm]);




  const fetchMovies =  async (query = '') => {
    setIsLoading (true);
    setErrorMessage('');
    try {
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('failed to fetch movies');
      }
      const data = await response.json();
      if (data.Response === 'False'){
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error (`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);

    } catch (error) {
      console.error(`Error  fecthing trending movies: ${error}`);
    }
  }


  useEffect (() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);


  useEffect (() =>{
    loadTrendingMovies();
  }, []);


   return (
    <main>
      <div className='pattern' />

      <div className='wrapper'>
        <header>
          <img src="./hero-img.png" alt='hero Banner'  />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy wihtout the Hassle</h1>
          <Search  searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
             <h2>
              Trending Movies
             </h2>
             <ul>
               {trendingMovies.map((movie, index) =>(
                <li key={movie.$id}>
                   <p>{index + 1}</p>
                   <img src={movie.poster_url} alt= {movie.title} />
                </li>
               ))}
             </ul>
          </section>
        )}
        <section className='all-movies'>
          <h2> All movies </h2>

          {isLoading ? (
            <Spinner /> 
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (

                <Movie_card key= {movie.id} movie={movie}/>
                // <p key= {movie.id} className="text-white">{movie.title}</p>
              ))}
            </ul>
          )
        }

          
 
        </section>
 
      </div>


    </main>
    // <div>
    //   <h1 class="text-3xl font-bold underline text-red-500">
    //     Hello world!
    //   </h1>

    // </div>
  )
}

export  default App
