# Migration Runbook — wbic.aiwbic.cloud → wbic.nl

Dit runbook beschrijft de cutover van de staging host `wbic.aiwbic.cloud`
(die al draait op Hostinger VPS **VM 1327966**, project `wbic-nl`) naar
het productiedomein **wbic.nl**.

> Status: *voorbereiding gereed, cutover nog NIET uitgevoerd.*
> Alle code-, compose- en SEO-wijzigingen staan op branch
> `feat/migrate-to-wbic-nl`.

---

## 0. Context

| Item | Waarde |
|---|---|
| Hostinger VPS | VM 1327966 (project `wbic-nl`) |
| Reverse proxy | Traefik (label-based, netwerk `n8n_default`) |
| Staging host | `wbic.aiwbic.cloud` — DNS bij Hostinger (zone `aiwbic.cloud`) |
| Target host | `wbic.nl` (+ `www.wbic.nl`) |
| Repo | `awalania-creator/wbic-nl` (branch `main`) |
| TLS | Let's Encrypt via Traefik `mytlschallenge` resolver |
| Backend | Node/Express `wbic-api` — CORS + Turnstile + SMTP |
| Canonical policy | apex (`wbic.nl`), `www` → 301 → apex |

### Inventarisatiebevindingen (snapshot datum: 2026-04-08)

- **`wbic.nl` zit NIET in het Hostinger DNS-beheer.** `DNS_getDNSRecordsV1`
  levert een lege lijst; `domains_getDomainListV1` bevat het domein niet.
  → Het domein staat bij een externe registrar / DNS-provider.
  **De DNS-flip moet daar gebeuren, niet in hPanel.**
- **`wbic.aiwbic.cloud` bestaat wel in zone `aiwbic.cloud`:**
  `wbic  A  76.13.13.26  ttl 300`. Dit is de huidige VPS-IP waarnaar
  `wbic.nl` ook zal moeten wijzen.
- **`docker-compose.yml`** bevatte één Traefik router die alleen op
  `Host(\`wbic.aiwbic.cloud\`)` matchte. Dat is op deze branch uitgebreid
  naar een multi-host rule (`wbic.nl` + `www.wbic.nl` + legacy).
- **`backend/server.js`** CORS whitelistte `wbic.nl` en
  `wbic.aiwbic.cloud` al — geen codewijziging nodig.
- **`contact.html`** gebruikt nu nog de Turnstile *test* sitekey
  `1x00000000000000000000AA`. Productie-sitekey moet bij cutover via de
  env-var `TURNSTILE_SITEKEY` worden geïnjecteerd (compose doet een
  `sed`-vervanging aan de container-start).
- **`index.html` / `contact.html`** hebben `og:url` en
  schema.org `url` al hardcoded op `https://wbic.nl/` — dus SEO tags
  zijn al juist; geen template-gymnastiek nodig.

---

## 1. Pre-cutover checklist

Loop deze lijst **twee werkdagen vóór cutover** door:

- [ ] **VPS snapshot gemaakt** via
      `mcp__hostinger-mcp__VPS_createSnapshotV1` (of hPanel) —
      *verplicht vóór iedere destructieve operatie op de VPS.*
- [ ] **Backup** van `/docker/wbic-nl/.env` op de VPS (bevat
      `TURNSTILE_SECRET`, SMTP-credentials) naar een kluis.
- [ ] **Productie Turnstile-keys beschikbaar** (sitekey **en** secret),
      domain-bound aan `wbic.nl` en `www.wbic.nl`. Vraag aan bij
      Cloudflare dashboard → Turnstile → Add site.
- [ ] **DNS-toegang** bij de huidige registrar van `wbic.nl`
      geverifieerd (login test).
- [ ] **TTL verlagen** van bestaande `wbic.nl` A/AAAA records naar
      **300 s** (of lager). Doe dit **minimaal 24 u** vóór cutover,
      zodat de oude waarde snel verdwijnt.
- [ ] **Huidige `wbic.nl` configuratie** gedocumenteerd:
      registrar, nameservers, A, AAAA, MX, TXT (SPF/DKIM), CAA.
      Zet ze in een tekstbestand — nodig voor rollback.
