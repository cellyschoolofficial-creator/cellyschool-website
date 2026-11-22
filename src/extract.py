# Build data/lessons.json from upload notes, voice scripts, schedule and workbook PDFs.
import json, re, glob, os, shutil, datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data', 'raw', 'Year 7')

UNITS = [
 ('7A', 'Cells, tissues, organs and systems', 'biology'),
 ('7B', 'Sexual reproduction in animals', 'biology'),
 ('7C', 'Muscles and bones', 'biology'),
 ('7D', 'Ecosystems', 'biology'),
 ('7E', 'Mixtures and separation', 'chemistry'),
 ('7F', 'Acids and alkalis', 'chemistry'),
 ('7G', 'The particle model', 'chemistry'),
 ('7H', 'Atoms, elements and molecules', 'chemistry'),
 ('7I', 'Energy', 'physics'),
 ('7J', 'Current electricity', 'physics'),
 ('7K', 'Forces', 'physics'),
 ('7L', 'Sound', 'physics'),
]

# video id, go-public date (6 pm Qatar). None date = already public before the new site.
VID = {
 '7Aa': ('E_YFTGRxsR4', None), '7Ab': ('UxjKmbYN3jQ', None), '7Ac': ('6XNPyFMaGxw', None),
 '7Ad': ('ZIf1F5QKn-I', None), '7Ae': ('Klo1RDcyc-o', None),
 '7Ba': ('-4veuR6HuFE', None), '7Bb': ('b8QmQie6iYc', None), '7Bc': ('lyHwSj-5KT8', '2026-10-22'),
 '7Bd': ('pTynlZcVl3E', '2026-10-25'), '7Be': ('NKuBcZVJKqA', '2026-10-27'),
 '7Ca': ('029hCBjtQJY', '2026-10-29'), '7Cb': ('R41nmSfKcSo', '2026-11-01'), '7Cc': ('5Cx5ddIz74c', '2026-11-03'),
 '7Cd': ('ga7F_TiVeRM', '2026-11-05'), '7Ce': ('4hXfH2HOhbM', '2026-11-08'),
 '7Da': ('ALet3zDz64w', '2026-11-10'), '7Db': ('hZd9_14-q_A', '2026-11-12'), '7Dc': ('fUxYN0wvSpc', '2026-11-15'),
 '7Dd': ('ML5bGTq38dI', '2026-11-17'), '7De': ('MXYjZY8rCC8', '2026-11-19'),
 '7Ea': ('8d4y4us_7x4', '2026-11-22'), '7Eb': ('E9NCNun9_qQ', '2026-11-24'), '7Ec': ('hCU9z7BCb5k', '2026-11-26'),
 '7Ed': ('laJmLRoHONU', '2026-11-28'), '7Ee': ('VDRH_4ecfU4', '2026-11-30'),
 '7Fa': ('7mqARPa_B_A', '2026-12-02'), '7Fb': ('FqQDrKLVelQ', '2026-12-04'), '7Fc': ('-DZsUbQG1Gw', '2026-12-06'),
 '7Fd': ('Uw2Dv2v3BGU', '2026-12-08'), '7Fe': ('DyHMqU48Nlg', '2026-12-10'),
 '7Ga': ('B4TzaJIhL6w', None), '7Gb': ('Cz6Gt9JpgdA', '2026-12-14'), '7Gc': ('Q5z8pUrpH9k', '2026-12-16'),
 '7Gd': ('tppWWhQrRP8', '2026-12-18'), '7Ge': ('0q3APTMgUw0', '2026-12-20'),
 '7Ha': ('xrPoers49ew', '2026-12-22'), '7Hb': ('nIWTu3REEC8', '2026-12-24'), '7Hc': ('_K3c6bv4Q6w', '2026-12-26'),
 '7Hd': ('DL6e18Cpxbc', '2026-12-28'), '7He': ('XcTir5tm5Sc', '2026-12-30'),
 '7Ia': ('4huo87ZpInc', '2026-11-23'), '7Ib': ('6I-1_14bb3k', '2026-11-25'), '7Ic': ('4XHsC9mFcQM', '2026-11-27'),
 '7Id': ('Cb3AdCt3m00', '2026-11-29'), '7Ie': ('c8ew534vBeg', '2026-12-01'),
 '7Ja': ('knuelAkOeWQ', '2026-12-03'), '7Jb': ('1LTYbjL43DY', '2026-12-05'), '7Jc': ('dZznfTKc_Gg', '2026-12-07'),
 '7Jd': ('UjPPHvymiz4', '2026-12-09'), '7Je': ('Qnh0nJkDUME', '2026-12-11'),
 '7Ka': ('8IQ_NWzwpxU', '2026-12-13'), '7Kb': ('zWEEqWkOaa0', '2026-12-15'), '7Kc': ('xPkbyAg_Abg', '2026-12-17'),
 '7Kd': ('ldnm6NnkvxI', '2026-12-19'), '7Ke': ('ddTBigNO_wE', '2026-12-21'),
 '7La': ('EtFs-jsyWq4', '2026-12-23'), '7Lb': ('UcTzTOl48DQ', '2026-12-25'), '7Lc': ('BAqfz8DW1Us', '2026-12-27'),
 '7Ld': ('d7nAdoUuD6Q', '2026-12-29'), '7Le': ('-4kGfsVP__8', '2026-12-31'),
}

