# Static site generator for www.cellyschool.com  ->  build/
import json, os, re, shutil, html, datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'build')
SITE = 'https://www.cellyschool.com'
YT = 'https://www.youtube.com/@CellySchool'
EMAIL = 'cellyschool.official@gmail.com'
THINKIFIC_URL = 'https://ayman-s-site-7527.thinkific.com/courses/ks3-science-year-7'
COURSE_URL = '/course'
UMAMI_ID = '585f0232-f0de-4980-a401-6b8133b6d029'    # Umami Cloud website ID (cookieless counts)
CLARITY_ID = 'zhgmzz2723'  # Microsoft Clarity project ID (replays, only after consent)
POSTHOG_KEY = 'phc_nES5k4NAb39SgFteH7mdCASP4BPWS3vFsJzMTxAB9Vdr'  # PostHog EU project key (public), only after consent
GA_ID = 'G-MZ4TCMRJ72'  # Google Analytics 4 measurement ID (G-...), only after consent
NOW = dt.datetime.now(dt.timezone.utc)
E = html.escape

L = json.load(open(os.path.join(ROOT, 'data', 'lessons.json')))
BY = {d['code']: d for d in L}
UNITS = []
for d in L:
    if not UNITS or UNITS[-1]['code'] != d['unit']:
        UNITS.append({'code': d['unit'], 'name': d['unit_name'], 'subject': d['subject'], 'lessons': []})
    UNITS[-1]['lessons'].append(d)

from help import build_help
HELP_URLS = []
UNIT_BLURB = {
 '7A': 'What makes something alive, and how cells build tissues, organs and whole body systems.',
 '7B': 'How animals reproduce, from the scientific method to growing up. For older students: these videos are age-restricted on YouTube.',
 '7C': 'Breathing, the heart and blood, the skeleton, how muscles move us, and how drugs affect the body.',
 '7D': 'Variation, adaptations, and how living things depend on each other in food chains and webs.',
 '7E': 'Mixtures, solutions, evaporation, chromatography and distillation: how scientists separate things.',
 '7F': 'Hazard symbols, indicators, the pH scale and neutralisation at home and in the lab.',
 '7G': 'Solids, liquids and gases, particles, Brownian motion, diffusion and air pressure.',
 '7H': 'Elements, the periodic table, metals and non-metals, compounds and chemical reactions.',
 '7I': 'Energy from food, energy stores and transfers, fuels and renewable resources.',
 '7J': 'Switches and current, circuit models, series and parallel circuits, and using electricity safely.',
 '7K': 'Different forces, springs, friction, pressure, and balanced and unbalanced forces.',
 '7L': 'How sounds are made, how they travel, how we hear them, and how we use sound waves.',
}
SUBJ = {'biology': ('Biology', 'celly', 'Celly the cell'), 'chemistry': ('Chemistry', 'atomy', 'Atomy the atom'),
        'physics': ('Physics', 'volty', 'Volty the spark')}

ICON_DL = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 21h16"/></svg>'
ICON_YT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.7 15.1V8.9l5.8 3.1z"/></svg>'


def live_at(d):
    """UTC datetime the lesson video goes public (6 pm Qatar = 15:00 UTC), or None if already public."""
    if not d.get('public_from'):
        return None
    y, m, dd = map(int, d['public_from'].split('-'))
    return dt.datetime(y, m, dd, 15, 0, tzinfo=dt.timezone.utc)


def is_live(d):
    t = live_at(d)
    return t is None or t <= NOW


def nice_date(d):
    t = live_at(d)
    return t.strftime('%a %-d %b %Y') if t else ''


def pdf_name(d):
    s = re.sub(r'[^a-z0-9]+', '-', (d['code'] + ' ' + d['title']).lower()).strip('-')
    return f'celly-school-{s}-workbook.pdf'


def secs(ts):
    p = [int(x) for x in ts.split(':')]
    return p[0] * 60 + p[1] if len(p) == 2 else p[0] * 3600 + p[1] * 60 + p[2]


def page(path, title, desc, body, active='', canonical=None, jsonld=None, extra_head=''):
    canonical = canonical or (SITE + ('/' if path == 'index.html' else '/' + path.replace('.html', '')))
    nav = [('/year-7', 'Year 7 Science', 'y7'), ('/play', 'Talk to Celly', 'pl'), ('/workbooks', 'Free workbooks', 'wb'), ('/help', 'Help', 'hp'), ('/about', 'For grown-ups', 'ab')]
    navh = ''.join(f'<a href="{h}"{" aria-current=page" if k == active else ""}>{t}</a>' for h, t, k in nav)
    ld = ''.join(f'<script type="application/ld+json">{json.dumps(j, ensure_ascii=False)}</script>' for j in (jsonld or []))
    doc = f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Celly School">
