export interface OMDbSearch {
    Search: Array<SingleMovieRecord>
    totalResults: string
    Response: "True" | "False"
    Error?: string
}

export interface SingleMovieRecord{
    Title: string,
    Year: string,
    imdbID: string,
    Type: string,
    Poster: string
}

interface Rating {
    Source: string;
    Value: string;
}

export interface MovieDetails {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: Rating[];
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: string;
}

export interface GptSuggestedMovie extends MovieDetails{
    brief_reason: string
}

export interface RecommendPostReq{
    user_input: string,
    movie: MovieDetails
}

export interface GptRecommendResponse{
    suggestions: Array<GptSuggestion>
}

interface GptSuggestion{
    movie: string,
    'brief reason': string,
    genre: string,
    year: number
}

export interface BackendErr{
    err: string
}

export interface NewUser{
    email: string
    password: string
    name: string
}

export interface SaveMovieReq{
    email?: string
    name: string
    movie: GptSuggestedMovie
}