- [ ] **Mail (MX / SPF / DKIM / DMARC) mag NIET wijzigen** — alleen de
      webrecords. Noteer MX/TXT en zet ze exact zo terug of laat ze
      ongewijzigd bij de registrar.
- [ ] **PR `feat/migrate-to-wbic-nl` goedgekeurd** (maar nog niet
      gemerged — merge is onderdeel van cutover).
- [ ] **Monitoring-venster** geblokkeerd (1 uur) waarin je actief kijkt.
- [ ] **Rollback-plan** (zie §4) uitgeprint / bij de hand.

---

## 2. Te zetten DNS-records bij de registrar van `wbic.nl`

Doel-IP van de VPS: **`76.13.13.26`** *(te verifiëren met
`dig +short wbic.aiwbic.cloud` — dit is dezelfde machine)*.

| Naam | Type | Waarde | TTL |
|---|---|---|---|
| `@` (apex) | A | `76.13.13.26` | 300 |
| `www` | A | `76.13.13.26` | 300 |
| `@` | AAAA | *(zet alleen als Traefik op IPv6 luistert — standaard NIET nodig)* | 300 |
| `@` | CAA | `0 issue "letsencrypt.org"` | 3600 |
| `@` | MX | **LATEN STAAN zoals nu** — niet aanraken | — |
| `@` | TXT (SPF) | **LATEN STAAN zoals nu** | — |
| `_dmarc` | TXT | **LATEN STAAN zoals nu** | — |

> ⚠️ Zet geen CNAME op de apex (niet toegestaan door DNS-spec als er
> ook MX/NS records op de apex staan). Gebruik een A-record.

---

## 3. Cutover volgorde

Tijdsvenster: **30 – 60 minuten actieve aanwezigheid**, daarna nog
24 u passieve monitoring.

1. **Snapshot VPS** (als dit nog niet gedaan is).
   ```text
   Hostinger MCP: VPS_createSnapshotV1  virtualMachineId=1327966
   ```
2. **Prod Turnstile keys opslaan** in `/docker/wbic-nl/.env` op de VPS:
   ```bash
   TURNSTILE_SECRET=<prod-secret>
   TURNSTILE_SITEKEY=<prod-sitekey>
   ALLOWED_ORIGINS=https://wbic.nl,https://www.wbic.nl,https://wbic.aiwbic.cloud
   PRIMARY_DOMAIN=wbic.nl
   ```
3. **Merge PR `feat/migrate-to-wbic-nl` → main** (squash).
4. **Pull & restart** op de VPS in `/docker/wbic-nl/`:
   ```bash
   cd /docker/wbic-nl
   git pull --ff-only origin main
   docker compose pull
   docker compose up -d
   docker compose logs -f --tail=200 wbic-web wbic-api
   ```
   Verifieer dat Traefik nu ook labels `wbic.nl` en `www.wbic.nl`
   heeft geaccepteerd (`docker compose logs traefik` — zoek naar
   `wbic-www`).
5. **Smoke-test via Host-header** (DNS nog niet omgezet):
   ```bash
   curl -s -H "Host: wbic.nl" https://76.13.13.26/ --resolve wbic.nl:443:76.13.13.26 -k | head
   curl -s -H "Host: www.wbic.nl" -I https://76.13.13.26/ --resolve www.wbic.nl:443:76.13.13.26 -k
   ```
   Verwacht: apex 200, www 301 → `https://wbic.nl/...`.
6. **DNS flip** bij de externe registrar (zie §2).
7. **Wacht op propagatie**: `dig +short wbic.nl @1.1.1.1` en
   `dig +short wbic.nl @8.8.8.8` tot beide `76.13.13.26` tonen.
   Met TTL 300 duurt dit doorgaans 5 – 15 min.
8. **SSL**: Traefik vraagt automatisch via ACME nieuwe certificaten aan
   voor `wbic.nl` en `www.wbic.nl` zodra de DNS wijst. Volg:
   ```bash
   docker compose logs -f traefik | grep -i -E 'wbic\.nl|acme|certificate'
   ```
   Verwacht: `Obtained certificate` voor beide hosts binnen ~1 min.