<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{canonical}"><meta property="og:image" content="{SITE}/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/favicon.png" type="image/png">
<link rel="preload" href="/fonts/lexend-regular.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="/site.css?v=3">
{extra_head}{ld}
</head>
<body>
<a class="skip" href="#main">Skip to the lesson content</a>
<header class="top"><div class="wrap">
<a class="brand" href="/"><img src="/img/celly.png" alt="" width="42" height="37">Celly School</a>
<nav class="nav" aria-label="Main">{navh}<a href="{YT}" rel="noopener">YouTube</a>
<button class="comfy-btn" id="comfy" type="button" aria-pressed="false" title="Bigger text and more space between letters">Aa Easier reading</button></nav>
</div></header>
<main id="main">
{body}
</main>
<footer><div class="wrap"><div class="cols">
<div><p><strong>Celly School</strong><br>Dyslexia-friendly science lessons, one small step at a time. Free videos and free printable workbooks for Year 7.</p></div>
<div><p><a href="/year-7">Year 7 Science</a><br><a href="/workbooks">Free workbooks</a><br><a href="/about">For parents, tutors and teachers</a><br><a href="/help">Help guides for grown-ups</a><br><a href="/privacy">Privacy</a></p></div>
<div><p><a href="{YT}" rel="noopener">youtube.com/@CellySchool</a><br>Questions or ideas: <a href="mailto:{EMAIL}">{EMAIL}</a></p></div>
</div>
<p class="small" style="color:#C9CFE0;margin-top:18px">Lessons follow the Year 7 Exploring Science topic order. Celly School is independent and is not affiliated with or endorsed by Pearson. The narration voice and some illustrations are AI-generated.</p>
</div></footer>
<script src="/track.js?v=4" defer data-umami="{UMAMI_ID}" data-clarity="{CLARITY_ID}" data-posthog="{POSTHOG_KEY}" data-ga="{GA_ID}"></script><script src="/site.js?v=3" defer></script>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{{"token": "8654c0b305d848cdbc645b5f4c7e1aa1"}}'></script>
</body>
</html>
'''
    fp = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, 'w', encoding='utf-8').write(doc)
    return canonical


def lesson_card(d):
    live = is_live(d)
    badge = '<span class="badge">Watch now</span>' if live else f'<span class="badge soon">Video {nice_date(d)}</span>'
    hq = E(d.get('hook_q') or '')
    return (f'<a class="card" href="/{d["slug"]}"><span class="chip {d["subject"]}">{d["code"]}</span> {badge}'
            f'<h3 style="margin-top:.5em">{E(d["title"])}</h3>' + (f'<p class="muted">{hq}</p>' if hq else '') + '</a>')


def facts_html(code):
    """Old Google Sites key facts (7Aa, 7Ab, 7Ad) as headings + paragraphs + lists."""
    src = {'7Aa': '7aa page - text.txt', '7Ab': '7ab page - text.txt', '7Ad': '7ad page - key facts text.txt'}.get(code)
    if not src: return ''
    import glob
    fs = glob.glob(os.path.join(ROOT, 'data', 'raw', 'Year 7', '7A*', code + '*', '7 Website', src))
    if not fs: return ''
    t = open(fs[0], encoding='utf-8').read()
    m = re.search(r'(?:key facts|KEY FACTS)[^\n]*\n', t)
    if not m: return ''
    t = t[m.end():]
    out, lst = [], None
    for ln in t.splitlines():
        s = ln.strip()
        if not s:
            if lst: out.append(f'<{lst[0]}>' + ''.join(f'<li>{E(x)}</li>' for x in lst[1]) + f'</{lst[0]}>'); lst = None
            continue
        if s.lower().startswith('three big ideas'): break
        li = re.match(r'^(?:[-•]\s+|(\d+)\.\s+)(.+)', s)
        if li:
            kind = 'ol' if li.group(1) else 'ul'
            if not lst or lst[0] != kind:
                if lst: out.append(f'<{lst[0]}>' + ''.join(f'<li>{E(x)}</li>' for x in lst[1]) + f'</{lst[0]}>')
                lst = (kind, [])
            lst[1].append(li.group(2)); continue
        if lst: out.append(f'<{lst[0]}>' + ''.join(f'<li>{E(x)}</li>' for x in lst[1]) + f'</{lst[0]}>'); lst = None
        if s.endswith('?') and len(s) < 90: out.append(f'<h3>{E(s)}</h3>')
        else: out.append(f'<p>{E(s)}</p>')
    if lst: out.append(f'<{lst[0]}>' + ''.join(f'<li>{E(x)}</li>' for x in lst[1]) + f'</{lst[0]}>')
    return '<section class="facts" id="facts"><h2>Key facts</h2>' + '\n'.join(out) + '</section>'


def build_lesson(d, prev, nxt):
    subj, hero, heroname = SUBJ[d['subject']]
    live = is_live(d)
    lt = live_at(d)
    unit_slug = d['unit'].lower()
    hook = d.get('hook_q') or ''
    title = f'{d["code"]} {d["title"]}: free video lesson and worksheet | Year 7 {subj} | Celly School'
    desc = (f'{hook} ' if hook else '') + f'Free dyslexia-friendly KS3 {subj.lower()} lesson for Year 7 ({d["code"]} {d["title"]}): video, key words with syllables, memory tricks and a free printable workbook.'
    b = [f'<div class="wrap narrow">',
         f'<nav class="crumbs" aria-label="Breadcrumb"><a href="/year-7">Year 7 Science</a> › <a href="/year-7/{unit_slug}">{d["unit"]} {E(d["unit_name"])}</a> › {d["code"]}</nav>',
         f'<div class="lesson-head"><div><span class="chip {d["subject"]}">{d["code"]} · {subj}</span>',
         f'<h1 style="margin-top:.35em">{E(d["title"])}</h1>' + (f'<p class="hookq">{E(hook)}</p>' if hook else ''),
         f'</div><img src="/img/{hero}.png" alt="{heroname}" width="150" height="130"></div>']
    # video
    vattr = f' data-vid="{d["video"]}"' + (f' data-from="{lt.isoformat()}"' if lt else '') + (' data-age' if d['age_restricted'] else '')
    b.append(f'<div class="video"{vattr}><div class="soon"><img src="/img/{hero}.png" alt=""><p>The video for this lesson goes live on<br><strong class="when">{nice_date(d)}, 6 pm (Qatar)</strong>.<br>The free workbook is ready now.</p></div></div>')
    if d['age_restricted']:
        b.append('<p class="note warn">Unit 7B covers human reproduction. On YouTube these videos are age-restricted, so they open on YouTube. Please watch together with a parent or teacher.</p>')
    game_btn = f'<a class="btn" href="/play/{d["slug"]}/">🎮 Play the Talk to Celly game</a>' if d["slug"] in [g[0] for g in GAMES] else ''
    b.append('<div class="btns">'
             f'<a class="btn primary" href="/{d["slug"]}-workbook">{ICON_DL} Free workbook (PDF)</a>'
             + game_btn +
             f'<a class="btn yt-link" href="https://www.youtube.com/watch?v={d["video"]}" rel="noopener" hidden>{ICON_YT} Watch on YouTube</a>'
             '</div>')
    # chapters
    ch = [c for c in d.get('chapters', []) if 'grown-ups' not in c[1].lower()]
    if ch:
        b.append('<section id="parts"><h2>In this lesson</h2><ul class="parts">')
        for ts, name in ch:
            cls = ' class="part"' if name.lower().startswith('part ') else ''
            b.append(f'<li{cls}><span class="t" data-s="{secs(ts)}">{ts}</span><span>{E(name)}</span></li>')
        b.append('</ul></section>')
    # key words
    kws = d.get('keywords', [])
    if kws:
        b.append('<section id="words"><h2>Key words</h2><p>Say each word slowly and tap one beat for each part. Tapping the beats helps you spell and remember long science words.</p><div class="words">')
        for k in kws:
            parts = [p.strip() for p in re.split(r'[.·]\s*', k['taps']) if p.strip()]
            taps = ''.join(f'<span>{E(p)}</span>' for p in parts)
            b.append(f'<div class="word"><p class="w">{E(k["word"])}</p><div class="taps" aria-label="{len(parts)} beats">{taps}</div>' + (f'<p>{E(k["meaning"])}</p>' if k.get('meaning') else '') + '</div>')
        b.append('</div></section>')
    if d.get('tricks'):
        b.append('<section id="tricks"><h2>Memory tricks</h2><div class="tricks">' + ''.join(f'<div class="trick">{E(t)}</div>' for t in d['tricks']) + '</div></section>')
    fh = facts_html(d['code'])
    if fh: b.append(fh)
    if d.get('bigideas'):
        b.append('<section id="ideas"><h2>Three big ideas</h2><ol class="ideas">' + ''.join(f'<li>{E(x)}</li>' for x in d['bigideas']) + '</ol></section>')
    faq = []
    if True:
        b.append('<section id="practice"><h2>Talk to Celly <span class="chip">Coming soon</span></h2>'
                 '<p>An interactive game for this lesson is on its way. Celly talks, listens to your answers and helps you practise the key words. '
                 'For now, use the video and the free workbook.</p></section>')
    if d.get('quiz'):
        b.append('<section id="quiz"><h2>Quick quiz</h2><p>Say your answer out loud first, then check.</p>')
        for q in d['quiz']:
            b.append(f'<details class="q"><summary>{E(q["q"])}</summary><p class="a">{E(q["a"])}</p></details>')
            faq.append({'@type': 'Question', 'name': q['q'], 'acceptedAnswer': {'@type': 'Answer', 'text': q['a']}})
        b.append('</section>')
    b.append(f'<section id="workbook"><h2>Free printable workbook</h2><p>Practise at home with the free {d["code"]} workbook: picture activities, word games with syllable taps, test-style questions and answers. Each part has a QR code that takes you straight back to the right part of the video.</p>'
             f'<p><a class="btn primary" href="/{d["slug"]}-workbook">{ICON_DL} Get the {d["code"]} workbook</a></p></section>')
    b.append(f'<section class="course-cta"><h2>Follow the whole course, in order</h2><p>All Year 7 lessons in one place, in the Exploring Science order, with every workbook and your progress saved. Free.</p><p><a class="btn" href="{COURSE_URL}">Take the full course (free)</a></p></section>')
    # pager
    pg = '<nav class="pager" aria-label="Lessons">'
    if prev: pg += f'<a class="card" href="/{prev["slug"]}"><span class="dir">← Previous lesson</span><strong>{prev["code"]} {E(prev["title"])}</strong></a>'
    if nxt: pg += f'<a class="card next" href="/{nxt["slug"]}"><span class="dir">Next lesson →</span><strong>{nxt["code"]} {E(nxt["title"])}</strong></a>'
    b.append(pg + '</nav>')
    b.append(f'<p class="small">Follows the topic order of Pearson Exploring Science, Year 7, lesson {d["code"]}. Not made by or linked to Pearson.</p></div>')
    url = f'{SITE}/{d["slug"]}'
    ld = [{'@context': 'https://schema.org', '@type': 'LearningResource', 'name': f'{d["code"]} {d["title"]}', 'url': url,
           'description': desc, 'educationalLevel': 'Key Stage 3, Year 7', 'inLanguage': 'en-GB', 'isAccessibleForFree': True,
           'learningResourceType': ['video lesson', 'worksheet'], 'about': d['title'], 'teaches': [k['word'] for k in kws][:8],
           'provider': {'@type': 'Organization', 'name': 'Celly School', 'url': SITE}},
          {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
              {'@type': 'ListItem', 'position': 1, 'name': 'Year 7 Science', 'item': SITE + '/year-7'},
              {'@type': 'ListItem', 'position': 2, 'name': f'{d["unit"]} {d["unit_name"]}', 'item': f'{SITE}/year-7/{unit_slug}'},
              {'@type': 'ListItem', 'position': 3, 'name': f'{d["code"]} {d["title"]}', 'item': url}]}]
    if live and not d['age_restricted']:
        ld.append({'@context': 'https://schema.org', '@type': 'VideoObject', 'name': d.get('title_full') or f'{d["code"]} {d["title"]}',
                   'description': desc, 'thumbnailUrl': f'https://i.ytimg.com/vi/{d["video"]}/hqdefault.jpg',
                   'uploadDate': (d.get('public_from') or '2026-10-15') + 'T18:00:00+03:00',
                   'embedUrl': f'https://www.youtube.com/embed/{d["video"]}', 'contentUrl': f'https://www.youtube.com/watch?v={d["video"]}'})
    if faq:
        ld.append({'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': faq})
    page(f'{d["slug"]}.html', title, desc, '\n'.join(b), 'y7', jsonld=ld)


def build_workbook(d):
    subj, hero, _ = SUBJ[d['subject']]
    fn = pdf_name(d)
    title = f'Free {d["code"]} {d["title"]} worksheet with answers (printable PDF) | Year 7 {subj}'
    desc = f'Download the free printable {d["code"]} {d["title"]} workbook for KS3 {subj.lower()}, Year 7. Dyslexia-friendly worksheets with answers, following the Exploring Science order.'
    mb = d.get('pdf_kb', 0) / 1024
    body = f'''<div class="wrap narrow">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/workbooks">Free workbooks</a> › {d["code"]}</nav>
