# Words: Brackets

The data here is extracted from all the web novel chapters up to [9.22 GN](https://wanderinginn.com/2022/10/30/9-22-gn/).

## Why

Instead of creating a generic parser that can handle all permutations (spoiler alert: there are a lot), it is easier to just create a word bank that is cleaned and categorized manually by a human. The data can then be fed to a computer to do all sorts of things.

## Extraction

The bracket contents are extracted using the regular expressions from [WanderingInnStatistics](https://github.com/Amiron49/WanderingInnStatistics):

```text
// REGEX_INSIDE_BRACKETS
/\[(?<content>[^\]\[]+)\]/gm

// REGEX_BROKEN_BRACKETS
/\[(?<content>[^…—\]\[]+(—|…))/gm
```

All the normal ones can be extracted using `REGEX_INSIDE_BRACKETS`, but some does not have a closing `]` and can only be extracted using `REGEX_BROKEN_BRACKETS`.

To use, open your browser's console (e.g. [Chrome DevTools](https://developer.chrome.com/docs/devtools/open/)) on a specific chapter page and type the following:

```javascript
const REGEX_INSIDE_BRACKETS = /\[(?<content>[^\]\[]+)\]/gm;
const REGEX_BROKEN_BRACKETS = /\[(?<content>[^…—\]\[]+(—|…))/gm;

const text = document
  .querySelector(".entry-content")
  .textContent.split("\n")
  .map((line) => line.trim())
  .filter((line) => line.trim() !== "")
  .join("\n");

const getResults = (label, text, rule) => {
  const uniqueItems = new Set();
  (text.match(rule) || []).forEach((result) => {
    uniqueItems.add(result.trim());
  });
  const results = [];
  for (const result of uniqueItems.values()) {
    results.push(result);
  }
  console.log([label, ...results.sort()].join("\n"));
};

getResults("INSIDE BRACKETS:", text, REGEX_INSIDE_BRACKETS);
getResults("BROKEN BRACKETS:", text, REGEX_BROKEN_BRACKETS);
```

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
├── chat
│   ├── names.txt
│   └── notifications.txt
├── classes
│   ├── acquisition.txt
│   ├── broken.txt
│   ├── consolidation.txt
│   ├── level-ups.txt
│   ├── made-up.txt
│   ├── names.txt
│   ├── removal.txt
│   ├── restoration.txt
│   └── uncategorized.txt
├── conditions
│   └── messages.txt
├── others
│   ├── made-up-messages.txt
│   ├── system-messages.txt
│   ├── typos.txt
│   ├── unclear.txt
│   ├── universe-words.txt
│   └── valeterisa-notes.txt
├── ranks
│   └── messages.txt
├── skills
│   ├── acquisition.txt
│   ├── broken.txt
│   ├── consolidation.txt
│   ├── made-up.txt
│   ├── names.txt
│   └── removal.txt
└── uncategorized
    └── broken.txt
```

Ideally, we should only tally the items from `skills/names.txt` and `classes/names.txt`. But we also included the other bracketed words for easier lookup.

Here are some explanations for the file names:

- `acquisition.txt` - refers to obtaining of skills or classes
- `removal.txt` - refers to the removal of skills or classes
- `broken.txt` - refers to bracket words that are not closed or have broken content inside
- `consolidation.txt` - refers to text detailing upgrades of classes or skills from a previous lower-powered one
- `made-up.txt` - not real classes or skills, usually used for comedic relief
- `typos.txt` - words that should not have been bracketized
- `universe-words.txt` - used as nouns or verbs by Innworld inhabitants (e.g. `that Gnoll clearly have skills and [Skills].`)
- `unclear.txt` - we're not sure if they are classes or skills
