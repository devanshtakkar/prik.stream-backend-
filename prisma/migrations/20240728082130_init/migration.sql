-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SavedMovie" (
    "title" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "rated" TEXT NOT NULL,
    "released" TEXT NOT NULL,
    "runtime" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "writer" TEXT NOT NULL,
    "actors" TEXT NOT NULL,
    "plot" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "awards" TEXT NOT NULL,
    "poster" TEXT NOT NULL,
    "metascore" TEXT NOT NULL,
    "imdbRating" TEXT NOT NULL,
    "imdbVotes" TEXT NOT NULL,
    "imdbID" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dvd" TEXT NOT NULL,
    "boxOffice" TEXT NOT NULL,
    "production" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "brief_reason" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "SavedMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SavedMovie_imdbID_key" ON "SavedMovie"("imdbID");
