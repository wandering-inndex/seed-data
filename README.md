# Seed Data

![Deno Version](https://img.shields.io/badge/deno-v1.26.2-black)
![License](https://img.shields.io/badge/license-MIT-blue)

![The Wandering Inndex Logo](./static/banner.png)

> **IMPORTANT NOTICE**: Copyright for almost all the text in this repository goes to the author, **pirateaba**. Please support the author through their official channels:
>
> - https://wanderinginn.com
> - https://store.wanderinginn.com/
> - https://reddit.com/r/WanderingInn
> - https://patreon.com/pirateaba
> - https://twitch.tv/pirateaba
> - https://youtube.com/user/pirateaba
> - https://twitter.com/pirateaba

This repository contains the seed data used to power the index. Contributions are very much welcome! Just remember to **only include the data for public chapters**, and most importantly, "**No Killing Goblins!**".

## Requirements

- [Deno](https://deno.land/)
- [SurrealDB](https://surrealdb.com/)

## Development

- Install [SurrealDB](https://surrealdb.com/).
- Start your database (e.g. `surreal start --log info --user <username> --pass <password> memory`).
- Create a `.env` file from the `.env.template`.
- Fill in the required values.
- On a separate console, run the commands to populate the tables:
  - `deno task populate-webnovel-chapters-surrealdb`
  - `deno task populate-webnovel-volumes-surrealdb`
  - `deno task populate-kindle-ebooks-surrealdb`
  - `deno task populate-audible-audiobooks-surrealdb`

### Persisting to disk

Instead of `memory`, you can pass in `file://<filepath>`.

If you are running on a Docker container, you can persist the data by creating a [volume](https://docs.docker.com/storage/volumes/):

```bash
$ docker volume create <volume>
$ docker run --rm -p <newport>:8000 -v <volume>:/var/inndexdb surrealdb/surrealdb:latest start --log info --user <username> --pass <password> file://var/inndexdb
```

## Contributing

**Imposter syndrome disclaimer**: We want your help. No, really.

There may be a little voice inside your head that is telling you that you're not ready to be an open source contributor; that your skills aren't nearly good enough to contribute. What could you possibly offer a project like this one?

We assure you - the little voice in your head is wrong. If you can write code at all, you can contribute code to open source. Contributing to open source projects is a fantastic way to advance one's coding skills. Writing perfect code isn't the measure of a good developer (that would disqualify all of us!); it's trying to create something, making mistakes, and learning from those mistakes. That's how we all improve, and we are happy to help others learn.

Being an open source contributor doesn't just mean writing code, either. You can help out by writing documentation, tests, or even giving feedback about the project (and yes - that includes giving feedback about the contribution process). Some of these contributions may be the most valuable to the project as a whole, because you're coming to the project with fresh eyes, so you can see the errors and assumptions that seasoned contributors have glossed over.

## License

Licensed under **MIT**. Please see bundled [LICENSE file](./LICENSE.md) for more details.
