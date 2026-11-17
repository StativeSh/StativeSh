#!/usr/bin/env python3
"""Rebuild Studio Ink's generated files from its sources. Standard library only.

    python3 design-system/build.py

Sources (edit these):  tokens.json, components/bundle.src.css, components/<Name>/preview.html
Generated (don't edit): tokens.css, components/bundle.css, index.html
"""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TITLE = "Studio Ink"


def load_tokens():
    return json.loads((ROOT / "tokens.json").read_text(encoding="utf-8"))


def length(v):
    """Numbers and bare digits are px; anything with a unit stays as written."""
    v = str(v)
    return v + "px" if re.fullmatch(r"-?\d+(\.\d+)?", v) and v != "0" else v


def first_theme_value(v, theme):
    return v if isinstance(v, str) else v.get(theme, next(iter(v.values())))


def css_value(v):
    """A colour alias "{name}" becomes var(--name)."""
    m = re.fullmatch(r"\{(.+)\}", v)
    return f"var(--{m.group(1)})" if m else v


def build_tokens_css(t):
    themes = [th["id"] for th in t["color"]["themes"]]
    first = themes[0]
    out = [f"/* {TITLE} — generated from tokens.json */"]
    themed = t["color"]["tokens"] + t.get("shadow", {}).get("tokens", [])
    out.append(f':root, [data-theme="{first}"] {{')
    for tok in themed:
        out.append(f"  --{tok['name']}: {css_value(first_theme_value(tok['value'], first))};")
    out.append("}")
    for th in themes[1:]:
        lines = [f"  --{tok['name']}: {css_value(tok['value'][th])};" for tok in themed
                 if isinstance(tok["value"], dict) and th in tok["value"]]
        if lines:
            out += [f'[data-theme="{th}"] {{', *lines, "}"]
    out.append(":root {")
    for fam, toks in t.items():
        if fam in ("name", "version", "meta", "color", "type", "shadow") or not isinstance(toks, dict):
            continue
        for tok in toks.get("tokens", []):
            val = tok["value"] if fam == "opacity" else length(tok["value"])
            out.append(f"  --{tok['name']}: {val};")
    for key, stack in t["type"]["families"].items():
        out.append(f"  --font-{key}: {stack};")
    out.append("}")
    for group in t["type"]["groups"]:
        for st in group["styles"]:
            fam = st.get("family", group["family"])
            decl = [f"font-family: var(--font-{fam})", f"font-size: {length(st['fontSize'])}"]
            if "lineHeight" in st:
                decl.append(f"line-height: {st['lineHeight']}")
            if "fontWeight" in st:
                decl.append(f"font-weight: {st['fontWeight']}")
            if "letterSpacing" in st:
                decl.append(f"letter-spacing: {length(st['letterSpacing'])}")
            out.append(f".{st['name']} {{ {'; '.join(decl)}; }}")
    return "\n".join(out) + "\n"


def build_bundle_css(t):
    """bundle.src.css with each token's value added as the var() fallback, so the stylesheet
    still renders where tokens.css isn't loaded. Tokens stay the single source."""
    vals = {}
    for fam, toks in t.items():
        if isinstance(toks, dict) and "tokens" in toks:
            for tok in toks["tokens"]:
                vals[tok["name"]] = first_theme_value(tok["value"], t["color"]["themes"][0]["id"]) if fam in ("color", "shadow") else length(tok["value"]) if fam != "opacity" else tok["value"]
    for k, v in list(vals.items()):
        m = re.fullmatch(r"\{(.+)\}", str(v))
        if m:
            vals[k] = vals[m.group(1)]
    for key, stack in t["type"]["families"].items():
        vals["font-" + key] = stack
    src = (ROOT / "components" / "bundle.src.css").read_text(encoding="utf-8")
    missing = set()

    def rep(m):
        name = m.group(1)
        if name.startswith("si-"):
            return m.group(0)
        if name not in vals:
            missing.add(name)
            return m.group(0)
        return f"var(--{name},{vals[name]})"

    out = re.sub(r"var\(--([A-Za-z0-9_.-]+)\)", rep, src)
    if missing:
        raise SystemExit(f"bundle.src.css uses tokens that tokens.json doesn't define: {sorted(missing)}")
    return "/* generated from bundle.src.css and tokens.json by build.py — edit those instead */\n" + out


