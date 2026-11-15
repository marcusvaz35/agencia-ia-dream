import os
import numpy as np, math, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FD=os.path.expanduser('~')+'/.claude/skills/editor-video/assets/fonts/'
MONT=FD+'montserrat/Montserrat-Variable.ttf'
PLAYI=os.path.expanduser('~')+'/Library/Fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf'
_f={}
def font(path,size,w):
    k=(path,size,w)
    if k not in _f:
        f=ImageFont.truetype(path,size)
        try: f.set_variation_by_axes([w])
        except Exception: pass
        _f[k]=f
    return _f[k]
def eo(u): u=min(1,max(0,u)); return 1-(1-u)**3
def eio(u): u=min(1,max(0,u)); return 0.5-0.5*math.cos(math.pi*u)
def back(u):
    u=min(1,max(0,u)); c=1.70158; return 1+(c+1)*(u-1)**3+c*(u-1)**2
BG=(243,243,239); INK=(20,20,20); GRAY=(88,88,82); BLUE=(47,95,208)
def mix(c,a,bg=BG): return tuple(int(bg[i]*(1-a)+c[i]*a) for i in range(3))
_bg=None
def card_bg():
    global _bg
    if _bg is None:
        im=np.zeros((1920,1080,3),np.float32); im[:]=BG
        yy,xx=np.mgrid[0:1920,0:1080]
        line=((xx%72==0)|(yy%72==0)).astype(np.float32)
        fade=np.clip(1-np.sqrt(((xx-540)/620)**2+((yy-900)/1100)**2),0,1)
        im-= (line*fade*10)[...,None]
        _bg=np.clip(im,0,255).astype(np.uint8)
    return _bg
S=2
def tl(d,xy,t,f,fill,ls=0,anchor='ls'):
    # text with letter spacing (px at 1x), anchor ls/ms
    x,y=xy
    if ls==0: d.text((x*S,y*S),t,font=f,fill=fill,anchor=anchor); return
    w=sum(d.textlength(c,font=f) for c in t)+ls*S*(len(t)-1)
    if anchor=='ms': x=x-w/S/2
    cx=x*S
    for c in t:
        d.text((cx,y*S),c,font=f,fill=fill,anchor='ls'); cx+=d.textlength(c,font=f)+ls*S
def label(d,text,t,t0):
    p=eo((t-t0)/0.3)
    if p<=0: return
    dy=(1-p)*14
    d.rounded_rectangle([150*S,(252+dy)*S,172*S,(274+dy)*S],radius=4*S,fill=mix(INK,p))
    tl(d,(186,274+dy-4),text,font(MONT,26*S,600),mix(GRAY,p),ls=3.2)
def title(d,l1,l2,t,t1,t2,s1=100,s2=78):
    p=eo((t-t1)/0.38)
    if p>0: tl(d,(540,470+(1-p)*30),l1,font(MONT,s1*S,700),mix(INK,p),anchor='ms')
    p=eo((t-t2)/0.42)
    if p>0: tl(d,(540,570+(1-p)*30),l2,font(PLAYI,s2*S,500),mix(BLUE,p),anchor='ms')
def caption(d,chunk,k,cy=1470):
    f=font(MONT,42*S,600); sp=d.textlength(' ',font=f)
    ws=[d.textlength(w,font=f) for w in chunk]; tot=sum(ws)+sp*(len(ws)-1); x=540*S-tot/2
    for i,w in enumerate(chunk):
        d.text((x,cy*S),w,font=f,fill=INK,anchor='ls')
        if i==k: d.line([x,(cy+12)*S,x+ws[i],(cy+12)*S],fill=BLUE,width=3*S)
        x+=ws[i]+sp
def finish(im): return cv2.resize(np.asarray(im),(1080,1920),interpolation=cv2.INTER_AREA)[:,:,::-1].copy()
_bg2=None
def new_canvas():
    global _bg2
    if _bg2 is None: _bg2=cv2.resize(card_bg(),(1080*S,1920*S),interpolation=cv2.INTER_LINEAR)
    return Image.fromarray(_bg2.copy())