HOOKS = {'7Aa': 'Is a car alive?', '7Ad': 'What are you made of?', '7Da': 'Why did the zoo animal never have babies?',
         '7Db': 'How does a desert rabbit live without drinking?', '7De': 'Why were falcon eggs breaking?'}

NUMW = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8}


def clean(s):
    s = re.sub(r'\*\*|__', '', s).strip()
    return s


def parse_notes(path):
    t = open(path, encoding='utf-8', errors='replace').read()
    out = {'yt_title': '', 'chapters': [], 'length': ''}
    m = re.search(r'TITLE[^\n]*\n(.+)', t)
    if m: out['yt_title'] = m.group(1).strip()
    m = re.search(r'CHAPTERS\n(.*?)\n\s*\n', t, re.S)
    if m:
        for ln in m.group(1).splitlines():
            mm = re.match(r'(\d+:\d\d(?::\d\d)?)\s+(.+)', ln.strip())
            if mm: out['chapters'].append([mm.group(1), mm.group(2).strip()])
    m = re.search(r'TOTAL LENGTH\s+(\d+:\d\d)', t)
    if m: out['length'] = m.group(1)
    return out


def parse_script(path):
    t = open(path, encoding='utf-8', errors='replace').read()
    res = {'keywords': [], 'tricks': [], 'bigideas': [], 'quiz': [], 'hook': []}
    # key word table
    m = re.search(r'## New key words.*?\n(\|.*?)(?:\n\n|\n\*\*|\n#)', t, re.S)
    if m:
        for ln in m.group(1).splitlines()[2:]:
            c = [clean(x) for x in ln.strip().strip('|').split('|')]
            if len(c) >= 3 and c[0] and not set(c[0]) <= set('-: '):
                taps = re.sub(r'\s*\(\d+\)\s*$', '', c[1])
                res['keywords'].append({'word': c[0], 'taps': taps, 'meaning': c[2]})
    # spoken lines
    lines = []
    for ln in t.splitlines():
        mm = re.match(r'-\s+\*\*(\w+?)(\s+BOLT)?\*\*\s+\[([^\]]*)\]\s+(.+)', ln.strip())
        if mm: lines.append((mm.group(1), bool(mm.group(2)), mm.group(4).strip()))
    # hook = scene 0 lines (ids like Ga00_xx)
    res['hook'] = [x[2] for x in lines if re.match(r'^[A-Z][a-z]00_', x[0]) and not x[1]]
    # tricks
    for _, bolt, s in lines:
        if bolt: continue
        mm = re.match(r"Here is (?:a|the|another|our) (?:new )?trick[.!:,]?\s*(.+)", s, re.I)
        if mm:
            tr = mm.group(1).strip()
            tr = re.split(r'\s+(?:Tick|Tap|Squeeze|Say|Point|Clap|Wave|Shiver|Fling|Make|Hold|Draw|Touch|Put|Stamp|Raise|Count|Use|Trace|Pat)\b', tr)[0].strip()
            if tr and tr not in res['tricks']: res['tricks'].append(tr)
    # big ideas
    for i, (_, bolt, s) in enumerate(lines):
        if re.search(r'(three|two|four) big ideas', s, re.I):
            for _, b2, s2 in lines[i + 1:i + 6]:
                mm = re.match(r'(One|Two|Three|Four)[.,]\s*(.+)', s2)
                if mm: res['bigideas'].append(mm.group(2).strip())
            break
    # fallback key words from syllable-tap lines
    if not res['keywords']:
        for i, (_, bolt, s) in enumerate(lines):
            mm = re.match(r"(?:Let's tap it\.\s*)?((?:[A-Za-z']+\.\s+){1,6})(One|Two|Three|Four|Five|Six) taps?\.", s)
            if mm and not bolt:
                parts = [x.strip('. ') for x in mm.group(1).split('.') if x.strip()]
                word = ''.join(parts).lower()
                prev = lines[i - 1][2] if i else ''
                mean = prev if re.search(r'\b(called|means|is a|are)\b', prev) else ''
                if word not in [k['word'] for k in res['keywords']]:
                    res['keywords'].append({'word': word, 'taps': '. '.join(parts) + '.', 'meaning': mean})
    # quiz
    for i, (_, bolt, s) in enumerate(lines):
        mm = re.match(r'Question (\w+)[.,:]\s*(.+)', s)
        if mm and mm.group(1).lower() in NUMW and i + 1 < len(lines):
            q = mm.group(2).strip()
            # answer: next non-Bolt line (Bolt sometimes answers first)
            ans = None
            for _, b2, s2 in lines[i + 1:i + 4]:
                if not b2 and not s2.lower().startswith('question'):
                    ans = s2; break
            if ans: res['quiz'].append({'q': q, 'a': ans})
    return res


