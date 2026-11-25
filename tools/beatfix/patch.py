"""Replace broken beat sounds in a live game without re-encoding its sprite: add one extra voice piece (media/v/fix.mp3)
and point the beats' segments at it. Usage: python3 patch.py <game> id=wav [id=wav ...]"""
import sys,json,re,subprocess,wave,numpy as np,os
sys.path.insert(0,'/home/claude/revkit')
exec(open('/home/claude/games/7ca/r5proc.py').read().split('res={}')[0])
g=sys.argv[1];P=f'/home/claude/cellysite/static/play/{g}'
pairs=[a.split('=',1) for a in sys.argv[2:]]
vj=open(P+'/voice.js').read();m=re.search(r'window\.VOICE=(\{.*?\});\s*$',vj,re.S|re.M);V=json.loads(m.group(1))
cj=open(P+'/media/v/chunks.js').read();CH=json.loads(re.search(r'=(\[.*\]);',cj,re.S).group(1))
CH=[c for c in CH if not c[2].endswith('fix.mp3')]
T0=round(CH[-1][1]+1.0,3);parts=[np.zeros(int(.1*SR),np.float32)];pos=.1
for k,w in pairs:
    a=clean(pcm(w));V['seg'][k]=[round(T0+pos,3),round(len(a)/SR,3)];fr=int(.04*SR)
    V['env'][k]=[min(9,int(np.sqrt(np.mean(a[i:i+fr]**2))/0.012)) for i in range(0,len(a),fr)]
    parts+=[a,np.zeros(int(.3*SR),np.float32)];pos+=len(a)/SR+.3
full=np.concatenate(parts).astype(np.float32)
subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','64k',P+'/media/v/fix.mp3'],input=full.tobytes(),check=True)
# mp3 encoders add a short delay at the start: measure it and shift the segments to match
b=subprocess.run(['ffmpeg','-v','error','-i',P+'/media/v/fix.mp3','-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout;y=np.frombuffer(b,np.float32)
ref=full[:min(len(full),SR*2)];best=max(range(0,3000,5),key=lambda d:float(np.dot(ref[:len(ref)-3000],y[d:d+len(ref)-3000])))
for k,_ in pairs: V['seg'][k][0]=round(V['seg'][k][0]+best/SR,3)
CH.append([T0,round(T0+len(y)/SR,3),'media/v/fix.mp3'])
open(P+'/voice.js','w').write(vj[:m.start(1)]+json.dumps(V)+vj[m.end(1):])
open(P+'/media/v/chunks.js','w').write('window.VOICE_CHUNKS='+json.dumps(CH)+';\n')
print(g,'patched',[k for k,_ in pairs],'offset',best,'fix chunk',CH[-1])
