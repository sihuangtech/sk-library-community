-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "publisher" TEXT,
    "pubdate" TEXT,
    "price" TEXT,
    "summary" TEXT,
    "coverUrl" TEXT,
    "pages" INTEGER,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrowedBy" TEXT,
    "borrowedAt" DATETIME,
    "returnDate" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
