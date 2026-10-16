function makePDF(){
const PW=595,PH=842,NAVY='#0A2A4A',INK='#0B2239',GRAY='#334155',MUTE='#64748B',SEA='#1B7FB3',SEAD='#0F5F8A',GOLD='#FFD9A0',GOLD2='#E8A94B',LINE='#D6E4EE',CARD='#F4F8FB',SKY='#9FD3F0',WHITE='#FFFFFF';
const HW=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const HB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
const sw=(s,z,b,sp)=>{let w=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i)-32;w+=(b?HB:HW)[c>=0&&c<95?c:0]}return w*z/1000+(sp||0)*s.length};
const f=n=>String(Math.round(n*100)/100),hx=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255].map(v=>f(v/255)).join(' ')};
const esc=t=>t.replace(/[^\x20-\x7e]/g,'').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
let C=[];const SB=[],MN=[],links=[],op=s=>C.push(s),fill=h=>op(hx(h)+' rg'),strk=h=>op(hx(h)+' RG'),al=i=>op('/G'+i+' gs'),Q0=()=>op('q'),Q1=()=>op('Q');
const rect=(x,y,w,h)=>op(f(x)+' '+f(y)+' '+f(w)+' '+f(h)+' re f'),K=.5523;
const rr=(x,y,w,h,r)=>{r=Math.min(r,w/2,h/2);const k=r*(1-K),a=[x+r,y,x+w-r,y,x+w-k,y,x+w,y+k,x+w,y+r,x+w,y+h-r,x+w,y+h-k,x+w-k,y+h,x+w-r,y+h,x+r,y+h,x+k,y+h,x,y+h-k,x,y+h-r,x,y+r,x,y+k,x+k,y,x+r,y].map(f);
 op(a[0]+' '+a[1]+' m '+a[2]+' '+a[3]+' l '+a[4]+' '+a[5]+' '+a[6]+' '+a[7]+' '+a[8]+' '+a[9]+' c '+a[10]+' '+a[11]+' l '+a[12]+' '+a[13]+' '+a[14]+' '+a[15]+' '+a[16]+' '+a[17]+' c '+a[18]+' '+a[19]+' l '+a[20]+' '+a[21]+' '+a[22]+' '+a[23]+' '+a[24]+' '+a[25]+' c '+a[26]+' '+a[27]+' l '+a[28]+' '+a[29]+' '+a[30]+' '+a[31]+' '+a[32]+' '+a[33]+' c f')};
