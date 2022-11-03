# Words: Brackets

The data here is extracted from all the web novel chapters up to [9.22 GN](https://wanderinginn.com/2022/10/30/9-22-gn/).

## Why

Instead of creating a generic parser that can handle all permutations (spoiler alert: there are a lot), it is easier to just create a word bank that is cleaned and categorized manually by a human. The data can then be fed to a computer to do all sorts of things.

## Extraction

The bracket contents are extracted using the regular expressions from [WanderingInnStatistics](https://github.com/Amiron49/WanderingInnStatistics):

```typescript
const REGEX_INSIDE_BRACKETS = /\[(?<content>[^\]\[]+)\]/gm;
const REGEX_BROKEN_BRACKETS = /\[(?<content>[^…—\]\[]+(—|…))/gm;
```

All the normal ones can be extracted using `REGEX_INSIDE_BRACKETS`, but some does not have a closing `]` and can only be extracted using `REGEX_BROKEN_BRACKETS`.

## Caveats

- The `REGEX_BROKEN_BRACKETS` assumes that the "closing tag" is either `…` or `—`. If pirateaba used another breaker, we cannot find it here.
- The `REGEX_BROKEN_BRACKETS` will also extract content already covered by `REGEX_INSIDE_BRACKETS`, so you will have to manually check and clean your data.

## Additional Instructions

**NOTE**: There is a typo on [7.48 K](https://wanderinginn.com/2020/09/20/7-48-k/). Change the following before running the parsers for that specific chapter:

```
// before
“High-level [Archers[?”

// after
“High-level [Archers]?”
```

## Folder Structure

The current structure is as follows:

```
data/words/brackets/
├── README.md
├── classes/
│   ├── acquisition.txt
│   ├── broken.txt
│   ├── consolidation.txt
│   ├── level-ups.txt
│   ├── made-up.txt
│   ├── names.txt
│   └── uncategorized.txt
├── skills/
│   ├── acquisition.txt
│   ├── broken.txt
│   ├── consolidation.txt
│   ├── made-up.txt
│   └── names.txt
├── chat/
│   ├── names.txt
│   └── notifications.txt
├── others/
│   ├── made-up-messages.txt
│   ├── system-messages.txt
│   ├── universe-words.txt
│   └── valeterisa-notes.txt
└── uncategorized/
    ├── all.txt
    └── broken.txt
```

- `uncategorized.txt` - bracket words that are yet to be placed in their specific categories
- `acquisition.txt` - refers to obtaining/removal of skills or classes
- `broken.txt` - refers to bracket words that are not closed
- `names.txt` - inside `classes/` and `skills/`, refers to the plain names without flavor text like `"conditions met: class <name> obtained!"`
- `consolidation.txt` - refers to text detailing upgrades of classes or skills from a previous lower-powered one
- `made-up.txt` - not real classes or skills, usually used for comedic relief
- `universe-words.txt` - used as nouns or verbs by Innworld inhabitants (e.g. `the Gnoll clearly have [Skills].`)
