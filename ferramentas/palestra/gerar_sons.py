"""Gera UMA vez o banco de sons de impacto (sintetizados, sem direitos) em sons/. Rodar: uv run --directory ~/.claude/skills/editor-video python gerar_sons.py"""
import numpy as np, scipy.signal as sg
from scipy.io import wavfile
from pathlib import Path
SR=48000; OUT=Path(__file__).parent/'sons'; OUT.mkdir(exist_ok=True)
def save(n,x): wavfile.write(OUT/f'{n}.wav',SR,x.astype(np.float32))
def hit(f0=95,f1=36,dur=0.9,tau=0.26,amp=1.0):
    n=int(dur*SR); tt=np.arange(n)/SR
    ph=2*np.pi*(f1*tt+(f0-f1)*(1-np.exp(-tt/0.18))*0.18)
    x=np.tanh(np.sin(ph)*np.exp(-tt/tau)*1.8)
    nz=sg.lfilter(*sg.butter(2,220,'low',fs=SR),np.random.RandomState(7).randn(n))*np.exp(-tt/0.05)*2.0
    y=x+0.5*nz; return amp*y/np.abs(y).max()
def riser(dur=1.6):
    n=int(dur*SR); tt=np.arange(n)/SR; u=tt/dur; nz=np.random.RandomState(9).randn(n); out=np.zeros(n); blk=int(0.05*SR)
    for i in range(0,n,blk):
        b,a=sg.butter(2,120+900*(i/n)**2,'low',fs=SR); out[i:i+blk]=sg.lfilter(b,a,nz[i:i+blk])
    tone=np.sin(2*np.pi*(55*tt+27*tt**2/dur)); y=(out/np.abs(out).max()*0.7+tone*0.5)*u**1.8
    return y/np.abs(y).max()
def whoosh(dur=0.5):
    n=int(dur*SR); tt=np.arange(n)/SR; u=tt/dur; nz=np.random.RandomState(11).randn(n); out=np.zeros(n); blk=int(0.025*SR)
    for i in range(0,n,blk):
        b,a=sg.butter(2,150+700*np.sin(np.pi*min(1,i/n)),'low',fs=SR); out[i:i+blk]=sg.lfilter(b,a,nz[i:i+blk])
    y=out*np.sin(np.pi*u)**2; return y/np.abs(y).max()
def drone(dur=75):
    N=int(dur*SR); t=np.arange(N)/SR
    s=lambda f,ph=0: np.sin(2*np.pi*f*t+ph)
    bed=(s(55)+s(55.25,1)*0.6+s(65.41,2)*0.45+s(82.41,3)*0.5+s(110.0,.5)*0.18+s(130.81,1.7)*0.12)*(0.75+0.25*np.sin(2*np.pi*0.09*t))
    nz=sg.lfilter(*sg.butter(2,[60,420],'bandpass',fs=SR),np.random.RandomState(4).randn(N))
    bed=bed/np.abs(bed).max()+0.35*nz/np.abs(nz).max()
    bed=sg.lfilter(*sg.butter(2,500,'low',fs=SR),bed); return bed/np.sqrt((bed**2).mean())
save('drone',drone()); save('hit_grande',hit(100,34,1.1,.34)); save('hit_medio',hit(amp=.8,dur=.8))
save('hit_final',hit(80,30,1.4,.5)); save('whoosh',whoosh()); save('riser',riser(1.6)); print('sons ok')
