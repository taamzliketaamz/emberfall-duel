# emberfall-duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/taamzliketaamz/emberfall-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/taamzliketaamz/emberfall-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Emberfall Duel is an original 1-v-1 card duel against Kael, the Ash Knight. Both duelists start with 24 life and a hand of four from a shared shuffled deck of 16 cards in four suits (Ember, Grove, Tide, Gilt). Every turn both sides play one card at the same moment: the higher effective power deals the difference as damage. Suits bend the clash (Ember beats Grove beats Tide beats Ember, +2 power), guard cards deal nothing but halve what they take, a cheaper card that still wins strikes swift for +1, and discarding a card heals 1. First to 0 life falls; after 12 turns the higher life holds the field. The game is a static HTML/canvas page with a seeded deck, so every deal is reproducible, and it ships with deterministic screenshot states for its title, mid-duel, victory and defeat screens.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts && node serve.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=dc09wtqt&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
