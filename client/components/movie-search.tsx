"use client"; // Enables client-side rendering for this component

import { useState, ChangeEvent } from "react"; // Import useState and ChangeEvent from React
import { Input } from "@/components/ui/input"; // Import custom Input component
import { Button } from "@/components/ui/button"; // Import custom Button component
import {
  CalendarIcon,
  ClockIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"; // Import icons from lucide-react
import Image from "next/image"; // Import Next.js Image component
import { Spinner } from "@/components/ui/spinner";
import { capitalizeFirstLetter } from "@/lib/utils";
import { formatRuntime } from "../lib/utils";

// Define the MovieDetails type
type MovieDetails = {
  plot: string;
  genres: string[];
  runtime: number;
  cast: string[];
  poster: string;
  title: string;
  languages: string[];
  year: number;
  directors: string[];
  type: string;
  imdb: {
    rating: number;
    votes: number;
  };
};

export default function MovieSearch() {
  // State to manage the search term input by the user
  const [searchTerm, setSearchTerm] = useState<string>("");
  // State to manage the movie details retrieved from the API
  const [movieDetails, setMovieDetails] = useState<MovieDetails[] | null>(null);
  // State to manage the loading state during API fetch
  const [loading, setLoading] = useState<boolean>(true);
  // State to manage any error messages from the API
  const [error, setError] = useState<string | null>(null);

  // Function to handle the search button click
  const handleSearch = async (): Promise<void> => {
    setLoading(true); // Set loading to true while fetching data
    setError(null); // Reset error state
    setMovieDetails(null); // Reset movie details state

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/movies?search=${searchTerm}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.Response === "False") {
        throw new Error(data.Error);
      }
      setMovieDetails(data); // Set movie details state with the fetched data
    } catch (error: any) {
      setError(error.message); // Set error state with the error message
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  // Function to handle changes in the search input field
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value); // Update the search term state with input value
  };

  // JSX return statement rendering the Movie Search UI
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div
        className="w-full h-full p-6 bg-white rounded-lg shadow-md"
        id="movie-search"
      >
        {/* Title of the Movie Search component */}
        <h1 className="text-3xl font-bold mb-1 text-center">Movies</h1>
        <p className="mb-6 text-center">
          Search for movies and display details, using Embeddings Search
        </p>
        <div className="flex items-center mb-6">
          {/* Search input field */}
          <div className="flex flex-col items-center w-full">
            <Input
              type="text"
              placeholder="Enter your sentence here..."
              value={searchTerm}
              onChange={handleChange}
              className="w-2/3 mb-4 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Search button */}
            <Button
              onClick={handleSearch}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600"
            >
              Search
            </Button>
          </div>
        </div>
        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center items-center">
            <Spinner className="w-6 h-6 text-blue-500" />
          </div>
        )}
        {/* Error message */}
        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}. Please try searching for another movie.
          </div>
        )}
        {/* Movie details */}
        {movieDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {movieDetails.map((movie, index) => (
              <div
                key={index}
                className="flex flex-col items-center mb-8 bg-white p-4 rounded-lg shadow-md"
              >
                <div className="w-full mb-4">
                  {/* Movie poster image */}
                  <Image
                    src={movie.poster ? movie.poster : "/placeholder.jpg"}
                    alt={movie.title}
                    width={200}
                    height={300}
                    className="rounded-md shadow-md mx-auto"
                  />
                </div>
                <div className="w-full text-center">
                  <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
                  {/* Movie details section */}
                  <div className="flex flex-wrap justify-center items-center text-gray-500 mb-2 space-x-4">
                    <div className="flex items-center" title="Year">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>{movie.year}</span>
                    </div>
                    <div className="flex items-center" title="IMDB Reviews">
                      <StarIcon className="w-4 h-4 mr-1 fill-yellow-500" />
                      <span>{movie.imdb?.rating}</span>
                    </div>
                    <div className="flex items-center" title="IMDB Votes">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      <span>{movie.imdb?.votes}</span>
                    </div>
                    <div className="flex items-center" title="Runtime">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  </div>
                  <div className="flex justify-center items-center text-gray-500 mb-2">
                    <span className="mr-4">
                      <strong>Genre(s):</strong> {movie.genres.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-center items-center text-gray-500 mb-2">
                    <span className="mr-4">
                      <strong>Actors:</strong> {movie.cast.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-center items-center text-gray-500 mb-2">
                    <span className="mr-4">
                      <strong>Director(s):</strong> {movie.directors.join(", ")}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 italic">{movie.plot}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