def hook_from_title(title):
    if '|' in title:
        first = title.split('|')[0].strip()
        if first.endswith('?') or not first.startswith('KS3'):
            return first
    return ''


def main():
    lessons = []
    for code, uname, subj in UNITS:
        udir = glob.glob(os.path.join(RAW, code + ' *'))[0]
        for ldir in sorted(glob.glob(os.path.join(udir, code + '? *'))):
            base = os.path.basename(ldir)
            lc, ltitle = base[:3], base[4:]
            if 'Unit revision' in base: continue
            d = {'code': lc, 'slug': lc.lower(), 'title': ltitle, 'unit': code, 'unit_name': uname, 'subject': subj}
            notes = [p for p in glob.glob(os.path.join(ldir, '5 YouTube', '*.txt')) if 'notes' in p or 'details' in p]
            if notes:
                n = parse_notes(notes[0]); d.update(n); d['hook_q'] = hook_from_title(n['yt_title'])
            sc = glob.glob(os.path.join(ldir, '1 Script', '*script*'))
            if sc:
                d.update(parse_script(sc[0]))
            if d['code'] in HOOKS: d['hook_q'] = HOOKS[d['code']]
            if not d.get('hook_q'):
                qs = [h for h in d.get('hook', []) if h.endswith('?')]
                if qs:
                    q = re.sub(r'^(So|But|And|Now)\s*,?\s*', '', qs[-1]).strip()
                    d['hook_q'] = q[0].upper() + q[1:]
            pdf = glob.glob(os.path.join(ldir, '3 Workbook', '*.pdf'))
            pdf = [p for p in pdf if 'SAMPLE' not in p]
            d['pdf_src'] = pdf[0] if pdf else None
            if pdf:
                d['pdf_kb'] = os.path.getsize(pdf[0]) // 1024
            vid, date = VID[lc]
            d['video'] = vid; d['public_from'] = date
            d['age_restricted'] = code == '7B'
            lessons.append(d)
    json.dump(lessons, open(os.path.join(ROOT, 'data', 'lessons.json'), 'w'), indent=1, ensure_ascii=False)
    for d in lessons:
        print(d['code'], len(d.get('chapters', [])), 'kw', len(d.get('keywords', [])), 'tr', len(d.get('tricks', [])),
              'bi', len(d.get('bigideas', [])), 'qz', len(d.get('quiz', [])), 'hk', len(d.get('hook', [])), '|', d.get('hook_q', ''))


if __name__ == '__main__':
    main()
