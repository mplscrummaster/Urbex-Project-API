CREATE TABLE "startTutorial" (
	"id"	INTEGER,
	"_id_user"	INTEGER NOT NULL,
	"startTutorial"	INTEGER NOT NULL DEFAULT 0 CHECK("startTutorial" IN (0, 1)),
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("_id_user") REFERENCES "users"("_id_user")
)