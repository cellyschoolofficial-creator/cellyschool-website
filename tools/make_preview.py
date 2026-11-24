"""Make a private preview copy of build/ under /preview-celly/ (not on Google, no analytics).
Images, fonts and workbook PDFs are left out and load from the live site."""
import os, re, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'build')
PFX = 'preview-celly'
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'preview-out')
DST = os.path.join(OUT, PFX)
SKIP = ('workbooks', 'img', 'fonts')
KEEP_ROOT = r'(?!/)(?!img/|fonts/|workbooks/|favicon|' + PFX + ')'
shutil.rmtree(DST, ignore_errors=True)
RIBBON = ('<div style="position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9999;background:#B5651D;color:#fff;'
          'font:600 13px/1.6 Verdana,sans-serif;padding:2px 12px;border-radius:0 0 10px 10px">Preview: not live yet</div>')
for dp, dn, fn in os.walk(SRC):
    rel = os.path.relpath(dp, SRC)
    if rel.split(os.sep)[0] in SKIP: continue
    for f in fn:
        if f in ('CNAME', 'sitemap.xml', 'robots.txt') or f.endswith('.txt') and rel == '.': continue
        sp = os.path.join(dp, f); tp = os.path.join(DST, rel, f); os.makedirs(os.path.dirname(tp), exist_ok=True)
        if not f.endswith(('.html', '.js', '.css')):
            shutil.copy2(sp, tp); continue
        s = open(sp, encoding='utf-8').read()
        if f.endswith('.html'):
            s = re.sub(r'(href|src|action)="/' + KEEP_ROOT, r'\1="/' + PFX + '/', s)
            s = re.sub(r'<script[^>]*track\.js[^>]*></script>', '', s)
            s = re.sub(r'<script[^>]*cloudflareinsights[^>]*></script>', '', s)
            s = s.replace('<head>', '<head><meta name="robots" content="noindex, nofollow">', 1)
            s = re.sub(r'(<body[^>]*>)', r'\1' + RIBBON, s, count=1)
        if f.endswith(('.js', '.html')):
            s = re.sub(r"(['\"])/play/", r"\1/" + PFX + "/play/", s)
        open(tp, 'w', encoding='utf-8').write(s)
open(os.path.join(DST, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
print('preview at', DST, sum(len(f) for _, _, f in os.walk(DST)), 'files')
