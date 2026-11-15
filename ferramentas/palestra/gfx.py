import os
import numpy as np, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FD=os.path.expanduser('~')+'/.claude/skills/editor-video/assets/fonts/'
MONT=FD+'montserrat/Montserrat-Variable.ttf'
PLAY=os.path.expanduser('~')+'/Library/Fonts/PlayfairDisplay-VariableFont_wght.ttf'
def font(path,size,w):
    f=ImageFont.truetype(path,size)
    try: f.set_variation_by_axes([w])
    except Exception as e: print('var',e)
    return f
def headline_layer(text,maxw=940,bottom=1500,size=60,S=1):
    maxw*=S; bottom*=S; size*=S
    while True:
        f=font(MONT,size,800); pad=40*S; inner=maxw-2*pad
        words=text.split(); lines=[];cur=''
        d=ImageDraw.Draw(Image.new('RGB',(10,10)))
        for w in words:
            t=(cur+' '+w).strip()
            if d.textlength(t,font=f)<=inner: cur=t
            else: lines.append(cur);cur=w
        lines.append(cur)
        if len(lines)<=3: break
        size-=2*S
    lh=int(size*1.28); h=len(lines)*lh+2*34*S
    im=Image.new('RGBA',(1080*S,1920*S),(0,0,0,0)); dr=ImageDraw.Draw(im)
    x0=(1080*S-maxw)//2; y1=bottom; y0=y1-h
    dr.rounded_rectangle([x0,y0,x0+maxw,y1],radius=30*S,fill=(255,255,255,255))
    y=y0+34*S+ (lh-size)//2
    for l in lines:
        dr.text((540*S,y+size*0.86),l,font=f,fill=(10,10,10,255),anchor='ms'); y+=lh
    return im,(x0,y0,x0+maxw,y1),size,len(lines)
EMPH=set()  # palavras que ganham destaque (preencha por vídeo, em minúsculas)
def norm(w): return ''.join(c for c in w.lower() if c.isalnum() or c in '%$')
_cache={}
def legend_layer(tokens,cy=1000):
    key=(tuple(tokens),cy)
    if key in _cache: return _cache[key]
    fb=font(MONT,66,700); fe=font(PLAY,84,800)
    d=ImageDraw.Draw(Image.new('RGB',(10,10)))
    items=[(t,norm(t) in EMPH) for t in tokens]
    def wd(t,e): return d.textlength(t,font=fe if e else fb)
    sp=d.textlength(' ',font=fb)
    total=sum(wd(t,e) for t,e in items)+sp*(len(items)-1)
    lines=[items]
    if total>800 and len(items)>1:
        best=None
        for k in range(1,len(items)):
            a=sum(wd(t,e) for t,e in items[:k])+sp*(k-1); b=sum(wd(t,e) for t,e in items[k:])+sp*(len(items)-k-1)
            m=max(a,b)
            if best is None or m<best[0]: best=(m,k)
        lines=[items[:best[1]],items[best[1]:]]
    sh=Image.new('RGBA',(1080,1920),(0,0,0,0)); tx=Image.new('RGBA',(1080,1920),(0,0,0,0))
    ds=ImageDraw.Draw(sh); dt=ImageDraw.Draw(tx)
    lh=104; y0=cy-(len(lines)-1)*lh/2
    for li,line in enumerate(lines):
        tw=sum(wd(t,e) for t,e in line)+sp*(len(line)-1)
        x=540-tw/2; base=y0+li*lh+26
        for t,e in line:
            f=fe if e else fb
            ds.text((x+2,base+4),t,font=f,fill=(0,0,0,200),anchor='ls')
            dt.text((x,base),t,font=f,fill=(255,255,255,255),anchor='ls')
            x+=wd(t,e)+sp
    sh=sh.filter(ImageFilter.GaussianBlur(7))
    out=Image.alpha_composite(sh,tx)
    a=np.asarray(out).copy(); _cache[key]=a; return a
CREAM=(248,244,232)
def pen_ellipse(dr,cx,cy,rx,ry,prog,seed=3,w=11):
    random.seed(seed); n=90; pts=[]
    tot=1.06
    for i in range(int(n*tot*prog)+1):
        th=-math.pi/2-0.5+ (i/n)*2*math.pi
        j=1+0.025*math.sin(th*3+seed)+0.015*math.sin(th*7)
        r=1+ (i/n)*0.04
        pts.append((cx+rx*r*j*math.cos(th),cy+ry*r*j*math.sin(th)))
    if len(pts)>1: dr.line(pts,fill=(30,30,30),width=w,joint='curve')
def cardA(t,reveal):
    # reveal: dict of booleans line2,line3; t seconds since card start
    im=Image.new('RGB',(1080,1920),CREAM); dr=ImageDraw.Draw(im)
    f1=font(MONT,430,900); f2=font(MONT,60,700); f3=font(MONT,150,800)
    dr.text((540,760),'3%',font=f1,fill=(20,20,20),anchor='ms')
    bb=dr.textbbox((540,760),'3%',font=f1,anchor='ms')
    pen_ellipse(dr,540,(bb[1]+bb[3])/2,(bb[2]-bb[0])/2+80,(bb[3]-bb[1])/2+70,min(1,t/0.45))
    if reveal.get('l2'): dr.text((540,1000),'do Brasil ganha mais de',font=f2,fill=(20,20,20),anchor='ms')
    if reveal.get('l3'): dr.text((540,1170),'R$ 27 mil',font=f3,fill=(20,20,20),anchor='ms')
    return np.asarray(im)[:,:,::-1].copy()
def cardB(n):
    im=Image.new('RGB',(1080,1920),CREAM); dr=ImageDraw.Draw(im)
    texts=['SETE ANOS,','AS RIQUEZAS','REDIVIDIDAS,','TODAS POR IGUAL.']
    f=font(MONT,84,800); y=470
    for i,t in enumerate(texts[:n]):
        w=dr.textlength(t,font=f); bw=w+90; x0=540-bw/2
        if i==3:
            g=Image.new('RGB',(int(bw),170))
            gp=np.zeros((170,int(bw),3),np.uint8)
            for xx in range(int(bw)):
                u=xx/bw; c=np.array([255,150,40])*(1-u)+np.array([200,40,90])*u; gp[:,xx]=c
            g=Image.fromarray(gp); m=Image.new('L',g.size,0); ImageDraw.Draw(m).rounded_rectangle([0,0,g.size[0],170],radius=26,fill=255)
            im.paste(g,(int(x0),y),m)
        else:
            dr.rounded_rectangle([x0,y,x0+bw,y+170],radius=26,fill=(14,14,14))
        dr.text((540,y+85+30),t,font=f,fill=(255,255,255),anchor='ms')
        y+=215
    return np.asarray(im)[:,:,::-1].copy()