def summary(readme):
    body = [l for l in readme.splitlines() if l.strip() and not l.startswith("#")]
    text = body[0] if body else ""
    return re.sub(r"\*\*|`", "", text)


def fragment_parts(html):
    """Split a preview fragment into its styles, scripts and markup."""
    html = re.sub(r"^<!--.*?-->\s*", "", html, count=1, flags=re.S)
    styles = re.findall(r"<style>(.*?)</style>", html, flags=re.S)
    scripts = re.findall(r"<script>(.*?)</script>", html, flags=re.S)
    markup = re.sub(r"<style>.*?</style>|<script>.*?</script>", "", html, flags=re.S).strip()
    return styles, scripts, markup


def build_gallery():
    comps = sorted(p.parent for p in (ROOT / "components").glob("*/preview.html") if p.parent.name != "Cover")
    styles, body, scripts = [], [], []
    c_styles, c_scripts, c_markup = fragment_parts((ROOT / "components/Cover/preview.html").read_text(encoding="utf-8"))
    styles += c_styles
    scripts += c_scripts
    for comp in comps:
        name = comp.name
        readme = (comp / "README.md").read_text(encoding="utf-8") if (comp / "README.md").exists() else ""
        s, sc, markup = fragment_parts((comp / "preview.html").read_text(encoding="utf-8"))
        styles += s
        scripts += sc
        body.append(
            f'<section class="g-item" id="{name}">\n'
            f'  <header class="g-head"><h2>{name}</h2><p>{escape(summary(readme))}</p>'
            f'<a href="components/{name}/README.md">Guidelines</a></header>\n'
            f'  <div class="g-frame">\n{markup}\n  </div>\n</section>'
        )
    nav = "".join(f'<a href="#{c.name}">{c.name}</a>' for c in comps)
    js = "\n".join(f"(function(){{\n{s.strip()}\n}})();" for s in scripts)
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="studio">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITLE}</title>
<meta name="description" content="Studio Ink, the design system behind shreyaskodishala.tech: tokens, components and the StudioInk script.">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/bundle.css">
<script src="components/bundle.js"></script>
<style>
body{{margin:0;background:var(--ink);color:var(--bone);font:400 15px/1.5 var(--font-sans)}}
.g-cover{{max-width:960px;margin:0 auto;overflow:hidden}}
.g-cover>.cover{{max-width:100%}}
.g-nav{{position:sticky;top:0;z-index:30;display:flex;flex-wrap:wrap;gap:6px 18px;padding:14px max(16px,env(safe-area-inset-left,0px));background:var(--ink);border-bottom:1px solid var(--line);font:400 15px var(--font-display);text-transform:uppercase;letter-spacing:.03em}}
.g-nav a{{color:var(--bone-muted);text-decoration:none}}
.g-nav a:hover{{color:var(--red)}}
.g-item{{border-bottom:1px solid var(--line);scroll-margin-top:52px}}
.g-head{{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 18px;padding:28px max(16px,env(safe-area-inset-left,0px)) 14px}}
.g-head h2{{margin:0;font:400 34px/1 var(--font-display);text-transform:uppercase}}
.g-head p{{margin:0;flex:1 1 320px;color:var(--bone-muted);max-width:70ch}}
.g-head a{{color:var(--tan);font:400 15px var(--font-display);text-transform:uppercase;letter-spacing:.03em}}
.g-frame{{overflow:hidden}}
{chr(10).join(s.strip() for s in styles)}
</style>
</head>
<body>
<header class="g-cover">
{c_markup}
</header>
<nav class="g-nav" aria-label="Components">{nav}</nav>
<main>
{chr(10).join(body)}
</main>
<script>
{js}
</script>
</body>
</html>
"""


def main():
    t = load_tokens()
    (ROOT / "tokens.css").write_text(build_tokens_css(t), encoding="utf-8")
    (ROOT / "components" / "bundle.css").write_text(build_bundle_css(t), encoding="utf-8")
    gallery = "\n".join(line.rstrip() for line in build_gallery().splitlines()) + "\n"
    (ROOT / "index.html").write_text(gallery, encoding="utf-8")
    print("wrote tokens.css, components/bundle.css, index.html")


if __name__ == "__main__":
    main()
