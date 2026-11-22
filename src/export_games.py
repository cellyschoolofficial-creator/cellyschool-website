# Export the PAID lessons' game data for the unlock Worker's KV namespace.
#   python3 src/export_games.py            -> worker/.games/paid-games.json (git-ignored)
# Upload it (owner, once per content change):
#   cd worker && npx wrangler kv bulk put --binding GAMES --remote .games/paid-games.json
# The file is a list of {"key": "game:<slug>", "value": "<json>"}: the format `wrangler kv bulk put` reads.
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B

out_dir = os.path.join(B.ROOT, 'worker', '.games')
os.makedirs(out_dir, exist_ok=True)
rows = [{'key': 'game:' + d['slug'], 'value': json.dumps(B.practice_data(d), ensure_ascii=False)}
        for d in B.L if B.has_games(d) and d['code'] not in B.FREE_GAMES]
fp = os.path.join(out_dir, 'paid-games.json')
with open(fp, 'w', encoding='utf-8') as f:
    json.dump(rows, f, ensure_ascii=False, indent=0)
print('wrote', len(rows), 'paid lessons to', os.path.relpath(fp, B.ROOT))
print('free (first lesson of each unit):', ', '.join(sorted(B.FREE_GAMES)))
