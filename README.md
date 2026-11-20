# ha-arr-dashboard

Home Assistant custom integration and Lovelace card for Radarr (Sonarr-ready core).

See [info.md](info.md) for HACS and manual install steps and card YAML examples.

`hide_destructive_actions` only removes destructive buttons from this card’s UI (including rejected-release “Grab anyway”). It does not restrict who can call integration websocket commands; anyone signed in to Home Assistant can still run those actions from another client.

## Development

```bash
pip install -r requirements_test.txt
PYTHONPATH=. python -m pytest -q
ruff check custom_components tests
cd card && npm ci && npm run build && npm test
```