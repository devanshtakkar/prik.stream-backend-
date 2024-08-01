import express from "express";
import {
    GptSuggestedMovie,
    MovieDetails,
    NewUser,
    SaveMovieReq,
} from "../Types";
import Joi from "joi";
import { prisma } from "..";

export const app = express.Router();
app.use(express.json());

app.get("/", async (req, res) => {
    try {
        let users = await prisma.user.findMany({
            include: {
                savedMovies: true,
            },
        });
        res.json(users);
        return;
    } catch {
        res.status(500).json({ err: "Internal database error" });
    }
});
app.post("/new_user", (req, res) => {});

app.post("/movie", async (req, res) => {
    let body: SaveMovieReq | undefined = req.body;
    if (!body) {
        res.status(401).json({ err: "No request body provided" });
        return;
    }
    if ("email" in body) {
        let movie = body.movie;
        //Joi validate object
        let joiEmail = Joi.string().email();
        console.log(movie);
        try {
            const validatedEmail = await joiEmail.validateAsync(body.email);
            let user = await prisma.user.findUnique({
                where: {
                    email: validatedEmail,
                },
            });
            if (!user) {
                let newSave = await prisma.user.create({
                    data: {
                        email: validatedEmail,
                        password: "password",
                        name: body.name,
                        savedMovies: {
                            create: {
                                title: movie.Title,
                                director: movie.Director,
                                poster: movie.Poster,
                                year: movie.Year,
                                brief_reason: movie.brief_reason,
                                imdbID: movie.imdbID,
                                genre: movie.Genre
                            },
                        },
                    },
                    include: {
                        savedMovies: true,
                    },
                });

                console.log(newSave);
                res.status(201).json(newSave.savedMovies);
            } else {
                let newSave = await prisma.savedMovie.create({
                    data: {
                        title: movie.Title,
                        poster: movie.Poster,
                        director: movie.Director,
                        year: movie.Year,
                        brief_reason: movie.brief_reason,
                        imdbID: movie.imdbID,
                        userId: user.id,
                        genre: movie.Genre
                    },
                });
                res.status(201).json(newSave);
            }
        } catch (err: any) {
            if (err.name === "ValidationError") {
                res.status(400).json({ err: err.message });
                return;
            }
            console.log(err.message);
            res.status(500).json({ err: "Internal server error" });
        }
    }
});

interface DeleteMovieReqMovieDetails extends GptSuggestedMovie {
    id: number;
}

interface DeleteMovieReq {
    userId: number
    movie: DeleteMovieReqMovieDetails;
}

app.delete("/movie", async (req, res) => {
    let body: DeleteMovieReq | undefined = req.body;
    console.log(body)
    if (!body) {
        res.status(401).json({ err: "No request body provided" });
        return;
    }
    if ("userId" in body) {
        let movie = body.movie;
        try {
            let user = await prisma.user.findUnique({
                where: {
                    id: body.userId,
                },
            });
            if (!user) {
                res.status(401).json({ err: "This user does not exist" });
            } else {
                let deleteMovie = await prisma.savedMovie.delete({
                    where: {
                        id: movie.id,
                    },
                });
                res.json(deleteMovie);
                return;
            }
        } catch (err: any) {
            if (err.name === "ValidationError") {
                res.status(400).json({ err: err.message });
                return;
            }
            res.status(500).json({ err: "Internal server error" });
        }
    }
});

app.get("/movies", async (req, res) => {
    let queryParams = req.query;
    let userID = queryParams?.userID;
    if (userID) {
        try {
            if (!userID) {
                res.status(401).json({ err: "No such user exists" });
                return;
            }
            let savedMovies = await prisma.savedMovie.findMany({
                where: {
                    userId: +userID,
                },
            });
            res.json(savedMovies);
        } catch {
            res.status(500).json({ err: "Internal database error" });
        }
    } else {
        res.status(401).json({ err: "No user id provided" });
    }
});