9. **Post-flip smoke-tests** (zie §5).
10. **Oude host op 301**: *pas ná bevestiging dat wbic.nl stabiel is*
    kan `wbic.aiwbic.cloud` op een 301-redirect naar `https://wbic.nl`
    gezet worden. Voeg een aparte Traefik router + redirect-middleware
    toe in een vervolg-PR. **Niet in deze PR** — we willen staging
    tijdens cutover nog actief kunnen bereiken voor debugging.
11. **Google Search Console**: submit `https://wbic.nl/sitemap.xml` en
    verwijder `wbic.aiwbic.cloud` eigendom (of laat deze staan voor
    noindex-verificatie).

---

## 4. Rollback-plan

Trigger-criteria: TLS cert komt niet binnen 15 min, apex serveert 5xx
> 5 % van requests, of contact-formulier werkt niet na 2 herstelpogingen.

1. **DNS terug**: zet `wbic.nl` A-records terug naar de originele
   waarde (uit §1 checklist). TTL 300 zorgt dat dit binnen ~15 min
   propageert.
2. **Turnstile terug**: zet op de VPS in `/docker/wbic-nl/.env` de
   `TURNSTILE_SITEKEY` en `TURNSTILE_SECRET` terug naar de test- /
   oude waarden en `docker compose up -d wbic-web wbic-api`.
3. **Compose terug** (alleen als multi-host config problemen geeft):
   ```bash
   cd /docker/wbic-nl
   git checkout <pre-merge-SHA> -- docker-compose.yml
   docker compose up -d
   ```
4. **VPS snapshot restore** alleen als laatste redmiddel via
   `mcp__hostinger-mcp__VPS_restoreSnapshotV1`.
5. **Rapporteer incident** in GitHub-issue met timestamps en logs.

---

## 5. Post-cutover verificatie

Alle checks moeten ✅ zijn vóór je het venster sluit:

```bash
# 1. DNS
dig +short wbic.nl
dig +short www.wbic.nl

# 2. TLS
echo | openssl s_client -servername wbic.nl -connect wbic.nl:443 2>/dev/null \
  | openssl x509 -noout -subject -dates -issuer
echo | openssl s_client -servername www.wbic.nl -connect www.wbic.nl:443 2>/dev/null \
  | openssl x509 -noout -subject -dates -issuer

# 3. HTTP
curl -sI https://wbic.nl/ | head
curl -sI https://www.wbic.nl/   # verwacht 301 → https://wbic.nl/
curl -s  https://wbic.nl/robots.txt
curl -s  https://wbic.nl/sitemap.xml | head

# 4. API health
curl -s https://wbic.nl/api/../health || curl -s https://wbic.nl/health
curl -sI -X OPTIONS https://wbic.nl/api/contact \
  -H "Origin: https://wbic.nl" -H "Access-Control-Request-Method: POST"

# 5. OG / canonical
curl -s https://wbic.nl/ | grep -E 'og:url|canonical'

# 6. Turnstile
# Open https://wbic.nl/contact.html → widget moet laden, niet de test-placeholder.
# Check browser devtools console: geen CSP/CORS errors.

# 7. Contact form end-to-end
# Verstuur een echt testbericht via wbic.nl/contact.html en verifieer
# ontvangst op info@wbic.nl.
```

Optioneel:
- https://www.ssllabs.com/ssltest/analyze.html?d=wbic.nl  → minimaal A.
- https://securityheaders.com/?q=wbic.nl  → minimaal B.
- Lighthouse run vanuit een clean Chrome profile.

---

## 6. Gebruikersacties vereist (handmatig, niet automatiseerbaar)

1. **Turnstile prod sitekey + secret** aanvragen bij Cloudflare,
   gebonden aan `wbic.nl` en `www.wbic.nl`.
2. **Inloggen bij de registrar van wbic.nl** en de A-records zetten
   volgens §2. *(Hostinger MCP kan dit niet doen — domein ligt buiten
   Hostinger.)*
3. **TTL 24 u vóór cutover verlagen** naar 300.
4. **VPS-snapshot bevestigen** (of opdracht geven aan de agent om hem
   aan te maken via `VPS_createSnapshotV1`).
5. **MX / SPF / DMARC bevestigen** dat ze exact blijven staan zoals ze
   nu zijn — mail mag niet breken.
