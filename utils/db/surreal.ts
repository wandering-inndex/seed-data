import Surreal from "surrealdb/mod.ts";

import { ResultOrError } from "../../types/app.ts";

interface Config {
  url: string;
  namespace: string;
  database: string;
  username: string;
  password: string;
}

/** Tries to connect to the surrealdb database. */
export const connect = async (
  { url, namespace, database, username, password }: Config,
): Promise<ResultOrError<Surreal>> => {
  const db = new Surreal(url);

  try {
    await db.signin({
      user: username,
      pass: password,
    });
    await db.use(namespace, database);

    return [db, null];
  } catch (e) {
    return [db, new Error(e)];
  }
};