def card_dots(t,T,cap,sp_=None):
    """T: dict times (s since card start): lab,t_line1,t_fill,t_line2. 10x10 dots, 3 filled."""
    im=new_canvas(); d=ImageDraw.Draw(im)
    sp_=sp_ or {}
    label(d,sp_.get('lab','RENDA NO BRASIL'),t,T['lab'])
    title(d,sp_.get('l1','Somente 3%'),sp_.get('l2','ganha mais de R$ 27 mil.'),t,T['l1'],T['l2'],100,72)
    nfill=sp_.get('preenchidas',3)
    r=17; sp=66; x0=540-sp*4.5; y0=800
    for i in range(100):
        row,col=divmod(i,10)
        p=eo((t-(0.12+row*0.045+col*0.008))/0.3)
        if p<=0: continue
        cx=x0+col*sp; cy=y0+row*sp+(1-p)*18
        filled=i<nfill
        if filled:
            q=back((t-(T['fill']+i*0.14))/0.35)
            if t>=T['fill']+i*0.14:
                rr=r*(0.6+0.4*q)*1.12
                d.ellipse([(cx-rr)*S,(cy-rr)*S,(cx+rr)*S,(cy+rr)*S],fill=BLUE)
                d.ellipse([(cx-5)*S,(cy-5)*S,(cx+5)*S,(cy+5)*S],fill=(255,255,255))
                continue
        rr=r*(0.7+0.3*p)
        d.ellipse([(cx-rr)*S,(cy-rr)*S,(cx+rr)*S,(cy+rr)*S],outline=mix((70,70,66),p*0.75),width=3*S)
    if cap: caption(d,*cap)
    return finish(im)
def card_bars(t,T,cap,sp_=None):
    """5 pills, widths converge ('por igual'), then all blue. T: lab,l1,l2,eq,lit"""
    im=new_canvas(); d=ImageDraw.Draw(im)
    sp_=sp_ or {}
    label(d,sp_.get('lab','A CADA 7 ANOS'),t,T['lab'])
    title(d,sp_.get('l1','Sete anos'),sp_.get('l2','riquezas redivididas.'),t,T['l1'],T['l2'],100,72)
    names=sp_.get('itens',['Bilionário','Milionário','Rico','Médio','Pobre']); w0=sp_.get('larguras',[780,640,500,380,260]); wf=sum(w0)/len(w0)
    f=font(MONT,30*S,600)
    q=eio((t-T['eq'])/0.75)
    for i,n in enumerate(names):
        p=eo((t-(0.1+i*0.07))/0.32)
        if p<=0: continue
        w=w0[i]+(wf-w0[i])*q; y=790+i*(108 if len(names)<=5 else 92)+(1-p)*16; x=150
        lit=eo((t-(T['lit']+i*0.09))/0.25)
        fill=mix(BLUE,lit) if lit>0 else None
        d.rounded_rectangle([x*S,y*S,(x+w)*S,(y+72)*S],radius=36*S,outline=mix((40,40,40),p),width=3*S,fill=fill)
        col=mix(INK,p) if lit<=0 else tuple(int(INK[j]*(1-lit)+255*lit) for j in range(3))
        d.text(((x+34)*S,(y+36)*S+f.size*0.0),n,font=f,fill=col,anchor='lm')
    if cap: caption(d,*cap)
    return finish(im)
