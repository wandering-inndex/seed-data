# Development

This documents how to start the development process.

## Chrome Extensions

Here are some chrome extensions that will improve your development experience:

- [Octotree - GitHub code tree](https://chrome.google.com/webstore/detail/octotree-github-code-tree/bkhaagjahfmjljalopjnoealnfndnagc)
- [Refined GitHub](https://chrome.google.com/webstore/detail/refined-github/hlepfoohegkhhmjieoechaddaejaokhf)
- [Gitpod - Always ready to code](https://chrome.google.com/webstore/detail/gitpod-always-ready-to-co/dodmmooeoklaejobgleioelladacbeki)
- [JSONVue](https://chrome.google.com/webstore/detail/jsonvue/chklaanhfefbnpoihckbnefhakgolnmc)

## Code Editors

We recommend using [Visual Studio Code](https://code.visualstudio.com/), with the following extensions:

- [`bierner.markdown-mermaid`](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
- [`denoland.vscode-deno`](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
- [`esbenp.prettier-vscode`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [`jakeboone02.cypher-query-language`](https://marketplace.visualstudio.com/items?itemName=jakeboone02.cypher-query-language)
- [`mathe42.surrealql`](https://marketplace.visualstudio.com/items?itemName=mathe42.surrealql)

If you do not have access to a development machine, you can create a new [Gitpod](https://gitpod.io/) workspace by clicking the button below:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/wandering-inndex/seed-data)

## Deno

This project uses the [Deno](https://deno.land) JavaScript runtime to run the scripts. You can check the manual at https://deno.land/manual/introduction.

## Databases

Our project requires two types of databases, particularly [Surreal](#surrealdb) and [Neo4j](#neo4j).

### SurrealDB

> To learn about the query language used, you can check the [SurrealQL specifications](https://surrealdb.com/docs/surrealql).

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
$ docker pull surrealdb/surrealdb:1.0.0-beta.8
$ docker volume create <volume>
$ docker run --rm \
  --publish <newport>:8000 \
  --volume <volume>:/var/inndexdb \
  surrealdb/surrealdb:1.0.0-beta.8 \
    start --log info --user <username> --pass <password> file://var/inndexdb
```

### Neo4j

> If you want to understand how to work with graphs, there is a free learning resource at [GraphAcademy](https://graphacademy.neo4j.com/).

- Ready your Neo4j database. You can use the free fully-managed solution at [Neo4j AuraDB](https://neo4j.com/cloud/platform/aura-graph-database/) or [self-host your own instance](https://neo4j.com/download-center/#community).
- Open the [Neo4j Browser](https://neo4j.com/developer/neo4j-browser/) and run the commands from [`schemas/create-constraints.cypher`](./schemas/create-constraints.cypher) to create the constrants.
- Create a `.env` file from the `.env.template`.
- Fill in the required values.
- Run the following commands to populate the database:
  - `deno task neo4j-populate-media-nodes`
  - `deno task neo4j-populate-bracket-contents`

#### Installing the Community Edition (Docker)

> Check the docs here: https://neo4j.com/docs/operations-manual/current/docker/

```bash
$ docker pull neo4j:5.1.0-community
$ docker volume create <volume-data>
$ docker volume create <volume-logs>
$ docker run \
  --restart no \
  --publish=7474:7474 \
  --publish=7687:7687 \
  --volume=<volume-data>:/data \
  --volume=<volume-logs>:/logs \
    --env NEO4J_AUTH=neo4j/<password> \
  neo4j:5.1.0-community
```
