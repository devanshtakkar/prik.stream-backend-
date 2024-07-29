import express from "express";
import cors from "cors";
import "dotenv/config";
import {
    OMDbSearch,
    MovieDetails,
    SingleMovieRecord,
    BackendErr,
    RecommendPostReq,
    GptRecommendResponse,
    GptSuggestedMovie,
} from "./Types";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { app as userRouter } from "./routes/user";

export const prisma = new PrismaClient();

type EnvVar = typeof process.env;
interface EnvironmentVariables extends EnvVar {
    OMDB_KEY: string;
    OPENAI: string;
}
const omdbUrl = "http://www.omdbapi.com";
let envVariables = process.env as EnvironmentVariables;

const openai = new OpenAI({
    apiKey: envVariables.OPENAI,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", userRouter);

interface SearchParams {
    movie?: string;
    page?: string;
}
app.get("/search", async (req, res) => {
    let queryParams: SearchParams = req.query;
    if (!queryParams.movie) {
        res.status(401).json({ err: "No movie name is provided" });
        return;
    }
    const params: {
        s: string;
        apikey: string;
        type: string;
        page?: string;
    } = {
        s: queryParams.movie,
        apikey: envVariables.OMDB_Key as string,
        type: "movie",
    };

    if (queryParams.page) {
        params.page = queryParams.page;
    }
    const urlParams = new URLSearchParams(params);
    const urlWithParams = `${omdbUrl}?${urlParams.toString()}`;

    try {
        let response = await fetch(urlWithParams);
        if (response.ok) {
            let body: OMDbSearch = await response.json();
            //get the movie abstract from the omdb as well
            if (body.Response == "False") {
                res.send(body);
            } else {
                let imdbIDs = body.Search.map((movie) => movie.imdbID);
                let urlsToSearch = imdbIDs.map((id) => {
                    // id = id.slice(2);
                    return `${omdbUrl}?i=${id}&apikey=${envVariables.OMDB_KEY}`;
                });
                const fetchPromises = urlsToSearch.map((url) => fetch(url));
                const responses = await Promise.all(fetchPromises);
                const dataPromises = responses.map((response) =>
                    response.json()
                );
                const data = await Promise.all(dataPromises);

                let finalResult = {
                    Response: "True",
                    totalResults: body.totalResults,
                    Search: data,
                };
                res.send(finalResult);
            }
        }
    } catch {
        res.status(500).json({ err: "unable to reach OMDb API." });
    }
});

app.post("/recommend", async (req, res) => {
    let body: RecommendPostReq | undefined = req.body;
    if (!body) {
        res.status(401).json({ err: "No request body provided." });
        return;
    }
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        'You are an AI assistant who who will help the users find the movies based on the reference movie they provide and what part of the movie they like, it could be anything ranging from similar theme, characters and their objective, plot, tone, pace, atmosphere, animation, symbolism, protagonist or antagonist. And provide the output in JSON format. The name of the json property which has the movie array must be nammed "suggestions" It will contain properties such as "movie", "brief reason", "genre" and "year". The reasoning for chosing that particular movie can be around 100 words long. Moreover, if the user input is irrelevant like you are unable to relate to how it is relevent for the suggestion or clearly gibrish return a JSON object that contains a property "err" saying something along the lines that use input is invalid. keep the suggested movies count limited to 4',
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Movie is ${body.movie.Title} released in ${body.movie.Year} directed by ${body.movie.Director}`,
                        },
                        {
                            type: "text",
                            text: `User asks: ${body.user_input}`,
                        },
                    ],
                },
            ],
            model: "gpt-4o-mini",
            response_format: {
                type: "json_object",
            },
        });

        let result = completion.choices[0].message.content;
        if (result) {
            let parsedResult: GptRecommendResponse | BackendErr =
                JSON.parse(result);
            if ("err" in parsedResult) {
                console.log(parsedResult);
                res.status(401).json(parsedResult);
                return;
            }

            //search OMDb for the given movie titles

            console.log(parsedResult);
            const fetchPromises = parsedResult.suggestions.map((suggestion) => {
                // console.log(suggestion.movie)
                let params = new URLSearchParams({
                    t: suggestion.movie,
                    y: `${suggestion.year}`,
                    apikey: envVariables.OMDB_KEY,
                });
                const urlWithParams = `${omdbUrl}?${params.toString()}`;
                return fetch(urlWithParams);
            });
            const responses = await Promise.all(fetchPromises);
            const dataPromises = responses.map((response) => response.json());
            const data: Array<MovieDetails> = await Promise.all(dataPromises);

            let finalResults = data.map((movie) => {
                // console.log(movie.Title)
                let matchingMovie = parsedResult.suggestions.find(
                    (suggestion) =>
                        suggestion.movie.toLowerCase() ==
                        movie.Title?.toLowerCase()
                );
                // console.log(matchingMovie)
                if (matchingMovie) {
                    let result: GptSuggestedMovie = {
                        ...movie,
                        brief_reason: matchingMovie!["brief reason"],
                    };
                    return result;
                }
            });
            res.json(finalResults);
            return;
        }
        throw new Error("Invalid result form AI");
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
app.listen(3000, () => {
    console.log("Server is running at port 3000");
});
