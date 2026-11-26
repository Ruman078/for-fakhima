# For Fakhima

A birthday garden for November 30, from Ruman. Touch the seed beneath the moon to wake the garden. Follow the first daisy into the lilies, pick and wrap a bouquet, open the letter, and find ten birthday notes among the plants.

## Run locally

Serve this directory with a static web server. With Python installed, run the following command from the repository root.

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open [the local garden](http://127.0.0.1:8000/). JavaScript modules load over HTTP. The site runs directly from the source files and also works under a project subdirectory.

## Inside the garden

The chapter arrows skip or revisit a scene. **Chapters** opens the contents, and Escape closes it. The birthday reveal and finale wait for the reader. Sound starts muted. Turning it on enables short, synthesized chimes.

The bouquet editor keeps the arrangement when the reader leaves and returns during a visit. **Undo**, **Rearrange**, and **Unwrap** let her keep working. **Save PNG** draws a 960 × 1050 keepsake on the device. **New bouquet** starts a fresh arrangement from the finale. Reloading the page or choosing **Replay** starts a new visit.

The letter scrolls independently inside its paper. Each garden surprise supports touch, a pointer, and keyboard activation. A reduced-motion preference replaces long growth sequences with completed illustrations.

## Personalize the experience

Edit `scripts/config.js` to change the recipient, sender, date, greeting, birthday messages, letter paragraphs, available bouquet flowers, surprise notes, chapter names, interface palette, particle budget, and chapter timings. The letter is authored prose, so update names and the sign-off in that text when changing recipients.

| Files | Purpose |
| --- | --- |
| `scripts/app.js`, `motion.js` | Chapter navigation, visible-time scheduling, and reduced motion |
| `scripts/botany.js`, `garden-art.js` | Seeded botanical geometry, individually unfolding petals, foreground illustrations, insects, and wreath |
| `scripts/illustrations.js`, `landscape.js` | Moon engravings, frame ornaments, paper grain, hills, stars, and fireflies |
| `scripts/bouquet.js` | Stem arrangement, wrapping, and on-device PNG export |
| `scripts/keepsakes.js` | Folding letter and interactive garden notes |
| `scripts/sound.js` | Optional synthesized chimes |
| `styles/` | Responsive composition, typography, and motion |

SVG paths, browser-drawn textures, and system fonts supply the artwork. Botanical images created at runtime stay local to the browser. The experience uses no external assets, trackers, permissions, accounts, or backend.

## Browser checks

`tests/smoke.py` walks through all eight scenes, checks touch and keyboard interaction, downloads and validates the bouquet PNG, reads the letter, discovers every note, rotates the viewport, revisits scenes, and replays the growth animation. Run the server first, then run the checks in a separate terminal. Playwright is a test dependency only.

```sh
python -m pip install playwright
python -m playwright install chromium webkit
python tests/smoke.py http://127.0.0.1:8000/ --engine chromium
python tests/smoke.py http://127.0.0.1:8000/ --engine webkit
```

The default sizes are 375 × 667, 390 × 844, 393 × 852, 430 × 932, and 1440 × 900. The smallest size uses reduced motion. Use `--size 390 844` for a single size, or `--captures PATH` to write scene screenshots to a directory outside the site. These checks use browser emulation.

## GitHub Pages

Publish from the root of the `main` branch in **Settings → Pages**. All site paths are relative. The empty `.nojekyll` file keeps the deployment static.
