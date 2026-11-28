"""Check that tapping a birthday note keeps the mobile garden steady."""
import argparse
import re

from playwright.sync_api import expect, sync_playwright


def check_garden(browser, engine, size, url):
    width, height = size
    page = browser.new_page(viewport={"width": width, "height": height},
                            is_mobile=True, has_touch=True, device_scale_factor=2)
    try:
        assert page.goto(url).ok
        page.locator("#chapters").tap()
        page.locator('[data-page="6"]').tap()
        bed = page.locator(".ks-bed")
        targets = bed.locator(".ks-object")
        expect(targets).to_have_count(14)
        page.locator("#scene").evaluate("(e) => Promise.all(e.getAnimations().map(a => a.finished))")

        # A note can wrap across several lines. If the bed resizes even briefly,
        # ResizeObserver can discard the visible prints and start decoding again.
        bed.evaluate("""bed => {
            const bounds = () => [bed.offsetWidth, bed.offsetHeight, bed.offsetTop];
            const initial = bounds();
            const artwork = bed.firstElementChild;
            const prints = [...bed.querySelectorAll('image, img')].map(image =>
                [image, image.getAttribute('href') || image.getAttribute('src')]);
            window.gardenChanges = new Set();
            function sample() {
                if (bounds().some((value, i) => value !== initial[i]))
                    gardenChanges.add('bed geometry');
                if (bed.firstElementChild !== artwork) gardenChanges.add('garden root');
                if (prints.some(([image, source]) => !image.isConnected ||
                    (image.getAttribute('href') || image.getAttribute('src')) !== source))
                    gardenChanges.add('background images');
                window.samplingFrame = requestAnimationFrame(sample);
            }
            sample();
        }""")
        keys = targets.evaluate_all("(controls) => controls.map(control => control.dataset.key)")
        # Alternate long and short notes, then revisit controls as a reader might.
        order = ["gift", "bug-berry", "blush", "fern", "gift", "lavender", *keys]
        found = set()
        for key in order:
            target = bed.locator(f'[data-key="{key}"]')
            target.locator(":scope > rect").tap()
            found.add(key)
            expect(target).to_have_class(re.compile(r"\bks-selected\b"))
            expect(page.locator(".ks-count")).to_have_text(f"{len(found)} of 14 found")
            expect(page.locator(".ks-tag")).to_be_visible()
            assert page.locator(".ks-tag").inner_text().strip()

        page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
        changes = page.evaluate("() => { cancelAnimationFrame(samplingFrame); return [...gardenChanges]; }")
        assert not changes, f"{engine} {width}x{height}: note taps changed {', '.join(changes)}"

        # A genuine width change still needs a usable drawing and the reader's
        # discovery progress. Resize with this chapter open and collect a note.
        page.set_viewport_size({"width": height, "height": width})
        expect(targets).to_have_count(14)
        page.wait_for_function("(oldWidth) => document.querySelector('.ks-bed').clientWidth > oldWidth",
                               arg=width)
        bed.locator('[data-key="gift"] > rect').tap()
        expect(page.locator(".ks-tag")).to_contain_text("728th")
        expect(page.locator(".ks-count")).to_have_text("14 of 14 found")
        print(f"PASS {engine} {width}x{height}: {len(order)} steady taps and rotation", flush=True)
    finally:
        page.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url")
    parser.add_argument("--engine", choices=["chromium", "webkit"], required=True)
    args = parser.parse_args()
    with sync_playwright() as playwright:
        browser = getattr(playwright, args.engine).launch()
        for viewport in [(320, 568), (360, 800), (390, 844)]:
            check_garden(browser, args.engine, viewport, args.url)
        browser.close()