# ---------- legenda (ref-3)
_lc={}
def legend_layer(chunk,cy=1005):
    """retorna (y0,x0,rgba_crop) so da regiao do texto"""
    key=(tuple(chunk),cy)
    if key in _lc: return _lc[key]
    f=font(MONT,44,600); d=ImageDraw.Draw(Image.new('RGB',(4,4)))
    text=' '.join(chunk); w=int(d.textlength(text,font=f))+60; h=110
    x0=max(0,540-w//2); y0=cy-70
    sh=Image.new('RGBA',(1080,h),(0,0,0,0)); tx=Image.new('RGBA',(1080,h),(0,0,0,0))
    ImageDraw.Draw(sh).text((540,70+2),text,font=f,fill=(0,0,0,170),anchor='ms')
    ImageDraw.Draw(tx).text((540,70),text,font=f,fill=(255,255,255,255),anchor='ms')
    sh=sh.filter(ImageFilter.GaussianBlur(3.5))
    a=np.asarray(Image.alpha_composite(sh,tx))[:,x0:min(1080,x0+w)].copy(); _lc[key]=(y0,x0,a); return _lc[key]
def blend(img,y0,x0,rgba):
    h,w=rgba.shape[:2]
    roi=img[y0:y0+h,x0:x0+w]
    a=rgba[...,3:4].astype(np.float32)*(1/255)
    roi[:]=(roi*(1-a)+rgba[...,2::-1]*a).astype(np.uint8)
    return img
# ---------- destaques (ref-3): italico black, gradiente, glow, blur-in
def hl_line(text,size,grad,maxw=900):
    f=font(MONT,size,900)
    d=ImageDraw.Draw(Image.new('L',(4,4)))
    def width(sz):
        ff=font(MONT,sz,900); return sum(d.textlength(c,font=ff) for c in text)-0.045*sz*(len(text)-1)
    while width(size)>maxw and size>40: size-=4
    f=font(MONT,size,900); W_=int(width(size))+int(size*0.5); H_=int(size*1.5)
    m=Image.new('L',(W_,H_),0); dm=ImageDraw.Draw(m); x=int(size*0.2); base=int(size*1.1)
    for c in text:
        dm.text((x,base),c,font=f,fill=255,anchor='ls'); x+=d.textlength(c,font=f)-0.045*size
    sh=0.2
    m=m.transform(m.size,Image.AFFINE,(1,sh,-sh*base,0,1,0),resample=Image.BICUBIC)
    ma=np.asarray(m).astype(np.float32)/255
    g=np.zeros((H_,W_,3),np.float32)
    top,bot=np.array(grad[0],np.float32),np.array(grad[1],np.float32)
    for yy in range(H_):
        u=min(1,max(0,(yy-base+size*0.75)/(size*0.8))); g[yy]=top*(1-u)+bot*u
    glow=cv2.GaussianBlur(ma,(0,0),size*0.06)
    rgba=np.zeros((H_,W_,4),np.float32)
    gc=np.array(grad[1],np.float32)
    # glow underneath, text on top
    a_g=glow*0.55; a_t=ma
    rgb=(gc*a_g[...,None]*(1-a_t[...,None])+g*a_t[...,None])
    a=a_g*(1-a_t)+a_t
    rgba[...,:3]=rgb/np.maximum(a[...,None],1e-4); rgba[...,3]=a
    return rgba,(W_,H_)
WHITE=((255,255,255),(225,225,225)); CYAN=((60,205,255),(20,105,235)); RED=((255,120,40),(215,20,20))
def hl_block(lines,cy,maxw=900,sp=0.78):
    """lines: [(text,size,grad,t_start)] -> list of (rgba, x, y, t_start)"""
    out=[]; hs=[]
    for tx,sz,gr,t0 in lines:
        r,(w,h)=hl_line(tx,sz,gr,maxw); hs.append(h*sp); out.append([r,w,h,t0])
    total=sum(hs); y=cy-total/2; res=[]
    for (r,w,h,t0),hh in zip(out,hs):
        res.append((r,int(540-w/2),int(y-(h-hh)/2),t0)); y+=hh
    return res
def hl_apply(img,block,t):
    for r,x,y,t0 in block:
        u=(t-t0)/0.30
        if u<=0: continue
        e=eo(u); h,w=r.shape[:2]
        if y<0 or x<0 or y+h>1920 or x+w>1080: continue
        a=r[...,3]*e
        rr=r[...,:3]
        blur=(1-e)*14
        if blur>0.6:
            ap=cv2.GaussianBlur(np.dstack([rr*a[...,None],a]),(0,0),blur); a=ap[...,3]; rr=ap[...,:3]/np.maximum(a[...,None],1e-4)
        # left-to-right wipe with feather
        xs=np.arange(w); edge=-60+(w+120)*min(1,u*1.15)
        mk=np.clip((edge-xs)/60,0,1)[None,:]; a=a*mk
        roi=img[y:y+h,x:x+w].astype(np.float32)
        img[y:y+h,x:x+w]=(roi*(1-a[...,None])+rr[...,::-1]*a[...,None]).astype(np.uint8)
    return img


_lw = {}
def legend_word(chunk, cy=1230, size=96, S=1):
    """estilo so-legenda (ref-4): 1 palavra (ou 2 curtas), Helvetica Bold branca, sombra suave, centralizada. S=2 -> 4K."""
    key = (tuple(chunk), cy, S)
    if key in _lw: return _lw[key]
    cy *= S; size *= S; WW = 1080 * S
    f = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', size, index=1)
    d = ImageDraw.Draw(Image.new('RGB', (4, 4)))
    text = ' '.join(chunk); w = int(d.textlength(text, font=f)) + 80 * S; h = 190 * S
    x0 = max(0, WW // 2 - w // 2); y0 = cy - 110 * S
    sh = Image.new('RGBA', (WW, h), (0, 0, 0, 0)); tx = Image.new('RGBA', (WW, h), (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((WW // 2, 110 * S + 5 * S), text, font=f, fill=(0, 0, 0, 190), anchor='mm')
    ImageDraw.Draw(tx).text((WW // 2, 110 * S), text, font=f, fill=(255, 255, 255, 255), anchor='mm')
    sh = sh.filter(ImageFilter.GaussianBlur(5 * S))
    a = np.asarray(Image.alpha_composite(sh, tx))[:, x0:min(WW, x0 + w)].copy(); _lw[key] = (y0, x0, a); return _lw[key]
