-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedMovie" (
    "title" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "rated" TEXT,
    "released" TEXT,
    "runtime" TEXT,
    "genre" TEXT,
    "director" TEXT,
    "writer" TEXT,
    "actors" TEXT,
    "plot" TEXT,
    "language" TEXT,
    "country" TEXT,
    "awards" TEXT,
    "poster" TEXT,
    "metascore" TEXT,
    "imdbRating" TEXT,
    "imdbVotes" TEXT,
    "imdbID" TEXT NOT NULL,
    "type" TEXT,
    "dvd" TEXT,
    "boxOffice" TEXT,
    "production" TEXT,
    "website" TEXT,
    "response" TEXT,
    "brief_reason" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "SavedMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SavedMovie" ("actors", "awards", "boxOffice", "brief_reason", "country", "director", "dvd", "genre", "imdbID", "imdbRating", "imdbVotes", "language", "metascore", "plot", "poster", "production", "rated", "released", "response", "runtime", "title", "type", "userId", "website", "writer", "year") SELECT "actors", "awards", "boxOffice", "brief_reason", "country", "director", "dvd", "genre", "imdbID", "imdbRating", "imdbVotes", "language", "metascore", "plot", "poster", "production", "rated", "released", "response", "runtime", "title", "type", "userId", "website", "writer", "year" FROM "SavedMovie";
DROP TABLE "SavedMovie";
ALTER TABLE "new_SavedMovie" RENAME TO "SavedMovie";
CREATE UNIQUE INDEX "SavedMovie_imdbID_key" ON "SavedMovie"("imdbID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