<span class="chip {d["subject"]}">{d["code"]} · {subj}</span>
<h1 style="margin-top:.35em">{E(d["title"])}: free workbook</h1>
<p class="lead">A printable workbook for the {d["code"]} lesson, made for children who find reading and spelling hard.</p>
<div class="btns"><a class="btn primary" href="/workbooks/{fn}" download>{ICON_DL} Download the workbook (PDF, {mb:.1f} MB)</a>
<a class="btn" href="/{d["slug"]}">Go to the {d["code"]} lesson</a></div>
<div class="card"><h2 style="margin-top:0">What is inside</h2><ul>
<li>Short parts that match the parts of the video</li><li>Picture activities, labelling and sorting</li>
<li>Key words with syllable taps, and memory tricks</li><li>Test-style questions, with answers for grown-ups</li>
<li>A QR code on each part that opens the matching part of the video</li></ul></div>
<h2>Printing tips</h2><p>Print on cream or pale yellow paper if you have it; many dyslexic readers find it calmer than bright white. Print at 100% (actual size). You can print only the part you are working on today.</p>
<p class="note">The workbooks are free to print and share for home and classroom use. Please don't sell them or upload them to other websites; share the link to this page instead.</p>
<p class="small">Follows the topic order of Pearson Exploring Science, Year 7, lesson {d["code"]}. Not made by or linked to Pearson.</p>
</div>'''
    page(f'{d["slug"]}-workbook.html', title, desc, body, 'wb')
    if d.get('pdf_src'):
        dst = os.path.join(OUT, 'workbooks', fn)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        ps = d['pdf_src']
        if not os.path.exists(ps) and 'data/raw/' in ps:
            ps = os.path.join(ROOT, 'data', 'raw', ps.split('data/raw/', 1)[1])
        shutil.copy2(ps, dst)


def build_unit(u):
    subj, hero, heroname = SUBJ[u['subject']]
    s = u['code'].lower()
    cards = ''.join(lesson_card(d) for d in u['lessons'])
    body = f'''<div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/year-7">Year 7 Science</a> › {u["code"]}</nav>
