"""Split each game's voice sprite into ~40 s pieces so Celly can talk after a small download.
Writes static/play/<game>/media/v/c<n>.mp3 and media/v/chunks.js (window.VOICE_CHUNKS=[[start,end,file],...]).
The original sprite is kept unchanged."""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAY = os.path.join(ROOT, 'static', 'play')
TARGET = 40.0
for g in (sys.argv[1:] or sorted(os.listdir(PLAY))):
    vj = os.path.join(PLAY, g, 'voice.js')
    if not os.path.exists(vj): continue
    t = open(vj, encoding='utf-8').read()
    m = re.search(r'window\.VOICE=(\{.*?\});\s*$', t, re.S | re.M)
    V = json.loads(m.group(1))
    sprite = os.path.join(PLAY, g, V['sprite'])
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', sprite]))
    segs = sorted(V['seg'].values(), key=lambda s: s[0])
    bounds, start = [], 0.0
    for s in segs:
        if s[0] - start >= TARGET:
            cut = max(start + 1, s[0] - 0.12)
            bounds.append((start, cut)); start = cut
    bounds.append((start, dur))
    od = os.path.join(PLAY, g, 'media', 'v'); os.makedirs(od, exist_ok=True)
    for f in os.listdir(od):
        if f.endswith('.mp3'): os.remove(os.path.join(od, f))
    out = []
    for i, (a, b) in enumerate(bounds):
        fn = f'c{i}.mp3'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', sprite, '-ss', f'{a:.3f}', '-t', f'{b - a:.3f}',
                        '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '64k', os.path.join(od, fn)], check=True)
        out.append([round(a, 3), round(b, 3), 'media/v/' + fn])
    open(os.path.join(od, 'chunks.js'), 'w').write('window.VOICE_CHUNKS=' + json.dumps(out) + ';\n')
    sizes = [os.path.getsize(os.path.join(od, f'c{i}.mp3')) // 1024 for i in range(len(out))]
    print(g, len(out), 'pieces, first', sizes[0], 'KB, largest', max(sizes), 'KB')
