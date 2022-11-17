// Create constraints for the different labels.
CREATE CONSTRAINT IF NOT EXISTS FOR (chapter:Chapter) REQUIRE chapter.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (webVolume:WebVolume) REQUIRE webVolume.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (electronicBook:ElectronicBook) REQUIRE electronicBook.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (audioBook:AudioBook) REQUIRE audioBook.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (bracketContent:BracketContent) REQUIRE bracketContent.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (bracketContent:BracketContent) REQUIRE bracketContent.content IS UNIQUE;