<div class="subj {u["subject"]}"><div class="subj-head"><img src="/img/{hero}.png" alt="{heroname}" width="64" height="56"><div><span class="chip {u["subject"]}">{subj}</span><h1 style="margin:.2em 0 0">{u["code"]} {E(u["name"])}</h1></div></div>
<p>{E(UNIT_BLURB[u["code"]])}</p></div>
<h2>Lessons in this unit</h2><p>Free video lessons and printable worksheets with answers for Exploring Science {u["code"]} {E(u["name"])}. Each video comes in short parts with brain breaks.</p>
<div class="grid">{cards}</div>
<p style="margin-top:28px"><a href="/year-7">← All Year 7 units</a></p></div>'''
    page(f'year-7/{s}.html', f'Exploring Science {u["code"]} {u["name"]}: free worksheets, answers and video lessons | Year 7 {subj}',
         f'Free dyslexia-friendly Year 7 {subj.lower()} for Exploring Science {u["code"]} {u["name"]}: video lessons, printable worksheets with answers, key words and memory tricks.', body, 'y7')


def build_year7():
    secs_ = []
    for sj in ('biology', 'chemistry', 'physics'):
        subj, hero, heroname = SUBJ[sj]
        cards = ''.join(f'<a class="card" href="/year-7/{u["code"].lower()}"><span class="chip {sj}">{u["code"]}</span><h3 style="margin-top:.5em">{E(u["name"])}</h3><p class="muted">{E(UNIT_BLURB[u["code"]])}</p></a>' for u in UNITS if u['subject'] == sj)
        secs_.append(f'<section class="subj {sj}"><div class="subj-head"><img src="/img/{hero}.png" alt="{heroname}" width="64" height="56"><h2>{subj} <span class="small">with {heroname}</span></h2></div><div class="grid">{cards}</div></section>')
    body = f'''<div class="wrap"><h1 style="margin-top:36px">Year 7 Science</h1>