const circ=(cx,cy,r)=>rr(cx-r,cy-r,2*r,2*r,r);
const tx=(s,x,y,z,b,col,sp,it)=>{fill(col);op('BT /F'+(it?3:b?2:1)+' '+f(z)+' Tf '+f(sp||0)+' Tc '+f(x)+' '+f(y)+' Td ('+esc(s)+') Tj ET')};
const lk=(x,y,w,h,u)=>links.push([x,y,x+w,y+h,u]);
const wrap=(s,maxW,z,b)=>{const o=[];let l='';for(const w of s.split(' ')){const t=l?l+' '+w:w;if(l&&sw(t,z,b)>maxW){o.push(l);l=w}else l=t}if(l)o.push(l);return o};
const fit=(s,maxW,z,b)=>{while(z>6&&sw(s,z,b)>maxW)z-=.25;return z};
const chip=(s,x,y,z,tc,bg,a,ph)=>{ph=ph||5;const h=z+6,w=sw(s,z,0)+2*ph;if(a){Q0();al(a)}fill(bg);rr(x,y,w,h,h/2);if(a)Q1();tx(s,x+ph,y+(h-z*.72)/2,z,0,tc);return w};
const wave=(base,amp,len,ph,a,col)=>{Q0();op('0 0 192 842 re W n');al(a);fill(col);let s='0 '+f(base+amp*Math.sin(ph))+' m ';for(let x=4;x<=192;x+=4)s+=f(x)+' '+f(base+amp*Math.sin(ph+x/len*6.2832))+' l ';op(s+'192 0 l 0 0 l f');Q1()};
// ================= SIDEBAR (digambar ke SB, dimasukkan setelah kolom utama) =================
C=SB;fill(NAVY);rect(0,0,192,PH);
Q0();op('0 0 192 842 re W n');al(1);fill(GOLD);circ(176,820,86);al(2);circ(176,820,52);Q1();
wave(110,7,120,.4,3,SEA);wave(84,6,96,1.6,4,SEA);wave(58,6,140,3.1,5,SEA);wave(30,5,110,4.4,4,SKY);
fill(GOLD);circ(96,764,31);tx('EA',96-sw('EA',25,1,.5)/2,764-9,25,1,NAVY,.5);
let y=PH-146;const SX=22,SW=148;
const sh=(t)=>{tx(t,SX,y,7.4,1,GOLD,1.8);Q0();al(3);strk(GOLD);op('0.6 w '+SX+' '+f(y-5)+' m '+(SX+SW)+' '+f(y-5)+' l S');Q1();y-=20};
sh('KONTAK');
[['EMAIL','evanatharasya@gmail.com','mailto:evanatharasya@gmail.com'],['GITHUB','github.com/ESTAS-crypto','https://github.com/ESTAS-crypto'],['LINKEDIN','linkedin.com/in/evanatharasya','https://www.linkedin.com/in/evanatharasya'],['INSTAGRAM','@evanatharasya.x','https://www.instagram.com/evanatharasya.x'],['PORTOFOLIO','portofolio-evan-atharasya.vercel.app','https://portofolio-evan-atharasya.vercel.app/']].forEach(c=>{
 tx(c[0],SX,y,6.4,1,SKY,1.3);const z=fit(c[1],SW,8.6,0);tx(c[1],SX,y-11,z,0,WHITE);lk(SX,y-13,sw(c[1],z,0),z+3,c[2]);y-=29});
y-=8;sh('KEAHLIAN');
[['BAHASA',['JavaScript','TypeScript','PHP','Python']],['FRONTEND & MOBILE',['React','Next.js','Three.js','Tailwind','Bootstrap','Flutter']],['BACKEND & DATA',['Node.js','Laravel','MySQL','MongoDB','Firebase','Supabase']],['ALAT',['Docker','Git']]].forEach(g=>{
 tx(g[0],SX,y,6.4,1,SKY,1.3);y-=17;let x=SX;g[1].forEach(s=>{const w=sw(s,7.6,0)+10;if(x+w>SX+SW){x=SX;y-=17}chip(s,x,y,7.6,WHITE,WHITE,2);x+=w+4});y-=28});
