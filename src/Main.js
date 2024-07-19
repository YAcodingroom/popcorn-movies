import StarRating from './StarRating'
import { useEffect, useState } from 'react'
import { BASE_URL, KEY } from './config'

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0)

export default function Main({ children }) {
	return <main className="main">{children}</main>
}

export function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true)

	return (
		<div className="box">
			<button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
				{isOpen ? '–' : '+'}
			</button>
			{isOpen && children}
		</div>
	)
}

export function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie movie={movie} onSelectMovie={onSelectMovie} key={movie.imdbID} />
			))}
		</ul>
	)
}

function Movie({ movie, onSelectMovie }) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	)
}

export function MovieDetails({
	selectedId,
	watched,
	onCloseMovie,
	onAddWatched,
}) {
	const [movie, setMovie] = useState({})
	const [isLoading, setIsLoading] = useState(false)
	const [userRating, setUserRating] = useState('')

	const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId)
	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedId,
			year,
			title,
			poster,
			runtime: Number(runtime.split(' ').at(0)),
			imdbRating: Number(imdbRating),
			userRating,
		}
		onAddWatched(newWatchedMovie)
		onCloseMovie()
	}

	useEffect(
		function () {
			const callback = function (e) {
				if (e.code === 'Escape') {
					onCloseMovie()
				}
			}

			document.addEventListener('keydown', callback)

			return function () {
				document.removeEventListener('keydown', callback)
			}
		},
		[onCloseMovie]
	)

	useEffect(
		function () {
			async function getMovieDetails() {
				try {
					setIsLoading(true)

					const res = await fetch(`${BASE_URL}/?apikey=${KEY}&i=${selectedId}`)
					if (!res.ok)
						throw new Error('Something went wrong with fetching movies')

					const data = await res.json()
					if (data.Response === 'False') throw new Error('Movie not found')

					setMovie(data)
					setIsLoading(false)
				} catch (err) {
					console.error(err.message)
				}
			}
			getMovieDetails()
		},
		[selectedId]
	)

	useEffect(
		function () {
			if (!title) return

			document.title = `Movie | ${title}`

			return function () {
				document.title = 'usePopcorn'
			}
		},
		[title]
	)

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${movie} movie`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐️</span>
								{imdbRating} IMDb Rating
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating
										maxRating={10}
										size={24}
										onSetRating={setUserRating}
									/>
									{userRating > 0 && (
										<button className="btn-add" onClick={handleAdd}>
											+ Add to list
										</button>
									)}
								</>
							) : (
								<p>
									You rated with this movie : <span>⭐️ </span>
									{watchedUserRating}
								</p>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	)
}

export function WatchedSummary({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating))
	const avgUserRating = average(watched.map((movie) => movie.userRating))
	const avgRuntime = average(watched.map((movie) => movie.runtime))

	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating.toFixed(2)}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating.toFixed(2)}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime.toFixed(0)} min</span>
				</p>
			</div>
		</div>
	)
}

export function WatchedMoviesList({ watched, onDeleteWatched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie
					movie={movie}
					onDeleteWatched={onDeleteWatched}
					key={movie.imdbID}
				/>
			))}
		</ul>
	)
}

function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>

				<button
					className="btn-delete"
					onClick={() => onDeleteWatched(movie.imdbID)}
				>
					X
				</button>
			</div>
		</li>
	)
}

export function Loader() {
	return <p className="loader">Loading...</p>
}

export function ErrorMessage({ message }) {
	return (
		<p className="error">
			<span>⛔️</span> {message}
		</p>
	)
}
