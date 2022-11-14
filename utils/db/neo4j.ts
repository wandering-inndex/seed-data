import neo4j, { Driver, hasReachableServer } from "neo4j";

import { ResultOrError } from "../../types/app.ts";

interface Config {
  url: string;
  username: string;
  password: string;
}

/** Tries to connect to the neo4j database. */
export const connect = async (
  { url, username, password }: Config,
): Promise<ResultOrError<Driver>> => {
  const driver = neo4j.driver(
    url,
    neo4j.auth.basic(username, password),
  );

  if (url === "" || username === "" || password === "") {
    return [driver, new Error("invalid credentials")];
  }

  const valid = await hasReachableServer(url);
  if (!valid) {
    return [driver, new Error("url cannot be reached")];
  }

  return [driver, null];
};
