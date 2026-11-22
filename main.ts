import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
const T="!5e\"*+/0        '''''''&'''&''' '''             ABBA!           &#              \"\"%\"";
// Decode the opcode table once at load: immediate length (-1 = no such opcode), pops, pushes.
const IM=new Int8Array(256),PO=new Int8Array(256),PU=new Int8Array(256);
for(let i=0;i<256;i++){const t=(T.charCodeAt(i)||0)-33;IM[i]=t<0?-1:t>>4;PO[i]=t&3;PU[i]=(t>>2)&3;}
function run(p,q){
 const D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
 let s=0,c=0,pc=0,st=0,ip=0,ol=0;
 const F=e=>({o:o.slice(0,ol),e});
 for(;;){
  if(st===1e6)return F(10);
  if(pc<0||pc>=p.length)return F(9);
  const b=p[pc],im=IM[b];
  if(im<0)return F(5);
  const po=PO[b],pu=PU[b];
  if(pc+im>=p.length)return F(9);
  st++;
  const nx=pc+1+im;
  if(s<po)return F(2);
  if(s-po+pu>256)return F(3);
  pc=nx;
  if(b>=0x10&&b<=0x22&&b!==0x17&&b!==0x1b){
   const y=D[s-1],x=D[s-2];let r;
   switch(b){
    case 0x10:r=(x+y)|0;break;
    case 0x11:r=(x-y)|0;break;
    case 0x12:r=Math.imul(x,y);break;
    case 0x13:{if(!y)return F(4);r=x===-2147483648&&y===-1?x:(x/y)|0;break;}
    case 0x14:{if(!y)return F(4);r=y===-1?0:x%y|0;break;}
    case 0x15:{if(!y)return F(4);r=Math.floor((x>>>0)/(y>>>0))|0;break;}
    case 0x16:{if(!y)return F(4);r=(x>>>0)%(y>>>0)|0;break;}
    case 0x18:r=x&y;break;
    case 0x19:r=x|y;break;
    case 0x1a:r=x^y;break;
    case 0x1c:r=x<<(y&31);break;
    case 0x1d:r=x>>(y&31);break;
    case 0x1e:r=(x>>>(y&31))|0;break;
    case 0x20:r=x===y?1:0;break;
    case 0x21:r=x<y?1:0;break;
    default:r=(x>>>0)<(y>>>0)?1:0;
   }
   s-=2;D[s++]=r;continue;
  }
  switch(b){
   case 0:return F(0);
   case 1:D[s++]=(p[nx-1]<<24)>>24;break;
   case 2:D[s++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;break;
   case 3:s--;break;
   case 4:D[s]=D[s-1];s++;break;
   case 5:{const v=D[s-1];D[s-1]=D[s-2];D[s-2]=v;break;}
   case 6:D[s]=D[s-2];s++;break;
   case 7:{const v=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=v;break;}
   case 0x17:D[s-1]=-D[s-1]|0;break;
   case 0x1b:D[s-1]=~D[s-1];break;
   case 0x30:case 0x31:case 0x32:{
    const r=((p[nx-2]|p[nx-1]<<8)<<16)>>16;
    let k=1;
    if(b!==0x30){const v=D[--s];k=b===0x31?v===0:v!==0;}
    if(k)pc=nx+r;
    break;}
   case 0x33:if(c===64)return F(7);C[c++]=nx;pc=p[nx-2]|p[nx-1]<<8;break;
   case 0x34:if(!c)return F(8);pc=C[--c];break;
   case 0x40:{const a=D[s-1];if(a<0||a>255)return F(6);D[s-1]=M[a];break;}
   case 0x41:{const a=D[s-1],v=D[s-2];if(a<0||a>255)return F(6);s-=2;M[a]=v;break;}
   case 0x50:{const t=String(D[s-1]);if(ol+t.length>65536)return F(11);s--;for(let i=0;i<t.length;i++)o[ol++]=t.charCodeAt(i);break;}
   case 0x51:if(ol+1>65536)return F(11);o[ol++]=D[--s]&255;break;
   case 0x52:D[s++]=ip<q.length?q[ip++]:-1;break;
   case 0x53:return F(D[--s]&255);
  }
 }
}
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of readdirSync(I).sort()){
 const r=run(new Uint8Array(readFileSync(join(I,id,'program.bin'))),new Uint8Array(readFileSync(join(I,id,'input.bin'))));
 mkdirSync(join(O,id),{recursive:true});
 writeFileSync(join(O,id,'stdout.bin'),r.o);
 writeFileSync(join(O,id,'exit.txt'),r.e+'\n');
}
