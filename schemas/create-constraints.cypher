// Create constraints for the different labels.
// Since the NODE KEY constraint is only available for the Enterprise Edition,
// we can only use the UNIQUE constraint.

CREATE CONSTRAINT Chapter_id_unique IF NOT EXISTS
FOR (chapter:Chapter)
REQUIRE chapter.id IS UNIQUE;

CREATE CONSTRAINT WebVolume_id_unique IF NOT EXISTS
FOR (webVolume:WebVolume)
REQUIRE webVolume.id IS UNIQUE;

CREATE CONSTRAINT ElectronicBook_id_unique IF NOT EXISTS
FOR (electronicBook:ElectronicBook)
REQUIRE electronicBook.id IS UNIQUE;

CREATE CONSTRAINT AudioBook_id_unique IF NOT EXISTS
FOR (audioBook:AudioBook)
REQUIRE audioBook.id IS UNIQUE;

CREATE CONSTRAINT BracketContent_id_unique IF NOT EXISTS
FOR (bracketContent:BracketContent)
REQUIRE bracketContent.id IS UNIQUE;

CREATE CONSTRAINT BracketContent_content_unique IF NOT EXISTS
FOR (bracketContent:BracketContent)
REQUIRE bracketContent.content IS UNIQUE;