<p class="lead">A free online Year 7 science course in the Exploring Science order: all 12 units, 60 video lessons, and a free printable workbook with answers for every lesson. Prefer everything in one place with progress saved? <a href="/course">Take the full course (free)</a>.</p>
{"".join(secs_)}</div>'''
    page('year-7.html', 'Free online Year 7 science course in Exploring Science order | Celly School',
         'Free dyslexia-friendly Year 7 science lessons (KS3 biology, chemistry and physics): 60 video lessons and free printable workbooks.', body, 'y7')


def build_workbooks():
    rows = []
    for u in UNITS:
        subj, hero, _ = SUBJ[u['subject']]
        items = ''.join(f'<li><a href="/{d["slug"]}-workbook">{d["code"]} {E(d["title"])}</a></li>' for d in u['lessons'])
        rows.append(f'<div class="card"><span class="chip {u["subject"]}">{u["code"]}</span><h3 style="margin-top:.5em">{E(u["name"])}</h3><ul>{items}</ul></div>')
    body = f'''<div class="wrap"><h1 style="margin-top:36px">Free printable workbooks</h1>
<p class="lead">60 free workbooks for Year 7 science, one for every lesson. No sign-up, no email: just download and print.</p>
<div class="grid">{"".join(rows)}</div>
<p class="note" style="margin-top:28px">Free to print and share for home and classroom use. Please don't sell them or upload them elsewhere.</p></div>'''
    page('workbooks.html', 'Free printable Year 7 science workbooks with answers (PDF) | Celly School',
         '60 free printable KS3 science workbooks for Year 7, dyslexia-friendly, with answers. Biology, chemistry and physics.', body, 'wb')


