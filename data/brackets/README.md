# Data: Brackets

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