y-=4;sh('SEKILAS');
[['47','repositori di GitHub'],['18','teknologi yang dipakai'],['3','proyek utama']].forEach(s=>{tx(s[0],SX,y-14,22,1,GOLD);tx(s[1],SX+sw(s[0],22,1)+8,y-12,8,0,WHITE);y-=30});
tx('Dari langit sampai dasar laut.',SX,134,8.6,0,GOLD,0,1);tx('Selami portofolio interaktifnya.',SX,122,7.4,0,SKY);lk(SX,120,sw('Selami portofolio interaktifnya.',7.4,0),9,'https://portofolio-evan-atharasya.vercel.app/');
// ================= UTAMA (urutan baca pertama) =================
C=MN;const MX=222,MW=333;let t=PH-50;
tx('Evan Atharasya',MX,t-24,31,1,NAVY,-.3);
tx('FULL-STACK DEVELOPER',MX,t-44,9.4,1,SEA,2.3);
fill(GOLD2);rect(MX,t-58,38,3);tx('Indonesia',MX+48,t-60,8.2,0,MUTE);
t-=84;
const sec=(title)=>{tx(title,MX,t,8.2,1,NAVY,1.8);const w=sw(title,8.2,1,1.8)+10;Q0();strk(LINE);op('0.8 w '+f(MX+w)+' '+f(t+2.6)+' m '+(MX+MW)+' '+f(t+2.6)+' l S');Q1();t-=18};
sec('RINGKASAN');
wrap('Full-stack developer dari Indonesia yang membangun aplikasi web, bot, dan alat berbasis AI, dari toko online hingga manajemen keuangan. Saya suka antarmuka yang nyaman dan kode yang rapi.',MW,9.2,0).forEach(l=>{tx(l,MX,t,9.2,0,GRAY);t-=13.4});
t-=12;sec('PROYEK UNGGULAN');
const FEAT=[['LUVENCE ID',GOLD2,['React','Three.js','Supabase'],'E-commerce parfum mewah dengan botol 3D interaktif, pembayaran Midtrans, ongkir RajaOngkir, dan AI Gemini.','luvence-id.vercel.app','https://luvence-id.vercel.app/','Belanja terasa mewah, dengan pertahanan siber berlapis dan notifikasi real-time ke Discord.'],
['VendTrack','#3B82C4',['Next.js','TypeScript','Supabase'],'Platform intelijen pasar Growtopia: vending machine, kurs DL/BGL ke Rupiah, dan radar moderator real-time.','vend-finder.vercel.app','https://vend-finder.vercel.app/','Satu tempat memantau pasar, dengan keamanan berlapis seperti rate limiter dan sesi HMAC-SHA256.'],
['Laporan Kunjungan Rumah','#1FA08A',['Flutter','Supabase','Privat'],'Aplikasi Android offline-first untuk kader dan petugas puskesmas mencatat kunjungan rumah pasien.','','','Laporan tersusun rapi, data aman lewat Row-Level Security, dan siap dicetak.']];
FEAT.forEach(p=>{const pad=10,iw=MW-pad*2-6,lines=wrap(p[3],iw,8.5,0),lw=sw('HASIL',6.4,1,1.2)+8,rl=wrap(p[6],iw-lw,8.3,0),h=pad+13+19+lines.length*11.6+4+rl.length*11.2+(p[4]?15:4)+pad-4,top=t;
 Q0();fill(CARD);rr(MX,top-h,MW,h,6);Q1();Q0();fill(p[1]);rr(MX,top-h,3.4,h,1.7);Q1();
 let cy=top-pad-9;tx(p[0],MX+pad+4,cy,10.8,1,NAVY);
 cy-=19;let cx=MX+pad+4;p[2].forEach(s=>{cx+=chip(s,cx,cy-3.4,7,SEAD,'#DCEBF5',0,4.5)+4});
 cy-=14;lines.forEach(l=>{tx(l,MX+pad+4,cy,8.5,0,GRAY);cy-=11.6});
 cy-=3;tx('HASIL',MX+pad+4,cy,6.4,1,'#9A6412',1.2);rl.forEach(l=>{tx(l,MX+pad+4+lw,cy,8.3,0,GRAY);cy-=11.2});
 if(p[4]){tx(p[4],MX+pad+4,cy-2,8,1,SEAD);lk(MX+pad+4,cy-4,sw(p[4],8,1),10,p[5])}
 t-=h+9});
