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
import { BASE_URL, KEY } from './config'
import { useEffect, useState } from 'react'

export default function App() {
	const [query, setQuery] = useState('')
	const [movies, setMovies] = useState([])
	const [watched, setWatched] = useState(function () {
		const storagedValue = localStorage.getItem('watchedMovies')
		return JSON.parse(storagedValue)
	})
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [selectedId, setSelectedId] = useState(null)

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

	useEffect(
		function () {
			localStorage.setItem('watchedMovies', JSON.stringify(watched))
		},
		[watched]
	)

	useEffect(
		function () {
			const controller = new AbortController()

			async function fetchMovies() {
				try {
					setIsLoading(true)
					setError('')

					const res = await fetch(`${BASE_URL}/?apikey=${KEY}&s=${query}`, {
						signal: controller.signal,
					})
					if (!res.ok)
						throw new Error('Something went wrong with fetching movies')

					const data = await res.json()
					if (data.Response === 'False') throw new Error('Movie not found')

					setMovies(data.Search)
					setError('')
				} catch (err) {
					if (err.name !== 'AbortError') {
						console.log(err.message)
						setError(err.message)
					}
				} finally {
					setIsLoading(false)
				}
			}

			if (query.length < 3) {
				setMovies([])
				setError('')
				return
			}

			handleCloseMovie()
			fetchMovies()

			return function () {
				controller.abort()
			}
		},
		[query]
	)

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
