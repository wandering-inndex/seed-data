# Seed Data

![Deno Version](https://img.shields.io/badge/deno-v1.28.1-black)
![License](https://img.shields.io/badge/license-MIT-blue)
[![Open with Gitpod](https://img.shields.io/badge/Open%20with-Gitpod-908a85?logo=gitpod)](https://gitpod.io/#https://github.com/wandering-inndex/seed-data)

![The Wandering Inndex Logo](./static/banner.png)

> **IMPORTANT NOTICE**: Copyright for almost all the text in this repository goes to the author, **pirateaba**. Please support them through their official channels:
>
> - https://wanderinginn.com
> - https://store.wanderinginn.com
> - https://patreon.com/pirateaba

This repository contains the seed data used to power the index. Contributions are very much welcome! Just remember to **only include the data for public chapters**, and most importantly, "**No Killing Goblins!**".

## Requirements

- [Deno](https://deno.land/)
- [SurrealDB](https://surrealdb.com/)
- [Neo4j](https://neo4j.com/)

## Development

### SurrealDB

- Install [SurrealDB](https://surrealdb.com/).
- Start your database (e.g. `surreal start --log info --user <username> --pass <password> memory`).
- Create a `.env` file from the `.env.template`.
- Fill in the required values.
- Run the following commands to populate the database:
  - `deno task surrealdb-populate-webnovel-chapters`
  - `deno task surrealdb-populate-webnovel-volumes`
  - `deno task surrealdb-populate-kindle-ebooks`
  - `deno task surrealdb-populate-audible-audiobooks`

#### Persisting to disk

Instead of `memory`, you can pass in `file://<filepath>`.

If you are running on a Docker container, you can persist the data by creating a [volume](https://docs.docker.com/storage/volumes/):

```bash
$ docker volume create <volume>
$ docker run --rm -p <newport>:8000 -v <volume>:/var/inndexdb surrealdb/surrealdb:latest start --log info --user <username> --pass <password> file://var/inndexdb
```

### Neo4j

- Ready your Neo4j database. You can use the free fully-managed solution at [Neo4j AuraDB](https://neo4j.com/cloud/platform/aura-graph-database/) or [self-host your own instance](https://neo4j.com/download-center/#community).
- Open the [Neo4j Browser](https://neo4j.com/developer/neo4j-browser/) and run the commands from [`schemas/create-constraints.cypher`](./schemas/create-constraints.cypher) to create the constrants.
- Create a `.env` file from the `.env.template`.
- Fill in the required values.
- Run the following commands to populate the database:
  - `deno task neo4j-populate-media-nodes`
  - `deno task neo4j-populate-bracket-contents`

## Contributing

**Imposter syndrome disclaimer**: We want your help. No, really.

There may be a little voice inside your head that is telling you that you're not ready to be an open source contributor; that your skills aren't nearly good enough to contribute. What could you possibly offer a project like this one?

We assure you - the little voice in your head is wrong. If you can write code at all, you can contribute code to open source. Contributing to open source projects is a fantastic way to advance one's coding skills. Writing perfect code isn't the measure of a good developer (that would disqualify all of us!); it's trying to create something, making mistakes, and learning from those mistakes. That's how we all improve, and we are happy to help others learn.

Being an open source contributor doesn't just mean writing code, either. You can help out by writing documentation, tests, or even giving feedback about the project (and yes - that includes giving feedback about the contribution process). Some of these contributions may be the most valuable to the project as a whole, because you're coming to the project with fresh eyes, so you can see the errors and assumptions that seasoned contributors have glossed over.

## License

Licensed under **MIT**. Please see bundled [LICENSE file](./LICENSE.md) for more details.