t-=6;sec('PROYEK LAINNYA');
const OTH=[['Tryout SNBT','JavaScript','#E8C547','https://github.com/ESTAS-crypto/TRYOUT-SNBT','Simulasi ujian SNBT dengan 340+ soal latihan.'],['GenZMart PRO','PHP','#7A86B8','https://github.com/ESTAS-crypto/GenZMart-PRO','E-commerce untuk marketplace anak muda.'],['AI Chatbot Next.js','TypeScript, Next.js','#3B82C4','https://github.com/ESTAS-crypto/nextjs-ai-chatbot','Chatbot berbasis AI dengan Next.js.'],['AI Gratis','JavaScript','#E8C547','https://github.com/ESTAS-crypto/AI-GRATIS','Kumpulan alat AI gratis dalam satu tempat.'],['Manajemen Keuangan','PHP','#7A86B8','https://github.com/ESTAS-crypto/ManajemenKeuangan','Mencatat dan memantau arus uang.'],['Track Location','Python','#3B7DA8','https://github.com/ESTAS-crypto/track-location','Alat Python untuk melacak data lokasi.'],['Sistem Laporan','JavaScript','#E8C547','https://github.com/ESTAS-crypto/Laporan-ibuk-','Pengelolaan laporan berbasis JavaScript.']];
const rowsFit=ex=>Math.max(0,Math.floor((t-32-56-ex)/46)+1);let shownN=OTH.length;if(Math.ceil(OTH.length/2)>rowsFit(0))shownN=Math.min(OTH.length,rowsFit(14)*2);
OTH.slice(0,shownN).forEach((o,i)=>{const col=i%2,row=i>>1,x=MX+col*(MW/2+4),yy=t-row*46;fill(o[2]);circ(x+3,yy+3,3);tx(o[0],x+12,yy,8.8,1,NAVY);tx(o[1],x+12,yy-10.5,7.2,1,SEAD);wrap(o[4],MW/2-18,7.6,0).forEach((l,j)=>tx(l,x+12,yy-21-j*9.6,7.6,0,GRAY));lk(x+10,yy-34,MW/2-14,46,o[3])});
const rowsUsed=Math.ceil(shownN/2);
if(shownN<OTH.length){const nt='+'+(OTH.length-shownN)+' proyek lainnya di portofolio';tx(nt,MX,t-rowsUsed*46+6,7.8,0,MUTE,0,1);lk(MX,t-rowsUsed*46+4,sw(nt,7.8,0),10,'https://portofolio-evan-atharasya.vercel.app/')}
t-=rowsUsed*46+4;
Q0();strk(LINE);op('0.8 w '+MX+' 44 m '+(MX+MW)+' 44 l S');Q1();
tx('Daftar lengkap dan demo interaktif:',MX,30,7.6,0,MUTE);const u='portofolio-evan-atharasya.vercel.app';tx(u,MX+sw('Daftar lengkap dan demo interaktif: ',7.6,0),30,7.6,1,SEAD);lk(MX+sw('Daftar lengkap dan demo interaktif: ',7.6,0),28,sw(u,7.6,1),10,'https://portofolio-evan-atharasya.vercel.app/');
const BL=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],dn=new Date();tx('Diperbarui '+BL[dn.getMonth()]+' '+dn.getFullYear(),MX,19,7,0,MUTE);
// ================= PDF =================
const ALPHA=[.08,.12,.18,.26,.38],objs=[],add=o=>objs.push(o);
add('<< /Type /Catalog /Pages 2 0 R /Lang (id-ID) >>');add('');
add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>');
add('<< /Title (CV Evan Atharasya - Full-stack Developer) /Author (Evan Atharasya) /Subject (Curriculum vitae) /Keywords (full-stack, React, Next.js, Flutter, Supabase) >>');
ALPHA.forEach(a=>add('<< /Type /ExtGState /ca '+a+' /CA '+a+' >>'));
const body=MN.concat(SB).join('\n');add('<< /Length '+body.length+' >>\nstream\n'+body+'\nendstream');const content=objs.length;
const annots=links.map(l=>{add('<< /Type /Annot /Subtype /Link /Rect ['+l.slice(0,4).map(f).join(' ')+'] /Border [0 0 0] /A << /S /URI /URI ('+esc(l[4])+') >> >>');return objs.length+' 0 R'});
add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> /ExtGState << /G1 7 0 R /G2 8 0 R /G3 9 0 R /G4 10 0 R /G5 11 0 R >> >> /Contents '+content+' 0 R /Annots ['+annots.join(' ')+'] >>');
objs[1]='<< /Type /Pages /Count 1 /Kids ['+objs.length+' 0 R] >>';
let out='%PDF-1.4\n';const off=[];objs.forEach((o,i)=>{off.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n'});const xr=out.length;
out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R /Info 6 0 R >>\nstartxref\n'+xr+'\n%%EOF\n';
return {bytes:new TextEncoder().encode(out),endY:t}}
