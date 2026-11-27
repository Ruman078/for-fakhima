"""Measure garden audio at the browser output, including the native WAV fallback."""
import argparse
from playwright.sync_api import expect, sync_playwright


# Only the test installs an output tap. It samples the same master signal sent
# to the destination, using a separate clock so mute can be measured too.
PROBE = """
const Native = window.AudioContext;
const connect = AudioNode.prototype.connect;
let meter, probe, tap, samples;
window.levels = [];
function setup() {
  if (probe) return;
  probe = new Native();
  meter = probe.createAnalyser();
  meter.fftSize = 512;
  samples = new Float32Array(meter.fftSize);
  const silent = probe.createGain();
  silent.gain.value = 0;
  connect.call(meter, silent); connect.call(silent, probe.destination);
  setInterval(() => {
    meter.getFloatTimeDomainData(samples);
    window.levels.push(Math.sqrt(samples.reduce((s,v)=>s+v*v,0)/samples.length));
  }, 12);
}
document.addEventListener('click',()=>{ setup();probe.resume(); },true);
AudioNode.prototype.connect = function(destination,...args) {
  if (destination instanceof AudioDestinationNode && this.context !== probe) {
    setup();
    tap = this.context.createMediaStreamDestination();
    connect.call(this, tap);
    connect.call(probe.createMediaStreamSource(tap.stream), meter);
  }
  return connect.call(this, destination, ...args);
};
if (FORCE_NATIVE) {
  Object.defineProperty(window,'AudioContext',{value:undefined, configurable:true});
  Object.defineProperty(window,'webkitAudioContext',{value:undefined, configurable:true});
  const media = new WeakSet();
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function() {
    setup();
    if (!media.has(this)) {
      media.add(this);
      const decoded = probe.createMediaElementSource(this);
      connect.call(decoded, meter); connect.call(decoded, probe.destination);
    }
    return play.call(this);
  };
}
"""


def check_audio(browser, url, fallback):
    page = browser.new_page(viewport={"width": 393, "height": 852},
                            is_mobile=True, has_touch=True, reduced_motion="reduce")
    page.add_init_script(PROBE.replace("FORCE_NATIVE", "true" if fallback else "false"))
    failures, waves = [], []
    page.on("pageerror", lambda error: failures.append(str(error)))
    page.on("request", lambda req: waves.append(req.url) if ".wav" in req.url else None)
    assert page.goto(url).ok
    expect(page.locator("#sound")).to_have_attribute("aria-pressed", "false")
    assert not waves, "Audio was requested before opt-in"

    def level():
        return page.evaluate("Math.max(0,...window.levels)")

    def activate(selector, name, expected=True):
        page.evaluate("window.levels=[]")
        target = page.locator(selector) if isinstance(selector, str) else selector
        target.tap()
        page.wait_for_timeout(530)
        peak_rms = level()
        if expected:
            assert peak_rms > .034, (name, peak_rms)
        elif name == "disabled cue":
            assert peak_rms < .001, (name, peak_rms)
        return peak_rms

    peaks = [activate("#sound", "enable")]
    expect(page.locator("#sound")).to_have_attribute("aria-pressed", "true")
    page.wait_for_timeout(800)
    page.evaluate("window.levels=[]")
    page.wait_for_timeout(200)
    air_level = level()
    assert .001 < air_level < .035, ("garden air", air_level)
    peaks.append(activate("#chapters", "open chapters"))
    peaks.append(activate('[data-page="4"]', "enter bouquet"))
    for selector in ['[data-flower="daisy"]','[data-flower="white-lily"]','[data-bq-action="arrange"]',
                     '[data-bq-action="undo"]','[data-bq-action="wrap"]']:
        peaks.append(activate(selector, selector))
    for kind in ("paper","pattern","ribbon"):
        peaks.append(activate(page.locator(f'button[data-{kind}][aria-pressed="false"]').first, kind))
    for selector in ['[data-bq-action="next"]','.ks-open','.ks-back','.ks-open','.ks-next',
                     '[data-key="bug"] > rect','[data-key="strawberry"] > rect','.ks-discovery-actions .ks-action']:
        peaks.append(activate(selector, selector))
    page.locator("#sound").tap()
    page.wait_for_timeout(260)
    expect(page.locator("#sound")).to_have_attribute("aria-pressed", "false")
    activate("#chapters","disabled cue",False)
    assert bool(waves) == fallback, waves
    assert not failures, failures
    print(f"{'Native WAV' if fallback else 'Web Audio'}: {len(peaks)} cues measured, "
          f"lowest cue peak RMS {min(peaks):.3f}, ambient {air_level:.3f}, muted {level():.5f}",
          flush=True)
    page.close()


def check_native_recovery(browser, url):
    page = browser.new_page(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
    page.add_init_script("""
      window.players = []; window.blocked = true; window.testHidden = false;
      Object.defineProperty(window,'AudioContext',{value:undefined});
      Object.defineProperty(window,'webkitAudioContext',{value:undefined});
      Object.defineProperty(document,'hidden',{get:()=>window.testHidden});
      const nativePlay = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function() {
        if (!players.includes(this)) players.push(this);
        return blocked ? Promise.reject(new DOMException('blocked','NotAllowedError')) : nativePlay.call(this);
      };
    """)
    page.goto(url)
    button = page.locator("#sound")
    button.tap()
    expect(button).to_have_attribute("aria-label", "Try sound again")
    assert page.evaluate("players.every(a=>a.paused && a.muted)")
    page.evaluate("blocked=false")
    button.tap()
    expect(button).to_have_attribute("aria-pressed", "true")
    page.locator("#chapters").tap()
    page.locator('[data-page="6"]').tap()
    page.locator('[data-key="strawberry"] > rect').tap()
    page.wait_for_function("""players.some(a=>a.src.endsWith('/strawberry.wav') &&
                                              a.currentTime>0 && !a.paused && !a.error)""")
    page.evaluate("testHidden=true; document.dispatchEvent(new Event('visibilitychange'))")
    assert page.evaluate("players.every(a=>a.paused && a.muted)")
    page.evaluate("testHidden=false; document.dispatchEvent(new Event('visibilitychange'))")
    expect(button).to_have_attribute("aria-pressed", "true")
    button.tap()
    assert page.evaluate("players.every(a=>a.paused && a.muted)")
    for _ in range(4):
        button.tap()
    expect(button).to_have_attribute("aria-pressed", "false")
    page.close()
    print("Native playback, blocked-start retry, tab visibility, repeated toggles: PASS", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url")
    args = parser.parse_args()
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for native in (False, True):
            check_audio(browser, args.url, native)
        check_native_recovery(browser, args.url)
        browser.close()
        browser = pw.webkit.launch()
        check_native_recovery(browser, args.url)
        browser.close()