def build_home():
    live = [d for d in L if is_live(d) and not d['age_restricted']]
    latest = sorted(live, key=lambda d: d.get('public_from') or '', reverse=True)[:6]
    upcoming = [d for d in L if not is_live(d)][:3]
    cards = ''.join(lesson_card(d) for d in latest)
    up = ''.join(lesson_card(d) for d in upcoming)
    body = f'''<section class="hero"><div class="wrap">
<div><h1>Science that sticks, one small step at a time</h1>
<p class="lead">Free Year 7 science lessons made for children with dyslexia: short video parts, long words broken into beats, memory tricks, and a free printable workbook for every lesson.</p>
<div class="btns"><a class="btn primary" href="/year-7">Start Year 7 Science</a><a class="btn" href="/workbooks">{ICON_DL} Free workbooks</a><a class="btn" href="{COURSE_URL}">Full course (free)</a></div></div>
<div class="heroes" aria-hidden="true"><img class="h1" src="/img/celly.png" alt=""><img class="h2" src="/img/atomy.png" alt=""><img class="h3" src="/img/volty.png" alt=""></div>
</div></section>
<div class="wrap">
<div class="grid four">
<div class="card"><h3>Short parts</h3><p class="muted">Each lesson is split into parts with a brain break, so nothing is too long.</p></div>
<div class="card"><h3>Words in beats</h3><p class="muted">New science words are tapped out syllable by syllable: Mi · to · chon · dri · a.</p></div>
<div class="card"><h3>Memory tricks</h3><p class="muted">Silly sentences and pictures, like “Nine Cats Make Music” for the parts of a cell.</p></div>
<div class="card"><h3>Free workbooks</h3><p class="muted">A printable workbook for every lesson, with answers and QR codes back to the video.</p></div>
</div>
<h2>Latest lessons</h2><div class="grid">{cards}</div>
{('<h2>Coming next</h2><div class="grid">' + up + '</div>') if up else ''}
<section class="subj biology" style="margin-top:36px"><div class="subj-head"><img src="/img/celly.png" alt="Celly the cell" width="64" height="56"><h2>Meet the heroes</h2></div>
<p><strong>Celly the cell</strong> teaches biology, <strong>Atomy the atom</strong> teaches chemistry, and <strong>Volty the spark</strong> teaches physics. Bolt the robot joins every lesson and gets things wrong, so children can spot the mistake.</p></section>
<h2>For parents, tutors and teachers</h2>
<p>Celly School began at a kitchen table, when a Year 7 student understood the science but could not remember the words. The lessons use proven methods for teaching dyslexic learners (Orton-Gillingham style): multisensory steps, syllables, memory tricks and regular recall. <a href="/about">Read more about how the lessons work</a>.</p>
<p><strong>Guides for grown-ups:</strong> <a href="/help/dyslexia-year-7-science">helping with Year 7 science at home</a> · <a href="/help/remember-science-words">remembering long science words</a> · <a href="/help/for-sencos">resources for SENCOs and teachers</a> · <a href="/help">all guides</a>.</p>
<div class="btns"><a class="btn" href="{YT}" rel="noopener">{ICON_YT} Watch on YouTube</a></div>
</div>'''
    ld = [{'@context': 'https://schema.org', '@type': 'EducationalOrganization', 'name': 'Celly School', 'url': SITE,
           'logo': SITE + '/img/favicon.png', 'sameAs': [YT], 'email': EMAIL,
           'description': 'Free dyslexia-friendly KS3 science lessons and printable workbooks.'},
          {'@context': 'https://schema.org', '@type': 'WebSite', 'name': 'Celly School', 'url': SITE}]
    page('index.html', 'Celly School | Free dyslexia-friendly Year 7 science course, videos and workbooks',
         'A free online Year 7 science course for children with dyslexia, in the Exploring Science order: video lessons in short parts, syllable taps, memory tricks and free printable workbooks with answers.', body, '', jsonld=ld)


GAMES = [
    ('7aa', '7Aa', 'Life processes', "Dr Celly's Clinic", 'A robot called Bolt thinks he is alive. Help Dr Celly find out, using MRS GREN.'),
    ('7ab', '7Ab', 'Organs', 'The Body Town Tour', 'Every organ is a building in Body Town, and Celly is your tour guide.'),
    ('7ac', '7Ac', 'Tissues', 'The Tissue Lab', 'Celly is a pathologist today. A box of samples has arrived… and something else!'),
    ('7ad', '7Ad', 'Cells', "Celly's Cell Museum", 'A big sneeze has scattered Celly’s parts. Find them, room by room.'),
    ('7ae', '7Ae', 'Organ systems', 'Body Town Grand Opening', 'Snooze the sleepy dog has muddled every signpost. Be Celly’s Chief Engineer.'),
]


