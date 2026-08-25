# Abnahme-Checkliste

Diese Checkliste wird in der Abnahme-Umgebung mit ArcGIS Experience Builder Developer Edition 1.17 und ArcGIS Enterprise 11.5 durchgeführt.

## Vorbereitung

- [ ] Branch `development` ist in den Widget-Ordner der Abnahme-Umgebung kopiert.
- [ ] Das Widget erscheint im Builder und lässt sich einer Experience hinzufügen.
- [ ] Eine Karte ist verbunden und mindestens ein Service ist vollständig konfiguriert.
- [ ] Der Testservice ist für die Benutzerrolle der Abnahme erreichbar.

## Konfiguration im Builder

- [ ] Map-Selector speichert die gewählte Karte.
- [ ] Dienste können hinzugefügt, geändert und entfernt werden.
- [ ] Nach fünf Diensten ist der Hinzufügen-Button deaktiviert und ein Hinweis sichtbar.
- [ ] Ungültige Layer-URLs, unzulässige Feldnamen und ungültige URL-IDs führen zur lokalisierten Konfigurationsmeldung, nicht zu einem Absturz.
- [ ] Die Settings sind bei hellem und dunklem SharedTheme lesbar.
- [ ] Deutsch verwendet die Schreibweise `ss`; Französisch und Englisch enthalten alle Labels.

## Suche und Karte

| Testfall | URL/Setup | Erwartetes Resultat |
| --- | --- | --- |
| Erfolgreicher Treffer | `?sc_search_id=parzelle&sc_search_val=<Wert>` | Ladeindikator, Highlight, Zoom und Standard-Popup des Service erscheinen. |
| Auswahl aufheben | Popup eines erfolgreichen Treffers schliessen | Die vom Widget erzeugte Markierung wird entfernt; fremde Kartengrafiken bleiben erhalten. |
| Kein Treffer | Gültiger Dienst, unbekannter Wert | Lokalisierte Meldung; keine Highlight-Grafik bleibt sichtbar. |
| Fehlende Kartenbindung | Widget ohne Karte | Freundliche Meldung „Bitte Karte wählen“. |
| Ungültige Konfiguration | Fehlende URL, Feld oder URL-ID | Lokalisierte Konfigurationsmeldung; keine Anfrage wird ausgeführt. |
| Sonderzeichen | Suchwert mit Apostroph, z. B. `O'Connor` | Suche bleibt stabil; keine fehlerhafte SQL-Abfrage. |
| LIKE-Sonderzeichen | Suchwert mit `%`, `_` oder `\` | Zeichen werden als Text gesucht; die Abfrage liefert nicht ungewollt alle Objekte. |
| Suchwert-Limit | Suchwert mit mehr als 256 Zeichen | Lokalisierte Meldung; keine Service-Abfrage wird ausgeführt. |
| HTTPS-Erzwingung | Konfiguration mit `http://`-Layer-URL | Lokalisierte Konfigurationsmeldung; keine Service-Abfrage wird ausgeführt. |
| Polygon, Linie, Punkt | Je ein Treffer pro Geometrietyp | Passendes Highlight-Symbol und Zoom. |
| MN95 | Karte in EPSG:2056 | Resultat und Zoom liegen korrekt auf dem Objekt. |
| Mehrere Widgets | Zwei Instanzen derselben Karte | Jede Instanz verwaltet nur ihr eigenes Highlight. |
| Kartenwechsel | Aktive Kartenansicht wechseln | Keine alte Highlight-Layer und keine fehlerhafte Meldung verbleiben. |

## Release-Freigabe

- [ ] Der Build der Abnahme-Umgebung ist ohne Fehler abgeschlossen.
- [ ] Alle obigen Testfälle sind mit Datum, Tester und Resultat protokolliert.
- [ ] Der produktive Portal-Benutzer kann die Zielservices abfragen.
- [ ] Die Fachabnahme des Popups, der Suchfelder und des Ziel-Massstabs ist erteilt.
- [ ] Eine Freigabe für den Branch `production` liegt vor.

## Deployment nach Freigabe

1. `development` per Pull Request oder Fast-Forward in `production` übernehmen.
2. Den in der Abnahme gebauten Widget-Ordner auf den vorgesehenen IIS-Webserver übertragen.
3. Das Custom Widget im ArcGIS Enterprise Portal registrieren bzw. die bestehende Registrierung aktualisieren.
4. Die produktive Experience öffnen und einen erfolgreichen Suchlauf inklusive Popup durchführen.
5. Version, Zeitpunkt und verantwortliche Person im Release-Protokoll erfassen.
