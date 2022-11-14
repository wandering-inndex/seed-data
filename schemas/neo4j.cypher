CREATE CONSTRAINT FOR (chapter:Chapter) REQUIRE chapter.id IS UNIQUE;
CREATE CONSTRAINT FOR (webVolume:WebVolume) REQUIRE webVolume.id IS UNIQUE;
CREATE CONSTRAINT FOR (electronicBook:ElectronicBook) REQUIRE electronicBook.id IS UNIQUE;
CREATE CONSTRAINT FOR (audioBook:AudioBook) REQUIRE audioBook.id IS UNIQUE;