def build_play():
    cards = ''.join(f'''<a class="card game" href="/play/{g}/"><span class="chip bio">{code} · {E(topic)}</span>
<h2 style="margin:.4em 0 .2em">{E(name)}</h2><p>{E(blurb)}</p><p class="muted">About 15 minutes · talk or tap</p><span class="btn primary">▶ Play</span></a>''' for g, code, topic, name, blurb in GAMES)
    body = f'''<div class="wrap"><h1 style="margin-top:36px">Talk to Celly</h1>
<p class="lead">Science games where Celly talks to you, listens to your answers and helps you say, tap and remember the key words. Each game goes with one lesson video.</p>
<p class="note"><b>Free while we test them.</b> Works best in Chrome or Edge. When the browser asks for the microphone, choose “Allow”. You can also play by tapping only. A grown-up can get a short report by email at the end.</p>
<div id="family" class="note" style="margin:18px 0 24px"></div><script src="/play/family.js?v=2"></script>
<h2>Unit 7A · Cells, tissues, organs and systems</h2>
<div class="games">{cards}</div>
<p class="muted" style="margin-top:24px">More games are on the way, starting with 7C Muscles and bones.</p></div>
<style>.games{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-top:12px}}
.card.game{{display:block;text-decoration:none;color:inherit;border:3px solid var(--line,#2B3A67);border-radius:20px;padding:16px 18px;background:#FFFDF6}}
.card.game:hover{{transform:translateY(-2px)}}.card.game .btn{{margin-top:6px}}</style>'''
    page('play.html', 'Talk to Celly: free interactive Year 7 science games | Celly School',
         'Free dyslexia-friendly Year 7 science games where Celly talks, listens and helps children say, tap and remember key words. Five games for unit 7A.', body, 'pl')
    # /play and /play/ both open this page (the games live in /play/<code>/)
    import shutil
    os.makedirs(os.path.join(OUT, 'play'), exist_ok=True)
    shutil.copy(os.path.join(OUT, 'play.html'), os.path.join(OUT, 'play', 'index.html'))


def build_static_pages():
    about = f'''<div class="wrap narrow"><h1 style="margin-top:36px">For parents, tutors and teachers</h1>
<p class="lead">Celly School makes free, calm, dyslexia-friendly science lessons for Year 7, in the Exploring Science topic order.</p>
<h2>Why Celly School exists</h2>
<p>It started with one Year 7 student preparing for a science test. She understood the ideas, but the long science words would not stay in her memory. The science videos online were not made for children like her, so her dad researched proven methods for teaching dyslexic children and began making the lessons himself, starting with Cells.</p>
<h2>How the lessons work</h2>
<ul><li><strong>Short parts.</strong> One idea at a time, with a brain break between parts.</li>
<li><strong>Words in beats.</strong> Every new word is said slowly and tapped: one tap for each syllable.</li>
<li><strong>Memory tricks.</strong> Silly sentences, gestures and pictures to hang each word on.</li>
<li><strong>Pause and recall.</strong> Questions with thinking time, thumbs up or thumbs down, and a quiz at the end.</li>
<li><strong>A friendly mistake-maker.</strong> Bolt the robot gets things wrong, so children practise spotting and fixing mistakes.</li>
<li><strong>Free workbooks.</strong> Printable practice for home, with answers and QR codes back to the video.</li></ul>
<h2>The full course, in order</h2>
<p>Prefer one place with everything in order? The free Celly School course has every Year 7 lesson, every workbook, and saves your child\'s progress. <a href="{COURSE_URL}">Take the full course (free)</a>.</p>
<h2>Guides for grown-ups</h2>
<p>Short guides on <a href="/help/dyslexia-year-7-science">helping a dyslexic child with Year 7 science at home</a>, <a href="/help/remember-science-words">remembering long science words</a>, <a href="/help/orton-gillingham-science">multisensory teaching</a> and <a href="/help/for-sencos">resources for SENCOs</a>. <a href="/help">All guides</a>.</p>
<h2>Using the lessons at home</h2>
<p>Watch one part, pause, and do the matching workbook part. Say the key words out loud together and tap the beats. Short and often works better than long sessions.</p>
<h2>Easier reading on this website</h2>
<p>This site uses the Lexend font, a cream background and short lines of text. Press <strong>“Aa Easier reading”</strong> at the top of any page for bigger text and more space between letters.</p>
<h2>Contact</h2><p>Questions, ideas or feedback from your child are very welcome: <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
<p class="small">Lessons follow the Year 7 Exploring Science topic order. Celly School is independent and is not affiliated with or endorsed by Pearson. The narration voice and some illustrations are AI-generated.</p></div>'''
    page('about.html', 'About Celly School | For parents, tutors and teachers', 'How Celly School lessons help dyslexic learners: short parts, syllable taps, memory tricks and free workbooks.', about, 'ab')
    privacy = f'''<div class="wrap narrow"><h1 style="margin-top:36px">Privacy</h1>
<p>Celly School is made for children, so this website collects as little as possible.</p>
<ul><li>No accounts and no sign-up. The only personal details we collect are the ones a grown-up chooses to give for the game reports below: their email and their children’s first names.</li>
<li>No advertising cookies on this website.</li>
<li>The “Easier reading” setting is saved only in your own browser, on your device. It is never sent to us.</li>
<li>We count which pages are visited and which buttons are used (for example “download the workbook”, “play the video” or “finished a game”) with Umami. Umami uses no cookies and collects no personal information; we only see totals.</li>
<li>To make the lessons and games easier to use, we use three tools that look at how the website is used: Microsoft Clarity (clicks, scrolling and where people get stuck), PostHog (which pages and game rooms are used and where people stop; its data is kept in the EU) and Google Analytics (which websites and searches bring visitors). They hide anything typed and do not record names or contact details. Google Analytics' advertising and Google-signals features are switched off, and for visitors in the UK and Europe Clarity and Google Analytics do not set cookies. The privacy statements of Microsoft, PostHog and Google apply to their tools. You can switch these tools off on your device here: <button type="button" class="btn" data-consent-reset hidden>Turn them off on this device</button></li>
<li>We count visits with Cloudflare Web Analytics. It uses no cookies, does not collect personal information and does not follow you to other websites. It only tells us totals, such as how many people visited a page and which country or website they came from.</li>
<li><b>Game reports.</b> Talk to Celly games can email a grown-up a short report after each game. This is optional. To use it, a grown-up enters their email and, if they wish, their children’s first names (or nicknames), and ticks a box to say they are the parent or carer and agree to us keeping these details. That tick is their consent. We keep the email address and the first names in a private list in our Google account, together with each child’s games, answers, scores and progress over time, so we can send reports, recap results and the next recap for the right child, and use the anonymous totals to make the games and lessons better. The game results (which answers were right first time, the time taken and the words to practise) are sent to our Google account, which makes the PDF report and emails it. We never share or sell these details, and we do not send newsletters unless you ask for them. You can change your mind at any time: to see, change or delete your details, reply to any report email or write to cellyschool.official@gmail.com, and we will delete them. The device also remembers the email and names so a child can simply tap their name next time; “Remove from this device” on the Talk to Celly page clears them.</li>
<li>Lesson videos are hosted on YouTube. A video only loads from YouTube (in privacy-enhanced mode, youtube-nocookie.com) when you press play. YouTube's own privacy policy then applies.</li>
<li>The website is hosted on GitHub Pages, which may keep basic technical logs (such as IP addresses) for security.</li></ul>
<p>Questions: <a href="mailto:{EMAIL}">{EMAIL}</a></p></div>'''
    page('privacy.html', 'Privacy | Celly School', 'Celly School collects as little as possible: no accounts and no ads. Visits are counted to improve the lessons; a grown-up’s email and children’s first names are kept only if they ask for game reports.', privacy)
    nf = '''<div class="wrap narrow center" style="padding:60px 20px"><img src="/img/celly.png" alt="" width="160"><h1>Oops, this page is missing</h1>
<p style="margin:0 auto 1em">Celly looked everywhere. Try the Year 7 lessons or the free workbooks.</p>
<div class="btns" style="justify-content:center"><a class="btn primary" href="/year-7">Year 7 Science</a><a class="btn" href="/workbooks">Free workbooks</a></div></div>'''
    page('404.html', 'Page not found | Celly School', 'This page could not be found.', nf)
    # old Google Sites address /home -> /
    open(os.path.join(OUT, 'course.html'), 'w').write(f'<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Celly School course</title><meta http-equiv="refresh" content="0; url={THINKIFIC_URL}"><script>try{{window.umami&&umami.track("course-redirect")}}catch(e){{}};location.replace("{THINKIFIC_URL}")</script><p style="font-family:sans-serif">Opening the Celly School course… <a href="{THINKIFIC_URL}">Continue</a></p>')
    open(os.path.join(OUT, 'home.html'), 'w').write(f'<!doctype html><meta charset="utf-8"><title>Celly School</title><link rel="canonical" href="{SITE}/"><meta http-equiv="refresh" content="0; url=/"><a href="/">Celly School</a>')


