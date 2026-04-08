# WBIC.nl — Huisstijl v1.0

Versie 1.0 — brand guide voor de publieke website [wbic.nl](https://wbic.nl), vastgelegd op basis van de live codebase (`index.html`, `contact.html`, `styles.css`) van de repository `awalania-creator/wbic-nl` (branch `main`).

Deze huisstijl documenteert hoe WBIC zich visueel en verbaal presenteert: een warm, vertrouwd en professioneel merk dat publieke organisaties helpt bij digitale transformatie. Het palet is bewust rustig en aards — de kleuren zijn afgeleid van natuurlijke beige- en crèmetinten die afstand nemen van de gebruikelijke "govtech blauw" look, zonder de professionaliteit te verliezen die publieke opdrachtgevers verwachten.

---

## 1. Merkprincipes

### 1.1 Positionering

WBIC is een strategisch consultancybureau voor publieke vraagstukken. De kernbelofte, letterlijk zoals verwoord op de homepage:

> "Digitale dienstverlening die past bij uw gemeente — en uw inwoner."

> "Wij helpen publieke organisaties bij digitale transformatie — van strategie en informatiearchitectuur tot aanbesteding en daadwerkelijke realisatie. Geen rapport dat in een lade verdwijnt, maar software en processen die aansluiten op hoe uw organisatie écht werkt, met de inwoner als uitgangspunt."

### 1.2 Kernwaarden

De visuele taal en copy zijn gebouwd rond vijf kernwaarden:

1. **Vertrouwd** — 20+ jaar ervaring bij de overheid, herkenbare uitstraling voor publieke opdrachtgevers.
2. **Menselijk** — warme kleuren (beige, crème) in plaats van klinisch wit of corporate blauw.
3. **Pragmatisch** — "We adviseren niet alleen, we bouwen mee."
4. **Toegankelijk** — respect voor `prefers-reduced-motion`, WCAG-contrast, skip-links.
5. **Rustig & geconcentreerd** — zachte achtergrondanimaties, geen harde accenten, ruime witruimte.

### 1.3 Tone of voice

- Nederlandstalig, formeel maar benaderbaar (u-vorm bij zakelijke doelgroep).
- Korte zinnen afgewisseld met langere, verhalende zinnen.
- Accent op concrete uitkomsten ("werkende oplossing", "aansluit op hoe uw organisatie écht werkt") in plaats van buzzwords.
- Geen emoji, geen uitroeptekens, geen Engels jargon tenzij onvermijdelijk.

---

## 2. Logo

### 2.1 Primaire logo

Het WBIC-logo is beschikbaar als PNG en wordt in alle HTML-pagina's geladen vanaf de WordPress media library:

```
https://wbic.nl/wp-content/uploads/2025/06/ashion-Brand-Art-Design-Logo-5.png
```

Het logo wordt ook ingezet als `favicon`, `apple-touch-icon`, en `og:image`. Dat betekent: één bronbestand dekt alle contexten — van browsertab tot LinkedIn-previews.

### 2.2 Gebruik in de navigatie

In `styles.css`:

```css
.nav .brand img { height: 56px; width: auto; transition: opacity .3s ease; }
```

Op mobiel (`max-width: 640px`) schaalt het logo terug naar `44px`. Witruimte rondom het logo wordt bepaald door de navigatie-padding (`24px 32px` op desktop, `20px 18px` op mobiel).

### 2.3 Gebruik in de intro-animatie

Bij eerste bezoek wordt het logo groot centraal gepresenteerd (`260px`, op mobiel `200px`) en glijdt daarna via WAAPI (Web Animations API) naar de exacte positie van het nav-logo. De exacte target-positie wordt runtime gemeten via `getBoundingClientRect()` — dit voorkomt een "two-step jump" bij verschillende vensterformaten. Zie `index.html`, IIFE onderaan de pagina.

### 2.4 Minimum witruimte en schaal

| Context | Hoogte | Bron |
|---|---|---|
| Desktop-navigatie | 56 px | `styles.css` (`.nav .brand img`) |
| Mobiele navigatie | 44 px | `styles.css` media query `max-width: 640px` |
| Intro-animatie desktop | 260 px | `styles.css` (`.intro-logo`) |
| Intro-animatie mobiel | 200 px | `styles.css` media query `max-width: 640px` |
| Client-marquee logo's | 56 px (grijs, 75% opacity) | `index.html` inline `.logo-track img` |

### 2.5 Do en Don't

- **Do**: gebruik het logo altijd op een lichte achtergrond (`--cream` of `--white`). Zorg voor minimaal 16 px witruimte rondom.
- **Do**: laat het logo in de navigatie bij scrollen meebewegen (sticky niet nodig — de nav is relative gepositioneerd).
- **Don't**: plaats het logo niet op een donkere achtergrond zonder inversie-variant (er is momenteel geen dark-mode variant in de repo).
- **Don't**: wijzig de kleuren van het logo of voeg effecten toe — de drop-shadow bij de intro-animatie is de enige toegestane variatie en wordt door WAAPI gecontroleerd.
- **Don't**: schaal het logo kleiner dan 44 px hoogte; onder die maat wordt de merknaam onleesbaar.

---

## 3. Kleurenpalet

Alle kleuren zijn vastgelegd als CSS custom properties in `:root` van `styles.css`. Dit is de single source of truth — pas nooit hex-waardes aan in componenten, gebruik altijd de tokens.

### 3.1 Primair palet — inkt en crème

| Token | Hex | RGB | Toepassing |
|---|---|---|---|
| `--ink` | `#141413` | 20, 20, 19 | Primaire tekstkleur, primaire button, nav-links, logo drop-shadow basis |
| `--ink-soft` | `#3a3a37` | 58, 58, 55 | Tekst in bullet-lijsten (minder dominant dan body-tekst) |
| `--cream` | `#faf9f5` | 250, 249, 245 | Bodykleur, "theme-color" meta tag, achtergrond van alle pagina's |
| `--offwhite` | `#f5f1e6` | 245, 241, 230 | Secundaire achtergrondlaag in de mesh-gradient |
| `--white` | `#ffffff` | 255, 255, 255 | Kaartachtergronden, form-fields, contact-meta items |

### 3.2 Beige-familie — merkaccent

De beige-familie is de kern van de WBIC-identiteit. Deze kleuren vervangen wat bij andere consultancymerken een "accent-blauw" of "accent-oranje" zou zijn. Ze worden ingezet voor hover states, gradients, focus-rings en alle subtiele accenten.

| Token | Hex | RGB | Toepassing |
|---|---|---|---|
| `--beige` | `#cabb9f` | 202, 187, 159 | Primaire accentkleur, achtergrond-orbs, gradient-start card-icons |
| `--beige-deep` | `#b8a583` | 184, 165, 131 | Hover-kleur voor primaire button en links, actieve nav-link, focus-ring kleur, bullet-accent |
| `--beige-soft` | `#e6dcc6` | 230, 220, 198 | CTA-strip gradient, mesh-gradient laag |
| `--beige-mist` | `#f1e9d4` | 241, 233, 212 | Lichtste beige, mesh-gradient basis |

### 3.3 Neutralen — muted en lijnen

| Token | Hex / waarde | Toepassing |
|---|---|---|
| `--muted` | `#69727d` | Secundaire tekst (lead paragrafen, labels), copy in trust strip en card p-tags |
| `--soft` | `#9aa3ad` | Tertiaire tekst (footer, eyebrow-labels, trust `.label`) |
| `--line` | `rgba(20,20,19,0.08)` | Standaard 1px borders voor cards, form fields, bullets |
| `--line-strong` | `rgba(20,20,19,0.14)` | Sterkere borders voor input fields in het contactformulier |

### 3.4 Gradient-recept voor de "grad" tekst

De accenttekst (`.hero h1 .grad`) gebruikt een geanimeerde linear-gradient. Houd exact deze stops aan voor consistentie:

```css
background: linear-gradient(120deg, #b8a583 0%, #cabb9f 45%, #8a7a5a 80%, #b8a583 100%);
background-size: 200% 200%;
animation: gradText 9s ease-in-out infinite;
```

Het derde stop-punt `#8a7a5a` is de enige hex-kleur die buiten de tokens wordt gebruikt — houd deze alleen voor gradient-accenten.

### 3.5 Contrastverhoudingen (indicatief)

| Combinatie | Ratio | WCAG AA-tekst |
|---|---|---|
| `--ink` (#141413) op `--cream` (#faf9f5) | ~17:1 | Voldoet ruim (AAA) |
| `--muted` (#69727d) op `--cream` | ~4.7:1 | Voldoet AA voor body-tekst |
| `--soft` (#9aa3ad) op `--cream` | ~2.6:1 | **Niet voldoende voor body-tekst** — alleen gebruiken voor grote tekst (>= 18pt bold) of decoratieve labels |
| `--beige-deep` (#b8a583) op `--cream` | ~2.0:1 | **Niet voldoende voor body-tekst** — alleen als grafische accent of grote headings |

Vuistregel: voor functionele tekst gebruik `--ink`, `--ink-soft` of `--muted`. Alles zachter dan `--muted` mag alleen decoratief.

---

## 4. Typografie

### 4.1 Font-stack

Er worden twee families gebruikt, beide geladen via [fonts.bunny.net](https://fonts.bunny.net) (een privacy-vriendelijke, GDPR-conforme Google Fonts-mirror):

```html
<link href="https://fonts.bunny.net/css?family=inter:400,500,600,700|quicksand:500,600,700&display=swap" rel="stylesheet" />
```

CSS-variabelen:

```css
--font-heading: "Quicksand", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
--font-body:    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### 4.2 Toepassing

| Element | Font | Gewicht | Letter-spacing |
|---|---|---|---|
| `h1`–`h4` | Quicksand | 700 | -0.015em |
| Hero H1 `.hero h1` | Quicksand | 700 | clamp(38px, 6.4vw, 78px), line-height 1.04 |
| Hero compact H1 | Quicksand | 700 | clamp(34px, 5vw, 60px) |
| Section H2 | Quicksand | 700 | clamp(30px, 3.8vw, 46px) |
| Card H3 | Quicksand | 700 | 20px |
| Body (`body`) | Inter | 400 | 16px, line-height 1.6 |
| Lead paragraph `.hero p.lead` | Inter | 400 | clamp(16px, 1.5vw, 19px), line-height 1.7 |
| Nav-links | Inter | 500 | 15px |
| Buttons `.btn` | Inter | 600 | 15px |
| Eyebrow-labels | Inter | 500 | 12px uppercase, letter-spacing 0.14em |
| Trust-label | Inter | 600 | 11px uppercase, letter-spacing 0.22em |
| Footer | Inter | 400 | 13px |

### 4.3 Type-schaal met `clamp()`

De website gebruikt `clamp()` voor alle grote rubrieken zodat typografie soepel meeschaalt van mobiel tot 4K:

```css
.hero h1        { font-size: clamp(38px, 6.4vw, 78px); }
.hero.compact h1{ font-size: clamp(34px, 5vw,  60px); }
.section h2     { font-size: clamp(30px, 3.8vw, 46px); }
.hero p.lead    { font-size: clamp(16px, 1.5vw, 19px); }
.cta-strip h3   { font-size: clamp(24px, 2.8vw, 34px); }
```

Gebruik `clamp()` ook voor elke nieuwe grote rubriek. Gebruik nooit vaste px-waardes voor headings.

### 4.4 Font-smoothing

Body heeft standaard de volgende smoothing ingesteld — overschrijf dit niet:

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

---

## 5. UI-componenten

### 5.1 Buttons

Twee varianten: primary (inkt op crème, hover naar beige) en ghost (transparant met inkt-border, hover naar inkt-vulling).

```css
.btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 28px;
  border-radius: var(--radius-pill);
  font-weight: 600; font-size: 15px;
  transition: transform .25s var(--ease-out), box-shadow .25s ease,
              background .25s ease, color .25s ease, border-color .25s ease;
}
.btn-primary {
  background: var(--ink); color: var(--cream);
  border: 1px solid var(--ink);
  box-shadow: 0 16px 38px -16px rgba(20,20,19,.5);
}
.btn-primary:hover {
  transform: translateY(-2px);
  background: var(--beige-deep); border-color: var(--beige-deep);
  box-shadow: 0 22px 50px -16px rgba(184,165,131,.6);
}
.btn-ghost { background: transparent; color: var(--ink); border: 1px solid var(--ink); }
.btn-ghost:hover { background: var(--ink); color: var(--cream); }
```

Primaire CTA's gebruiken altijd een rechter-pijl als indicator: `<span aria-hidden="true">→</span>`. Dit is een Unicode-karakter, geen icon-font.

### 5.2 Cards

Gebruikt voor de dienstenpreview op de homepage. De hover-staat hijst de card 4px omhoog en fade een diagonale beige-gradient in via een `::before` pseudo-element.

```css
.card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg); /* 22px */
  padding: 32px;
  transition: transform .3s var(--ease-out), border-color .3s ease, box-shadow .3s ease;
  overflow: hidden;
}
.card::before {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(202,187,159,.18), transparent 60%);
  opacity: 0; transition: opacity .3s ease;
}
.card:hover { transform: translateY(-4px); border-color: var(--beige); box-shadow: var(--shadow-lg); }
.card:hover::before { opacity: 1; }
```

Het card-icon is een `52×52` afgeronde vierkant met een beige gradient en witte serienummer-tekst (`01`, `02`, `03`).

### 5.3 Navigatie

De hoofdnavigatie is een relative-positioned flex-container — géén sticky of fixed header. Actieve pagina's krijgen een 2px beige onderlijn via `::after`:

```css
.nav-links a.active::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; border-radius: 2px;
  background: var(--beige-deep);
}
```

### 5.4 Hero-blok

Het hero-blok combineert: een `eyebrow`-pill (kleine capitalen met pulserende beige dot), een grote H1 met gradient-accent, een lead-paragraaf in `--muted`, en een CTA-rij met primary + ghost button.

```css
.eyebrow {
  padding: 8px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(10px);
  font-size: 12px; font-weight: 500;
  color: var(--muted);
  letter-spacing: 0.14em; text-transform: uppercase;
}
.eyebrow::before {
  content: ""; width: 8px; height: 8px; border-radius: 50%;
  background: var(--beige-deep);
  box-shadow: 0 0 12px rgba(184,165,131,0.7);
  animation: pulse 2.4s ease-in-out infinite;
}
```

### 5.5 Trust strip

Subtiele grijze labelrij onder de hero. Elk item wordt ingeleid door een klein beige dotje (`::before`). Gebruik dit component voor sociale bewijsvoering zonder visuele dominantie.

### 5.6 CTA-strip

Full-width beige-gradient blok met centrale H3, body-tekst en een primary button. Een `::after` radial gradient voegt een subtiele lichtval toe vanuit de rechterbovenhoek:

```css
.cta-strip {
  background: linear-gradient(135deg, var(--beige-soft), var(--beige) 100%);
  border-radius: var(--radius-xl); /* 28px */
  padding: 60px 40px;
}
.cta-strip::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.6), transparent 50%);
}
```

### 5.7 Contactformulier

Het contactformulier staat in een `form-card`: een witte kaart met `--shadow-md`, interne padding van 36px, en labels in ALL-CAPS als micro-headers. Focus-states gebruiken een 4px beige-halo:

```css
.field input:focus, .field textarea:focus {
  outline: none;
  border-color: var(--beige-deep);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(202,187,159,.25);
}
```

Het formulier gebruikt Cloudflare Turnstile (`data-sitekey="0x4AAAAAAB7TVfNVCnvnatK_"`) als CAPTCHA en een honeypot-veld (`name="website"`) tegen bots. Zie `contact.html` voor de POST-flow naar `/api/contact`.

### 5.8 Footer

De footer is minimalistisch: een dunne topline (`border-top: 1px solid var(--line)`), gecentreerde tekst in `--soft`, en links in `--muted`. LinkedIn-icoon als inline SVG — géén icon-fonts.

---

## 6. Beeldtaal en animaties

### 6.1 Achtergrondanimatie — mesh, aurora, orbs

Elke `.stage`-container (header met hero) heeft drie lagen animatie:

1. **`.bg-mesh`** — vijf radial-gradients die 18 seconden rondshiften (`@keyframes meshShift`).
2. **`.bg-aurora`** — een conic-gradient die 28 seconden roteert, met `mix-blend-mode: multiply` en `filter: blur(60px)`.
3. **`.bg-orb.a/b/c`** — drie grote ronde blobs (820 / 900 / 600 px) die onafhankelijk driften (`drift1/2/3`, 16–24s, `alternate`).

Deze drie lagen samen creëren de "warme rust" uitstraling. Ze zijn allemaal `pointer-events: none` en `will-change: transform` geoptimaliseerd.

### 6.2 Intro-animatie — Iris Reveal (1× per sessie)

Bij eerste bezoek aan de homepage speelt een 8-seconden intro-animatie af, gescoped via `body.has-intro`:

1. **Iris-open**: een cirkel groeit vanuit het midden en opent de pagina (`@keyframes irisOpen`, 1.8s).
2. **Glow + Ring**: een radiale beige glow en een pulserende ring komen op (`glowIn`, `ringPulse`).
3. **Logo emerge**: het logo fade-in en schaalt naar 100% (`logoEmerge`).
4. **Tekst in woorden**: "Slimme consultancy voor publieke vraagstukken" verschijnt woord voor woord (`wordIn`), waarbij de laatste twee woorden beige-deep kleuren.
5. **Glide-to-nav**: via WAAPI glijdt het logo naar de exacte positie van het nav-logo en fade-out.
6. **Page rise**: nav-links, hero, trust strip rijzen omhoog (`pageRise`).

**Belangrijk**: de intro speelt maximaal één keer per tab-sessie. Een head-script zet `<html class="intro-skip">` als `sessionStorage.getItem('wbic_intro_seen') === '1'` of als `prefers-reduced-motion` actief is. De CSS regels onder `html.intro-skip` schakelen dan alle intro-elementen direct uit met `display: none !important`. Dit voorkomt elke FOUC.

### 6.3 Hover states en transitions

Standaard easing-curves zijn als tokens vastgelegd:

```css
--ease-out:  cubic-bezier(.2,.8,.25,1);
--ease-soft: cubic-bezier(.65,0,.35,1);
```

Alle interactieve elementen (buttons, cards, form-fields) gebruiken transitions van 200–300ms. Gebruik nooit langere of snellere transitions zonder goede reden.

### 6.4 Logo-marquee (clients)

De client-logo's roteren horizontaal via een CSS-only marquee:

```css
.logo-track { animation: marquee 40s linear infinite; }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.logo-marquee:hover .logo-track { animation-play-state: paused; }
```

Logo's zijn standaard `grayscale(100%)` met `opacity: .75` en kleuren + vergroten bij hover. Bij `prefers-reduced-motion` wordt de marquee uitgeschakeld en wrappen de logo's in een flexbox.

---

## 7. Layout en spacing

### 7.1 Container

```css
--container: 1200px;
.section { max-width: var(--container); margin: 0 auto; padding: 100px 24px; }
.nav      { max-width: var(--container); margin: 0 auto; padding: 24px 32px; }
.hero     { max-width: 1080px; padding: 80px 24px 100px; }
.contact-wrap { max-width: 1000px; padding: 60px 24px 100px; }
```

Alle hoofdblokken zijn horizontaal gecentreerd binnen de 1200px container. De hero is iets smaller (1080px) om de tekstregels op leesbare breedte te houden.

### 7.2 Radius-schaal

| Token | Waarde | Toepassing |
|---|---|---|
| `--radius-sm` | 10 px | Kleine elementen (skip-link focus) |
| `--radius-md` | 16 px | Form-fields, bullet-items, contact-meta |
| `--radius-lg` | 22 px | Cards, form-card container |
| `--radius-xl` | 28 px | CTA-strip |
| `--radius-pill` | 999 px | Buttons, eyebrow-pill |

### 7.3 Shadow-schaal

```css
--shadow-sm: 0 2px 8px rgba(20,20,19,0.04);
--shadow-md: 0 12px 32px -12px rgba(20,20,19,0.18);
--shadow-lg: 0 30px 60px -25px rgba(184,165,131,0.45);
```

De `--shadow-lg` gebruikt bewust een beige tint (niet zwart) om warm aan te voelen bij card-hover states.

### 7.4 Grid-systeem

Twee herbruikbare grid-utilities:

```css
.grid   { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 22px; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
```

Gebruik `.grid` voor 3-koloms preview (cards), `.grid-2` voor 2-koloms layouts.

### 7.5 Responsive breakpoints

| Breakpoint | Aanpassingen |
|---|---|
| `max-width: 1024px` | Nav-padding gereduceerd naar `22px 24px` |
| `max-width: 820px` | Contact-wrap wordt single-column |
| `max-width: 640px` | Nav-padding `20px 18px`, nav-gap `18px`, nav-logo 44px, hero padding `40px 18px 70px`, section padding `70px 18px`, CTA-strip aangepast |
| `max-width: 540px` | `.field-row` wordt single-column |

---

## 8. Toegankelijkheid

WBIC opereert in het publieke domein en moet voldoen aan WCAG 2.1 AA. De codebase bevat al een aantal structurele maatregelen:

### 8.1 Skip-link

Elke pagina begint met een skip-link naar de hoofdinhoud:

```html
<a href="#hoofdinhoud" class="skip">Direct naar inhoud</a>
```

De link is visueel verborgen (`left: -9999px`) tot hij focus krijgt, dan verschijnt hij linksboven in de viewport.

### 8.2 Focus states

Alle focus-states gebruiken `:focus-visible` met een beige outline:

```css
:focus-visible {
  outline: 2px solid var(--beige-deep);
  outline-offset: 3px;
  border-radius: 4px;
}
```

Form-fields krijgen daarnaast een 4px beige halo. Verwijder nooit focus-outlines zonder alternatief.

### 8.3 Prefers-reduced-motion

De codebase respecteert `prefers-reduced-motion: reduce` op drie niveaus:

1. **Achtergrondanimaties** (`.bg-mesh`, `.bg-aurora`, `.bg-orb`, gradient-text, eyebrow-pulse) worden uitgeschakeld.
2. **Intro-animatie** wordt volledig overgeslagen — de pagina toont direct de eindstaat.
3. **Logo-marquee** stopt en wrapt naar een statische flex-layout.

### 8.4 Semantische markup

- `<header role="banner">`, `<main id="hoofdinhoud">`, `<footer>`, `<nav aria-label="Hoofdnavigatie">`.
- Alle secties hebben `aria-labelledby` gekoppeld aan hun heading.
- Decoratieve elementen (bg-mesh, orbs, intro-animaties) hebben `aria-hidden="true"`.
- Form-labels zijn altijd gekoppeld via `<label>` wrapping.

### 8.5 Contrast

Zie paragraaf 3.5. Vuistregel: gebruik `--ink`, `--ink-soft` of `--muted` voor functionele tekst. Lichter is alleen toegestaan voor decoratieve labels of grote headings.

### 8.6 Taal

Alle pagina's declareren `<html lang="nl">`. Voeg nooit Engelse content toe zonder `lang="en"` attribuut op het betreffende element.

---

## 9. Tone of voice en copy

### 9.1 Doelgroep

Primair: IT-managers, informatiemanagers, CISO's, inkoopadviseurs en bestuurders bij gemeenten, veiligheidsregio's en semi-overheid. Secundair: commerciële dienstverleners die samenwerken met de publieke sector.

### 9.2 Taalregels

1. **U-vorm** — "past bij **uw** gemeente en **uw** inwoner". Consistente aanspreekvorm door de hele site.
2. **Nederlandstalige vaktermen** — "aanbesteding" niet "tender", "informatiearchitectuur" niet "information architecture", "programma van eisen" niet "requirements document".
3. **Concrete uitkomsten** — vermijd "we helpen bij", schrijf "we begeleiden u van programma van eisen tot werkende oplossing".
4. **Geen jargon stapelen** — één vakterm per zin, met context.
5. **Warme tussenzinnen** — bijvoorbeeld "Geen rapport dat in een lade verdwijnt". Deze menselijke touches zijn bewust onderdeel van het merk.
6. **Geen emoji** — nergens in de site.

### 9.3 Rubriekstijl

- **Eyebrow**: 1–3 woorden, ALL CAPS via CSS (`text-transform: uppercase`). Voorbeeld: "Strategisch consultancybureau".
- **H1**: één of twee regels, mag een gradient-accent bevatten op een betekenisvol woord (niet op een stopwoord).
- **H2**: maximaal 6 woorden, geen punt aan het einde.
- **Lead**: 2–4 zinnen, `--muted` kleur, max-width 720px.
- **Card H3**: naam van de dienst (max 5 woorden), geen werkwoord.
- **Card body**: 1–2 zinnen, concreet over de uitkomst.

### 9.4 CTA-copy

| Plek | Tekst |
|---|---|
| Primaire hero-CTA | "Plan een kennismaking →" |
| Secundaire hero-CTA | "Bekijk diensten" |
| Sectie-CTA (diensten) | "Bekijk alle diensten →" |
| CTA-strip | "Klaar om samen te werken?" / "Plan een kennismaking →" |
| Formulier-submit | "Verzenden →" |

Gebruik altijd "u"-vorm, altijd een pijl (`→`) achter de primaire actie.

---

## 10. Asset-index

### 10.1 Logobestanden

| Asset | URL / pad |
|---|---|
| Primair logo (PNG) | `https://wbic.nl/wp-content/uploads/2025/06/ashion-Brand-Art-Design-Logo-5.png` |
| Favicon | zelfde PNG, via `<link rel="icon">` |
| Apple touch icon | zelfde PNG |
| OpenGraph image | zelfde PNG |

Let op: er is momenteel géén inverted (donker) logo-variant, géén SVG, en géén losse favicon.ico. Dit is een bekend punt voor een toekomstige versie.

### 10.2 Client-logo's

Opgeslagen in `assets/clients/` in de repository:

- `gemeente-almere.png`
- `hilversum-mediastad.png`
- `veiligheidsregio-haaglanden.png`
- `centric.png`
- `gemeente-apeldoorn.png`
- `gemeente-deurne.png`

Deze worden standaard grijs (100% grayscale, 75% opacity) getoond in de marquee.

### 10.3 Fonts

Geleverd door [fonts.bunny.net](https://fonts.bunny.net), privacy-vriendelijke Google Fonts mirror:

- **Inter** — 400, 500, 600, 700
- **Quicksand** — 500, 600, 700

### 10.4 Externe diensten

| Dienst | Doel | Configuratie |
|---|---|---|
| Google Analytics | Metingen | `G-75712667` in `index.html` en `contact.html` |
| Cloudflare Turnstile | CAPTCHA | `data-sitekey="0x4AAAAAAB7TVfNVCnvnatK_"` in `contact.html` |
| fonts.bunny.net | Webfonts | via `<link href="https://fonts.bunny.net/css?family=...">` |

### 10.5 Structured data

De homepage bevat een `ProfessionalService` schema.org JSON-LD block. Houd dit gesynchroniseerd met de website-copy wanneer diensten of contactgegevens veranderen.

---

## Bijlage — bronverwijzingen

Deze huisstijl is direct afgeleid uit de volgende bestanden op `awalania-creator/wbic-nl@main`:

- `styles.css` — alle design tokens, componentstijlen en animaties
- `index.html` — hero, trust strip, diensten-preview, CTA-strip, client-marquee, intro-animatie gate en WAAPI glide
- `contact.html` — contactformulier, Turnstile-configuratie, single-column override
- `diensten.html` — dienstenoverzicht (niet visueel gewijzigd t.o.v. homepage)

Wanneer de codebase wijzigt, is deze `docs/huisstijl.md` de single source of truth die moet worden bijgewerkt. Pas nooit design-tokens aan zonder ook dit document te updaten.
