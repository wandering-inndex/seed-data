import neo4j, { Driver } from "neo4j";

interface Config {
  url: string;
  username: string;
  password: string;
}

export const connect = (
  { url, username, password }: Config,
): Driver => {
  const driver = neo4j.driver(
    url,
    neo4j.auth.basic(username, password),
  );

  return driver;
};
