"""Walk the published or locally served garden with Playwright's browser engines."""
import argparse
import struct
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright


def walk(browser, engine, size, url, captures):
    width, height = size
    phone = width < 700
    reduced = width == 375
    context = browser.new_context(viewport={"width": width, "height": height},
                                  has_touch=phone, is_mobile=phone, device_scale_factor=1,
                                  reduced_motion="reduce" if reduced else "no-preference")
    page = context.new_page()
    page.set_default_timeout(12000)
    errors, failed, remote = [], [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.on("response", lambda response: failed.append(response.url) if response.status >= 400 else None)
    def check_origin(request):
        parts = urlsplit(request.url)
        if parts.scheme in {"http", "https"} and parts.netloc != urlsplit(url).netloc:
            remote.append(request.url)
    page.on("request", check_origin)
    locator = page.locator

    def press(target):
        button = locator(target) if isinstance(target, str) else target
        button.tap() if phone else button.click()

    def chapter(index):
        expect(locator("#book")).to_have_attribute("data-stage", str(index), timeout=18000)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")

    def visit(index):
        press("#chapters")
        press(f'[data-page="{index}"]')
        chapter(index)

    def capture(label):
        if captures:
            captures.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(captures / f"{engine}-{width}-{label}.png"))

    try:
        assert page.goto(url).ok
        chapter(0)
        expect(locator(".wake-button")).to_be_visible()
        page.wait_for_function("Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)")
        page.wait_for_timeout(800)
        capture("opening")
        press("#chapters")
        page.keyboard.press("Escape")
        expect(locator("#chapter-layer")).to_be_hidden()
        expect(locator("#chapters")).to_be_focused()
        if page.evaluate("Boolean(window.AudioContext || window.webkitAudioContext || new Audio().canPlayType('audio/wav'))"):
            press("#sound")
            expect(locator("#sound")).to_have_attribute("aria-pressed", "true")
            press("#sound")
        else:
            expect(locator("#sound")).to_be_hidden()
        press(".wake-button")
        chapter(1)
        if reduced:
            chapter(2)
        else:
            page.wait_for_timeout(6000)
            capture("first-daisy")
            chapter(2)
        chapter(3)
        page.wait_for_timeout(1600)
        capture("birthday")
        press('[data-action="next"]')
        chapter(4)
        flowers = locator("[data-flower]")
        expect(flowers).to_have_count(12)
        for flower in flowers.all():
            press(flower)
        expect(locator(".bq-count")).to_have_text("12 stems")
        press('[data-bq-action="undo"]')
        press('[data-bq-action="arrange"]')
        expect(locator(".bq-count")).to_have_text("11 stems")
        # Exercise the same click handler in a burst before in-flight petals land.
        locator('[data-flower="daisy"]').evaluate("(e)=>{e.click();e.click();e.click()}")
        expect(locator(".bq-count")).to_have_text("14 stems")
        # Exercise a large arrangement with a mix of every flower. Repeated
        # selections stop at capacity, and undo makes room for one more cut.
        flowers.evaluate_all("(choices)=>{for(let i=0;i<32;i++)choices[i%choices.length].click()}")
        expect(locator("[data-flower]:disabled")).to_have_count(12)
        press('[data-bq-action="undo"]')
        expect(locator(".bq-count")).to_have_text("41 stems")
        press('[data-flower="rose"]')
        expect(locator("[data-flower]:disabled")).to_have_count(12)
        if phone:
            page.set_viewport_size({"width": height, "height": width})
            chapter(4)
            page.set_viewport_size({"width": width, "height": height})
        press('[data-bq-action="wrap"]')
        for option in ('[data-paper="indigo"]', '[data-pattern="stripe"]', '[data-ribbon="honey"]'):
            press(option)
            expect(locator(option)).to_have_attribute("aria-pressed", "true")
        page.wait_for_timeout(1300)
        capture("bouquet")
        with page.expect_download() as download:
            press('[data-bq-action="save"]')
        with TemporaryDirectory() as dest:
            png = Path(dest) / "bouquet.png"
            download.value.save_as(png)
            header = png.read_bytes()[:24]
            assert header.startswith(b"\x89PNG\r\n\x1a\n") and struct.unpack(">II", header[16:24]) == (960, 1050)
        press('[data-bq-action="next"]')
        chapter(5)
        press(".ks-open")
        article = locator(".ks-paper")
        expect(article).to_have_attribute("aria-hidden", "false")
        expect(article).to_contain_text("Birthday rules jee")
        expect(article).to_contain_text("your birthday book")
        expect(article).not_to_contain_text("time spend karna")
        page.wait_for_timeout(1500)
        capture("letter")
        if phone:
            assert article.evaluate("(e)=>{e.scrollTop=e.scrollHeight;return e.scrollTop>0}")
        chapter(5)
        press(".ks-back")
        press(".ks-open")
        press(".ks-next")
        chapter(6)
        expect(locator(".ks-object")).to_have_count(14)
        for key in locator(".ks-object").evaluate_all("(groups)=>groups.map(g=>g.dataset.key)"):
            # SVG groups also contain stems. Tap their dedicated center targets.
            press(f'.ks-object[data-key="{key}"] > rect')
        expect(locator(".ks-count")).to_have_text("14 of 14 found")
        capture("surprises")
        press(".ks-discovery-actions .ks-action")
        chapter(7)
        page.wait_for_timeout(2000)
        capture("finale")
        press('[data-action="visit"]')
        expect(locator(".ks-count")).to_have_text("14 of 14 found")
        press(".ks-discovery-actions .ks-action")
        press('[data-action="letter"]')
        chapter(5)
        visit(4)
        expect(locator('[data-bq-action="save"]')).to_be_visible()
        for option in ('[data-paper="indigo"]', '[data-pattern="stripe"]', '[data-ribbon="honey"]'):
            expect(locator(option)).to_have_attribute("aria-pressed", "true")
        visit(7)
        press('[data-action="bouquet"]')
        expect(locator(".bq-count")).to_have_text("0 stems")
        visit(7)
        press('[data-action="replay"]')
        chapter(0)
        visit(6)
        expect(locator(".ks-count")).to_have_text("0 of 14 found")
        visit(0)
        press(".wake-button")
        chapter(1)
        press("#next")
        chapter(2)
        # A burst of identical page turns cannot skip two chapters.
        page.wait_for_timeout(420)
        locator("#next").evaluate("(e)=>{e.click();e.click();e.click()}")
        chapter(3)
        # Interrupt a page turn by choosing the page that is still visible.
        # A half-read letter must keep its open state and scroll position.
        if not reduced:
            visit(5)
            press(".ks-open")
            page.wait_for_timeout(1450)
            article.evaluate("(e)=>{e.scrollTop=60}")
            before = article.evaluate("(e)=>e.scrollTop")
            page.evaluate("""() => {
                const choose = i => {
                    document.querySelector('#chapters').click();
                    document.querySelector('[data-page="' + i + '"]').click();
                };
                choose(7);
                setTimeout(() => choose(5), 45);
            }""")
            page.wait_for_timeout(700)
            chapter(5)
            expect(article).to_have_attribute("aria-hidden", "false")
            assert article.evaluate("(e)=>e.scrollTop") == before
            assert not locator("#scene").evaluate("(e)=>e.inert")
        assert not (errors or failed or remote), (errors, failed, remote)
        print(f"PASS {engine} {width}x{height} reduced-motion={reduced}", flush=True)
    finally:
        context.close()


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("url")
    cli.add_argument("--engine", choices=["chromium", "webkit"], default="chromium")
    cli.add_argument("--size", nargs=2, type=int, action="append", metavar=("WIDTH", "HEIGHT"))
    cli.add_argument("--captures", type=Path)
    args = cli.parse_args()
    with sync_playwright() as playwright:
        browser = getattr(playwright, args.engine).launch()
        for viewport in args.size or [(375, 667), (390, 844), (393, 852), (430, 932), (1440, 900)]:
            walk(browser, args.engine, viewport, args.url, args.captures)
        browser.close()
