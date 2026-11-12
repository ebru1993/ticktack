# TickTack

TickTack hilft Kindern, analoge und digitale Uhrzeiten zu lesen. Die Oberfläche ist auf Deutsch (Schweizer Schreibung mit ss), gross und für das iPad gemacht. Alles läuft im Browser: keine Anmeldung, keine Werbung, keine Anfragen an fremde Server.

Zwei Profile «Kind 1» und «Kind 2» sind vorausgewählt. Unter **Eltern** kannst du die Namen ändern. Fortschritt, Sterne und Sticker liegen pro Kind im `localStorage` auf dem Gerät.

## Spielen

1. `Los geht's` tippen. Das iPad erlaubt Sprache erst nach dieser Geste.
2. Ein Kind wählen.
3. Ein Level wählen und einen Modus starten.

| Modus | Aufgabe |
| --- | --- |
| Hören & Stellen | Die gesprochene Zeit an der Analoguhr stellen |
| Uhr lesen | Die passende Zeit aus vier Karten wählen (ein Tipp liest sie vor) |
| Digital zu Analog | Die Digitalzeit mit den Zeigern nachstellen |
| Analog zu Digital | Die Zeiger als Zahlen einstellen |
| Freies Spielen | Zeiger drehen, die App sagt die Zeit |

Eine Runde hat fünf Aufgaben. Der erste Versuch gibt zwei Sterne, der zweite einen. Danach gibt es einen Sticker. Acht von zehn richtigen Aufgaben im aktuellen Level öffnen das nächste.

Die Zeiten klingen umgangssprachlich: `drei Uhr`, `halb vier` (3:30), `Viertel nach drei`, `zehn vor halb vier` (3:20), `fünf nach halb vier` (3:35). Im Level 24-Stunden-Zeit kommt dazu zum Beispiel `sechzehn Uhr fünfunddreissig`, und die Analoguhr zeigt 4:35 mit Sonne oder Mond.

Der Minutenzeiger zieht den Stundenzeiger mit, wie bei einer echten Uhr. Unter **Eltern** lassen sich die Zeiger auch getrennt drehen.

## Eltern

Den Personen-Knopf drei Sekunden halten und die Rechenaufgabe lösen. Dort kann man Level öffnen, den Fortschritt löschen, die Minuten-Zahlen (5, 10, 15 …) ein- und ausschalten, das Sprechtempo und die Stimme wählen und Kinder umbenennen.

## Lokal starten

Voraussetzung: Node.js 22.

```bash
npm install
npm run dev
```

Die App liegt dann auf [http://127.0.0.1:4178](http://127.0.0.1:4178).

```bash
npm test          # Uhrzeit-Logik und deutsche Ansagen
npm run build     # statische Dateien nach dist/
npm run preview   # dist/ ansehen, Port 4181
npm run test:e2e  # eine Runde pro Modus, WebKit, iPad-Format
```

Für die End-to-End-Tests braucht Playwright den WebKit-Browser:

```bash
npx playwright install webkit
npm run build
npm run test:e2e
```

## Auf GitHub Pages

Der Build benutzt relative Pfade (`base: './'`). Dieselbe `dist/` funktioniert unter `https://<name>.github.io/<repo>/`.

### Automatisch

`.github/workflows/pages.yml` baut bei jedem Push auf `main` und veröffentlicht `dist/` auf GitHub Pages. Einmalig im Repository unter **Settings → Pages** die Quelle **GitHub Actions** wählen.

### Von Hand

```bash
npm test
npm run build
```

Den Inhalt von `dist/` auf den Branch `gh-pages` legen oder als Pages-Artefakt hochladen. Nicht den Quellordner veröffentlichen, sondern nur `dist/`.

## Offline auf dem iPad

Nach dem ersten Laden speichert der Service Worker die App. In Safari: Teilen → **Zum Home-Bildschirm**. Danach startet TickTack ohne Netz. Stimme und Töne kommen vom Gerät (Web Speech API und Web Audio), es werden keine Audiodateien geladen.

## Technik

Vite, Preact und TypeScript. Die Aussprache steckt in `src/logic/timeWords.ts` (`timeToGermanWords`). Manifest und Service Worker erzeugt `vite-plugin-pwa`.
