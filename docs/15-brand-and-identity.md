# 15 — Brand and Identity

Status: DRAFT v0.1
Owner: Founder
Depends on: [00-vision-and-positioning.md](00-vision-and-positioning.md)
Last updated: 2026-09-24

---

## 1. Recommendation: Reorder Green

**Primary colour: `#0B5D4F` — deep teal-green.**
**Accent: `#F2A93B` — Signal Amber.**

The palette is already implemented in the site stylesheet, so this document records the decision
rather than proposing one that still has to be applied.

## 2. Why green, and why this green

| Reason | Detail |
|---|---|
| It carries the meaning | Restocking is about supply, freshness and stock on the shelf. Green reads as supply and availability without needing a caption |
| It fits the categories | A pharmacy, a supermarket and a provisions shop can all sit under the same colour; amber alone would read as pure retail/consumer |
| It avoids the crowded lane | Nigerian financial and logistics branding leans heavily on blue. Teal-green is adjacent enough to feel institutional and distinct enough to be remembered |
| It holds up as infrastructure | A deep, low-chroma green reads as infrastructure and utility. A bright lime or a mid-green reads as a consumer app |
| It works under amber | The accent only functions as a signal if the base is dark enough to make it pop |

Signal Amber is not decoration. It marks the moment the product exists for — the reorder signal: the
low-stock flag, the call to action, the internal-draft notice. If amber starts appearing as general
decoration, the signal stops meaning anything.

## 3. Palette

| Token | Hex | Role |
|---|---|---|
| Reorder Green | `#0B5D4F` | Primary. Buttons, links, active navigation, brand mark |
| Green (pressed) | `#08423A` | Hover and active states |
| Green (deep) | `#06302A` | Hero background, dark surfaces |
| Green (tint) | `#E6F1EE` | Selected rows, callout backgrounds |
| Signal Amber | `#F2A93B` | Reorder signal, primary call to action, draft notice |
| Amber (tint) | `#FDF3E2` | Callout background |
| Ink | `#0F1A17` | Primary text |
| Ink (secondary) | `#46574F` | Body copy |
| Ink (muted) | `#62736D` | Labels, metadata |
| Mist | `#F5F8F7` | Page and panel background |
| Line | `#DEE7E4` | Borders and dividers |
| Mint | `#8FD3C2` | Small accents on dark surfaces only |

Dark theme tokens are defined alongside these in the site stylesheet; the dark theme raises the
primary to `#56C2A6` so that green text stays legible on a near-black background.

## 4. Accessibility

Contrast ratios measured against their intended background. Everything here meets WCAG AA, and the
main pairings meet AAA.

| Pairing | Ratio | Grade |
|---|---|---|
| Ink `#0F1A17` on white | 17.8:1 | AAA |
| Reorder Green `#0B5D4F` on white | 7.8:1 | AAA |
| White on Reorder Green | 7.8:1 | AAA |
| Ink on Signal Amber | 8.9:1 | AAA |
| Mint on deep green | 8.4:1 | AAA |
| Amber on deep green | 7.2:1 | AA |
| Muted `#62736D` on white | 5.0:1 | AA |

**Hard rule:** amber is never used as text on a light background. `#F2A93B` on white is 2.0:1 and is
not readable. Amber is a fill, a rule or an icon, always carrying dark ink on top of it.

## 5. Typography

The site uses the system UI stack — `"Segoe UI"` on Windows, the platform default elsewhere — with a
monospace stack for identifiers such as `FR-RSS-004`. No webfont is loaded, which keeps the pages
fast on the low-bandwidth connections this business depends on. If a brand typeface is chosen later,
it must be served locally rather than from a third-party font host, for the same reason.

## 6. Logo

The mark is a two-arrow cycle in a rounded square: an unbroken loop, half amber and half mint, which
is the product's actual claim — the loop from sale to delivered restock never stops. It is drawn in
SVG and has no photographic or gradient dependencies, so it stays sharp at every size and costs
nothing to load.

## 7. Usage rules

1. Green is the brand; amber is the signal. Do not swap their roles.
2. Never put amber text on a light background. Use ink on an amber fill instead.
3. Keep the deep green for large surfaces and the primary green for interactive elements.
4. Do not tint white text on green with opacity below 85%; it reads as disabled.
5. Use one accent per screen. A page with three amber elements has no signal.
6. On printed material, print the deep green as a solid, not a gradient, and give the document a
   white margin.

## 8. What was deliberately avoided

| Avoided | Why |
|---|---|
| A bright or lime green | Reads as a consumer app, not supply infrastructure |
| Pure blue | The default for the sector, and therefore invisible |
| Red as a primary | Reserved for genuine failure states, not branding |
| Gradients in print or the logo | Reproduce badly and add cost |
| Web fonts from third-party hosts | Blocks rendering on poor connections |
