# Release Notes

## Version 1.3.0
- Vollständige Wallbox-Steuerung über Flow-Karten:
  - Laden starten (Mischmodus, optionale max. Stromstärke)
  - Laden stoppen (EXTERN_DATA Abort + Fallback)
  - Sonnenmodus (PV-Überschuss) ein-/ausschalten
  - Lade-Stromstärke + Modus direkt setzen (REQ_SET_MODE)
- Verbesserte Wallbox-Discovery und individuelle Wallbox-Devices pro Ladepunkt
- Stabile Device-IDs für Wallboxen (keine Duplikate beim erneuten Pairing)
- Flow-Karten-Registrierung einmalig im Driver (nicht mehr pro Device)

## Version 1.2.0 / 1.1.0
- Unterstützung für externe Quellen (measure_external_power_delivery etc.)
- Einfaches Übersichtswidget (power-overview)
- Verschiedene Typos und kleinere Fixes in DE/EN
- Timeout-Konfiguration in den Einstellungen
- Verbessertes Error-Logging und Reconnect-Verhalten

## Version 1.0.0 (2024-03-01)
- Initial release

