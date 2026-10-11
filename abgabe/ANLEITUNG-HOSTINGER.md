# Website bei Hostinger hochladen

## Vorher: 3 Dinge erledigen
1. **Impressum ausfüllen:** `impressum.html` mit einem Texteditor öffnen und alle `[ECKIGEN KLAMMERN]` ersetzen (Inhaber, Adresse, Erlaubnisbehörde, ggf. USt-IdNr.).
2. **Datenschutz ausfüllen:** in `datenschutz.html` Inhaber, Adresse und Datum („Stand“) eintragen.
3. **Fotos (optional):** `hero-fahrstunde.jpg` und `ladenfront.jpg` in den Ordner `bilder/` legen. Ohne Fotos zeigt die Seite automatisch eine Grafik.

> **Ohne Impressum und Datenschutz darf die Seite in Deutschland nicht online gehen.**

## Hochladen (ca. 5 Minuten)
1. Bei **hpanel.hostinger.com** einloggen.
2. **Websites** → bei der Domain `driveinwalle.de` auf **Dashboard**.
3. **Dateien** → **Dateimanager** öffnen.
4. In den Ordner **`public_html`** wechseln.
5. Falls dort alte Dateien liegen (z. B. `default.php` oder eine alte Seite): sichern und löschen.
6. Oben auf **Hochladen** → `drive-in-walle-website.zip` auswählen.
7. Rechtsklick auf die ZIP-Datei → **Entpacken** → Ziel `public_html` (direkt, kein Unterordner).
8. Die ZIP-Datei danach löschen.

Danach muss `public_html` so aussehen:
```
public_html/
├── .htaccess
├── index.html
├── impressum.html
├── datenschutz.html
├── 404.html
├── styles.css
├── script.js
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── fonts/
└── bilder/
```

## Nach dem Hochladen
- **SSL einschalten:** hPanel → **Sicherheit** → **SSL** → für die Domain aktivieren (bei Hostinger kostenlos). Die `.htaccess` leitet danach alles automatisch auf `https://www.driveinwalle.de` um.
- **Testen:** Seite am Handy und am PC öffnen, Anruf- und WhatsApp-Button antippen, Impressum und Datenschutz anklicken.
- **Google:** In der Google Search Console die Sitemap `https://www.driveinwalle.de/sitemap.xml` einreichen.

## Wenn etwas nicht klappt
- **Seite zeigt nur Text ohne Design:** Die Dateien liegen in einem Unterordner. Alles direkt nach `public_html` verschieben.
- **Weiterleitungsschleife oder Fehler 500:** `.htaccess` vorübergehend umbenennen (z. B. in `htaccess-aus.txt`) und SSL prüfen.
- **`.htaccess` nicht sichtbar:** Im Dateimanager „Versteckte Dateien anzeigen“ aktivieren.
- **Andere Domain als driveinwalle.de:** In `.htaccess`, `index.html` (canonical, og:url), `robots.txt` und `sitemap.xml` die Domain ersetzen.
