# SC GIS Background Search

Ein Custom Widget fuer ArcGIS Experience Builder Developer Edition 1.17. Das Widget liest Suchparameter aus der URL, fragt einen konfigurierten ArcGIS Map Service ab, hebt den ersten gefundenen Treffer in der verbundenen Karte hervor und öffnet dessen Standard-Popup.

## Voraussetzungen

- ArcGIS Experience Builder Developer Edition 1.17
- ArcGIS Enterprise 11.5
- Eine Experience mit einer verbundenen Karten-Data-Source

## Installation im Experience Builder

1. Den Repository-Stammordner `sc-gis-background-search` in den `client/your-extensions/widgets`-Ordner der Experience Builder Developer Edition kopieren.
2. Experience Builder neu starten oder das Widget-Verzeichnis neu einlesen lassen.
3. Das Widget in einer Experience hinzufuegen und im Setting eine Karte auswaehlen.
4. Mindestens einen Kartendienst konfigurieren.

## Konfiguration

Pro Dienst werden die folgenden Werte konfiguriert:

| Feld | Bedeutung | Beispiel |
| --- | --- | --- |
| URL-ID | Eindeutiger Name fuer den URL-Parameter | `parzelle` |
| Anzeigename | Bezeichnung im Builder | `Amtliche Vermessung` |
| Layer-URL | Vollstaendige HTTPS-URL des Feature-/Map-Service-Layers | `https://example.org/arcgis/rest/services/AV/MapServer/0` |
| Suchfelder | Durch Kommas getrennte Feldnamen | `EGRID,NUMMER` |
| Ziel-Massstab | Kartenmassstab nach dem Treffer | `1000` |
| Highlight-Farbe | Hex-Farbe des Ergebnisses | `#00FFFF` |

## Aufruf

Das Widget reagiert auf die URL-Parameter `sc_search_id` und `sc_search_val`:

```text
https://portal.example.org/experience/?sc_search_id=parzelle&sc_search_val=CH123456789012
```

`sc_search_id` muss einer konfigurierten URL-ID entsprechen. `sc_search_val` ist der Suchwert.
Suchwerte sind auf 256 Zeichen begrenzt; die Zeichen `%` und `_` werden als Text und nicht als Platzhalter behandelt.

## Sicherheit

- Es sind ausschliesslich HTTPS-URLs zu Feature- oder Map-Service-Layern zulässig.
- Die Service-ID muss einer im Widget konfigurierten Definition entsprechen; URL-Parameter können keinen beliebigen Service ansprechen.
- Suchfeldnamen werden validiert und Suchwerte für die SQL-LIKE-Abfrage escaped.
- Pro Suche wird höchstens ein Treffer abgefragt.
- Bearbeitungsrechte für die Experience und die eingebundenen Kartenservices sind restriktiv zu vergeben. Das Widget darf nur vertrauenswürdige Services verwenden.

## Entwicklung und Release

- `development`: aktive Entwicklung und Feature-Branches.
- `production`: freigegebene, produktive Stände.
- Vor einem Release wird das Widget in der Abnahme-Umgebung gebaut und in einer Experience gegen die Zielservices getestet.
- Die vollständige Test- und Deployment-Abfolge steht in der [Abnahme-Checkliste](docs/ABNAHME_CHECKLISTE.md).
- Wesentliche Änderungen stehen im [Changelog](CHANGELOG.md).

## Lizenz

Dieses Projekt steht unter der [Apache License 2.0](LICENSE).
