# ha-arr-dashboard

Home Assistant custom integration and Lovelace card for Radarr (Sonarr-ready core).

See [info.md](info.md) for HACS and manual install steps and card YAML examples.

## Development

```bash
pip install -r requirements_test.txt
pytest -q
ruff check custom_components tests
cd card && npm ci && npm run build && npm test
```