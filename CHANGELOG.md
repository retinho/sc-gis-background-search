# Changelog

Alle wesentlichen Änderungen dieses Widgets werden in dieser Datei dokumentiert.

## Unreleased

### Added

- Calcite-basiertes Setting-UI und lokalisierte Runtime-Statusmeldungen.
- Eigene Highlight-Layer mit sicherem Lifecycle bei Kartenwechseln und mehreren Widget-Instanzen.
- Automatisches Öffnen des Standard-Popups des konfigurierten Kartenservice nach einem Treffer.
- Abnahme-Checkliste für Experience Builder 1.17 und ArcGIS Enterprise 11.5.

### Changed

- Strikte TypeScript-Typisierung und in einen Custom Hook ausgelagerte Suchlogik.
- Sicherer Aufbau der Suchabfrage mit validierter Konfiguration und escaped Suchwerten.

### Security

- HTTPS für Service-Layer-URLs erzwungen.
- Suchwerte auf 256 Zeichen begrenzt und LIKE-Sonderzeichen `%`, `_` sowie `\` als Literale behandelt.
- Abfrage auf einen Treffer begrenzt; ungültige Suchwerte lösen keine Service-Abfrage aus.
