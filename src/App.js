import Navbar from './Navbar'
import { Logo, Search, NumResults } from './Navbar'
import Main from './Main'
import {
	Box,
	MovieList,
	WatchedSummary,
	WatchedMoviesList,
	Loader,
	ErrorMessage,
	MovieDetails,
} from './Main'
import { useState } from 'react'
import { useMovies } from './useMovies'
import { useLocalStorageState } from './useLocalStorageState'

export default function App() {
	const [query, setQuery] = useState('')
	const [selectedId, setSelectedId] = useState(null)
	const { movies, isLoading, error } = useMovies(query)
	const [watched, setWatched] = useLocalStorageState([], 'watchedMovies')

	function handleSelectMovie(id) {
		setSelectedId((selectedId) => (selectedId === id ? null : id))
	}

	function handleCloseMovie() {
		setSelectedId(null)
	}

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie])
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id))
	}

	return (
		<>
			<Navbar>
				<Logo />
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</Navbar>

			<Main>
				<Box>
					{isLoading && <Loader />}
					{!isLoading && !error && (
						<MovieList movies={movies} onSelectMovie={handleSelectMovie} />
					)}
					{error && <ErrorMessage message={error} />}
				</Box>

				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							watched={watched}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	)
}