def build_meta():
    urls = ['', 'year-7', 'play', 'workbooks', 'about', 'privacy'] + [f'play/{g[0]}/' for g in GAMES] + HELP_URLS + [f'year-7/{u["code"].lower()}' for u in UNITS]
    for d in L: urls += [d['slug'], d['slug'] + '-workbook']
    today = NOW.strftime('%Y-%m-%d')
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
        f'<url><loc>{SITE}/{u}</loc><lastmod>{today}</lastmod></url>\n' for u in urls) + '</urlset>\n'
    open(os.path.join(OUT, 'sitemap.xml'), 'w').write(sm)
    open(os.path.join(OUT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
    open(os.path.join(OUT, 'CNAME'), 'w').write('www.cellyschool.com\n')
    open(os.path.join(OUT, '.nojekyll'), 'w').write('')


def main():
    if os.path.exists(OUT): shutil.rmtree(OUT)
    shutil.copytree(os.path.join(ROOT, 'static'), OUT, ignore=shutil.ignore_patterns('src'))
    for i, d in enumerate(L):
        build_lesson(d, L[i - 1] if i else None, L[i + 1] if i + 1 < len(L) else None)
        build_workbook(d)
    for u in UNITS: build_unit(u)
    build_year7(); build_workbooks(); build_home(); build_play(); build_static_pages()
    HELP_URLS[:] = build_help(page, E, SITE, L)
    build_meta()
    n = sum(len(f) for _, _, f in os.walk(OUT))
    print('built', n, 'files')


if __name__ == '__main__':
    main()
