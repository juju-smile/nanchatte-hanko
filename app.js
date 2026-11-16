const $=id=>document.getElementById(id);
const illustrations=[['花','1.png'],['四葉のクローバー','2.png'],['パソコン','パソコン.png'],['はなまる','5.png'],['プレゼント','15.png'],['ペンギン','7.png'],['ハート','9.png'],['鳥','8.png'],['音符','4.png'],['肉球','肉球.png'],['カップ','14.png'],['にこちゃん','10.png'],['クリスマスツリー','クリスマスツリー.png'],['鏡餅（お正月）','鏡餅.png'],['お祝いのケーキ','お祝いのケーキ.png']];
const palette=[['朱色','#cf5145'],['ピンク','#d84b80'],['紺','#294e72'],['緑','#38785b'],['黒','#343332']];
let type='rubber',color=palette[0][1],selected=0,images=[],custom=null,ready=false,finish='roundStamp',background='white',previewSamples=true;
const isIPhone=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let savedFile=null;
if(isIPhone){$('saveLocationHint').textContent='次の画面で「画像を保存」を選んでください。';$('iphoneSaveGuide').hidden=false}
const clearStatus=()=>{$('status').textContent=''};
const font='"Yu Gothic", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif';
const brushFont='"Yu Mincho","Hiragino Mincho ProN",serif';
const backgroundColors={white:'#ffffff',cream:'#fff5df',pink:'#ffe8ef',mint:'#e7f6ed',blue:'#e8f3ff'};
illustrations.forEach(([name,file],i)=>{const src=typeof assetData==='undefined'?`assets/${file}`:assetData[file];const img=new Image();img.src=src;images.push(img);const b=document.createElement('button');b.type='button';b.title=name;b.setAttribute('aria-label',name);b.innerHTML=`<img src="${src}" alt="${name}">`;b.onclick=()=>{selected=i;custom=null;clearStatus();updateGallery();draw()};$('gallery').append(b)});
function updateGallery(){[...$('gallery').children].forEach((b,i)=>b.setAttribute('aria-pressed',!custom&&selected===i?'true':'false'))}updateGallery();
palette.forEach(([name,value])=>{const b=document.createElement('button');b.className='swatch';b.style.background=value;b.title=name;b.setAttribute('aria-label',name);b.onclick=()=>{color=value;clearStatus();updateColors();draw()};$('colors').append(b)});
function updateColors(){[...$('colors').children].forEach((b,i)=>b.setAttribute('aria-pressed',palette[i][1]===color?'true':'false'))}updateColors();
document.querySelectorAll('[data-finish]').forEach(b=>b.onclick=()=>{finish=b.dataset.finish;clearStatus();updateFinish();draw()});
document.querySelectorAll('[data-background]').forEach(b=>b.onclick=()=>{background=b.dataset.background;clearStatus();updateBackground();draw()});
function updateBackground(){document.querySelectorAll('[data-background]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.background===background)))}
function updateFinish(){document.querySelectorAll('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.finish===finish)));const icon=finish==='roundIcon'||finish==='squareIcon';$('backgroundChoices').hidden=!icon;$('frameSizeLabel').hidden=finish==='logo';$('frameSizeTitle').textContent=icon?'背景の大きさ':'枠の大きさ';$('adjustHeading').textContent=finish==='logo'?'イラストの大きさ':icon?'背景とイラストの大きさ':'枠とイラストの大きさ';$('saveHint').textContent=icon?'背景色つきのPNG画像として保存します（1000 × 1000ピクセル）。':'背景が透明なPNG画像として保存します（1000 × 1000ピクセル）。';$('save').textContent='画像を保存する'}
function setType(t){type=t;clearStatus();$('rubberControls').hidden=t!=='rubber';$('pictureControls').hidden=t!=='picture';$('rubberTab').setAttribute('aria-pressed',t==='rubber');$('pictureTab').setAttribute('aria-pressed',t==='picture');$('adjustTitle').lastChild.textContent=t==='picture'?' 好きなハンコに整える（文字・イラストの大きさを調整）':' 好きなハンコに整える';draw()}
function showEditor(t){$('homeScreen').hidden=true;$('editorScreen').hidden=false;document.body.classList.remove('homeView');setType(t);window.scrollTo(0,0)}
function showHome(){$('editorScreen').hidden=true;$('homeScreen').hidden=false;document.body.classList.add('homeView');document.body.classList.remove('keyboardActive');$('keyboardPreview').hidden=true;window.scrollTo(0,0)}
$('startRubber').onclick=()=>showEditor('rubber');$('startPicture').onclick=()=>showEditor('picture');
$('helpButton').onclick=()=>$('helpDialog').showModal();$('closeHelp').onclick=()=>$('helpDialog').close();
$('rubberTab').onclick=()=>setType('rubber');$('pictureTab').onclick=()=>setType('picture');
const settingSections=[...document.querySelectorAll('[data-setting-section]')];
settingSections.forEach(section=>section.addEventListener('toggle',()=>{if(section.open)settingSections.forEach(other=>{if(other!==section)other.open=false})}));
function updateTextModes(){for(const part of ['top','bottom']){const line=$(part+'Mode').value==='line';$(part+'Arc').disabled=line;$(part+'ArcLabel').hidden=line}}
function chars(t){return Array.from(t)}
function rubber(ctx){
 const side=450*+$('rubberFrame').value/100,pad=side*.11,area=side-2*pad;
 ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(300-side/2,300-side/2,side,side,side*.105);ctx.fill();
 ctx.save();ctx.beginPath();ctx.roundRect(300-side/2+pad,300-side/2+pad,area,area,side*.05);ctx.clip();ctx.globalCompositeOperation='destination-out';
 const text=$('stampText').value.trim();
 if(text){
  const vertical=$('direction').value==='vertical',sizeRatio=.38+.62*(+$('rubberSize').value-50)/110,single=chars(text).length===1;
  let lines=text.split('\n');
  if(vertical){
   if(lines.length===1){const a=chars(text),n=Math.ceil(a.length/5);lines=Array.from({length:n},(_,i)=>a.slice(i*Math.ceil(a.length/n),(i+1)*Math.ceil(a.length/n)).join(''))}
   const rows=Math.max(...lines.map(x=>chars(x).length),1);
   const safeSize=Math.min(side*.82,area*.96/Math.max(rows,lines.length));
   const fs=safeSize*sizeRatio;
   const weight=single?900:fs<26?600:fs<60?700:800;
   ctx.font=`${weight} ${fs}px ${brushFont}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=fs*(single?.055:.018);
   lines.forEach((line,col)=>chars(line).forEach((c,row)=>{const x=300+(lines.length-1-2*col)*fs/2,y=300+(2*row-chars(line).length+1)*fs/2;ctx.fillText(c,x,y,fs);ctx.strokeText(c,x,y,fs)}));
  }else{
   if(lines.length===1&&chars(text).length>5){const a=chars(text),n=Math.ceil(a.length/5);lines=Array.from({length:n},(_,i)=>a.slice(i*Math.ceil(a.length/n),(i+1)*Math.ceil(a.length/n)).join(''))}
   let low=1,high=side*.85;
   for(let n=0;n<18;n++){const mid=(low+high)/2;ctx.font=`${single?900:800} ${mid}px ${brushFont}`;const width=Math.max(...lines.map(l=>ctx.measureText(l).width));if(width<=area*.9&&lines.length*mid*1.12<=area*.9)low=mid;else high=mid}
   const fs=low*sizeRatio;
   const weight=single?900:fs<26?600:fs<60?700:800;
   ctx.font=`${weight} ${fs}px ${brushFont}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=fs*(single?.055:.018);
   lines.forEach((l,i)=>{const y=300+(i-(lines.length-1)/2)*fs*1.12;ctx.fillText(l,300,y,area);ctx.strokeText(l,300,y,area)});
  }
 }
 ctx.restore();
// Deterministic transparent flecks preserve the same handmade impression on every export.
let seed=739;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}ctx.save();ctx.beginPath();ctx.roundRect(300-side/2,300-side/2,side,side,side*.105);ctx.clip();ctx.globalCompositeOperation='destination-out';for(let i=0;i<3100;i++){let x=300-side/2+rand()*side,y=300-side/2+rand()*side;ctx.globalAlpha=.35+rand()*.6;ctx.beginPath();ctx.ellipse(x,y,.35+rand()*1.25,.3+rand()*.75,rand()*6.28,0,Math.PI*2);ctx.fill()}ctx.restore()}
function textBand(ctx,which,frameR,imageHalf,displayText){
 const t=displayText.trim(),mode=$(which+'Mode').value,hint=$(which+'ArcHint');hint.textContent='';if(!t)return;
 const bottom=which==='bottom',list=chars(t),weight=700,shift=+$(which+'Y').value;
 let fs=+$(which+'Size').value*1.5;
 ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${weight} ${fs}px ${font}`;
 if(mode==='line'){
  const requested=fs,round=finish==='roundStamp'||finish==='roundIcon';
  const fits=size=>{
   ctx.font=`${weight} ${size}px ${font}`;
   const minDist=imageHalf+size/2+10,maxDist=frameR-size/2-14;
   if(minDist>maxDist)return false;
   const baseDist=minDist+Math.min(18,(maxDist-minDist)/2);
   const dist=Math.max(minDist,Math.min(maxDist,baseDist+(bottom?shift:-shift)));
   const outer=dist+size/2+4;
   const width=round?2*Math.sqrt(Math.max(0,(frameR-12)**2-outer**2))-12:2*(frameR-18);
   return ctx.measureText(t).width<=width;
  };
  if(!fits(fs)){let low=1,high=fs;for(let n=0;n<18;n++){const mid=(low+high)/2;if(fits(mid))low=mid;else high=mid}fs=low;hint.textContent='文字数やイラストの大きさに合わせ、収まる大きさに自動調整しています。'}
  ctx.font=`${weight} ${fs}px ${font}`;
  const minDist=imageHalf+fs/2+10,maxDist=frameR-fs/2-14;
  const baseDist=minDist+Math.min(18,Math.max(0,(maxDist-minDist)/2));
  const dist=Math.max(minDist,Math.min(maxDist,baseDist+(bottom?shift:-shift)));
  ctx.fillText(t,300,300+(bottom?dist:-dist));return;
 }
 const r=Math.max(60,Math.min(frameR-12-fs/2,frameR-45+(bottom?shift:-shift)));
 const requested=+$(which+'Arc').value*Math.PI/180;
 let measured=list.map(c=>ctx.measureText(c).width);
 const maxArc=160*Math.PI/180;
 let needed=measured.reduce((sum,width)=>sum+width,0)*.9/r;
 if(needed>maxArc){fs*=maxArc/needed;ctx.font=`${weight} ${fs}px ${font}`;measured=list.map(c=>ctx.measureText(c).width);needed=measured.reduce((sum,width)=>sum+width,0)*.9/r}
 if(requested<needed-.04)hint.textContent='文字が多いと、重ならないよう円弧の調整範囲が狭くなります。';
 const arc=Math.min(maxArc,Math.max(requested,needed));let positions=[],cursor=-arc/2;
 const total=measured.reduce((a,b)=>a+b,0),available=arc*r,extra=list.length>1?Math.max(0,available-total*.9)/(list.length-1):0;
 list.forEach((c,i)=>{const width=measured[i]*.9;positions.push(cursor+(width/2)/r);cursor+=(width+extra)/r});
 const middle=(positions[0]+positions[positions.length-1])/2;
 list.forEach((c,i)=>{const a=positions[i]-middle;ctx.save();ctx.translate(300+r*Math.sin(a),300+(bottom?1:-1)*r*Math.cos(a));ctx.rotate(bottom?-a:a);ctx.fillText(c,0,0);ctx.restore()})
}
function picture(ctx,showSamples){
 const frameR=258*(finish==='logo'?1:+$('frameSize').value/100);
 const round=finish==='roundStamp'||finish==='roundIcon',square=finish==='squareStamp'||finish==='squareIcon';
 const icon=finish==='roundIcon'||finish==='squareIcon',stamp=finish==='roundStamp'||finish==='squareStamp';
 if(icon){ctx.fillStyle=backgroundColors[background];ctx.beginPath();if(round)ctx.arc(300,300,frameR,0,Math.PI*2);else ctx.roundRect(300-frameR,300-frameR,frameR*2,frameR*2,18);ctx.fill()}
 if(stamp){ctx.strokeStyle=color;ctx.lineWidth=9;ctx.beginPath();if(round)ctx.arc(300,300,frameR,0,Math.PI*2);else ctx.roundRect(300-frameR,300-frameR,frameR*2,frameR*2,18);ctx.stroke()}
 const topText=showSamples?'ありがとう':$('topText').value.trim(),bottomText=showSamples?'ほんのきもち':$('bottomText').value.trim();
 const hasTop=!!topText,hasBottom=!!bottomText;
 const desired=(!hasTop&&!hasBottom?330:245)*+$('imageSize').value/100;
 const longText=chars(topText).length>10||chars(bottomText).length>10;
 const safeR=frameR-(longText?100:hasTop||hasBottom?62:15),box=Math.max(10,Math.min(desired,2*(safeR-8)));
 textBand(ctx,'top',frameR,box/2,topText);textBand(ctx,'bottom',frameR,box/2,bottomText);
 const img=custom||images[selected];if(!img?.complete||!img.naturalWidth)return;
 $('imageSizeHint').textContent=desired>box+1?'枠と文字に収まる大きさまで調整しています。':'';
 const factor=Math.min(box/img.naturalWidth,box/img.naturalHeight),w=img.naturalWidth*factor,h=img.naturalHeight*factor;
 ctx.drawImage(img,300-w/2,300-h/2,w,h)
}
function render(canvas,size,forExport=false){canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d');ctx.scale(size/600,size/600);type==='rubber'?rubber(ctx):picture(ctx,!forExport&&previewSamples)}
function draw(){render($('preview'),600);if(isIPhone&&!$('keyboardPreview').hidden)render($('keyboardPreviewCanvas'),600);$('previewHint').textContent=type==='picture'&&previewSamples?'見本の文字は保存されません。':type==='picture'&&finish==='roundIcon'?'丸い背景の外側は透明です':type==='picture'&&(finish==='squareIcon')?'選んだ背景色で保存されます。':'市松模様の部分は透明です'}
$('previewExpand').onclick=()=>{$('previewZoomImage').src=$('preview').toDataURL('image/png');$('previewZoomDialog').showModal()};
$('closePreviewZoom').onclick=()=>$('previewZoomDialog').close();
$('previewZoomDialog').addEventListener('close',()=>$('previewZoomImage').removeAttribute('src'));
if(isIPhone){
  const isTextEntry=el=>el?.matches?.('textarea,input:not([type]),input[type="text"],input[type="search"],input[type="email"],input[type="number"]');
  const positionKeyboardPreview=()=>{document.body.style.setProperty('--visual-top',Math.max(0,window.visualViewport?.offsetTop||0)+'px')};
  document.addEventListener('focusin',e=>{if(!isTextEntry(e.target))return;document.body.classList.add('keyboardActive');$('keyboardPreview').hidden=false;positionKeyboardPreview();render($('keyboardPreviewCanvas'),600)});
  document.addEventListener('focusout',()=>setTimeout(()=>{if(isTextEntry(document.activeElement))return;document.body.classList.remove('keyboardActive');$('keyboardPreview').hidden=true},80));
  window.visualViewport?.addEventListener('resize',positionKeyboardPreview);
  window.visualViewport?.addEventListener('scroll',positionKeyboardPreview);
}
document.querySelectorAll('input:not([type=file]),select,textarea').forEach(e=>e.addEventListener('input',()=>{if(e.id==='topText'||e.id==='bottomText')previewSamples=false;for(const part of ['top','bottom'])$(part+'SizeValue').textContent=$(part+'Size').value;updateTextModes();for(const id of ['rubberSize','rubberFrame'])$(id+'Value').textContent=$(id).value;draw();$('status').textContent=''}));
$('upload').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){ $('status').textContent='PNG・JPEG・WebP画像を選んでください。';return}if(file.size>20*1024*1024){$('status').textContent='20MB以下の画像を選んでください。';return}let url=URL.createObjectURL(file),img=new Image();try{img.src=url;await img.decode();custom=img;updateGallery();draw();$('status').textContent='イラストを読み込みました。'}catch{$('status').textContent='この画像を読み込めませんでした。別の画像をお試しください。'}finally{URL.revokeObjectURL(url)}};
function makePngFile(png){const encoded=png.slice(png.indexOf(',')+1),binary=atob(encoded),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return new File([bytes],'なんちゃってハンコ.png',{type:'image/png'})}
function openIphoneSaveDialog(png,message){$('iphoneSavedImage').src=png;$('iphoneSaveHelp').textContent=message;$('shareImage').hidden=!savedFile;$('status').textContent='';$('iphoneSaveDialog').showModal()}
$('save').onclick=()=>{const chosen=custom||images[selected];if(type==='picture'&&(!chosen?.complete||!chosen.naturalWidth)){$('status').textContent='イラストを読み込み中です。少し待ってから保存してください。';return}try{const c=document.createElement('canvas');render(c,1000,true);const png=c.toDataURL('image/png');if(isIPhone){previewSamples=false;draw();savedFile=null;const fallback=()=>openIphoneSaveDialog(png,'共有画面を開けませんでした。下の画像を長押しして「写真に保存」または「画像を保存」を選んでください。画像を表示しただけでは保存されません。');try{if(typeof File==='function'&&typeof navigator.share==='function'){const file=makePngFile(png);if(!navigator.canShare||navigator.canShare({files:[file]})){savedFile=file;$('status').textContent='';let sharing;try{sharing=navigator.share({files:[file],title:'なんちゃってハンコ'})}catch(e){console.warn('共有画面を開けませんでした',e);fallback();return}Promise.resolve(sharing).then(()=>$('status').textContent='',e=>{if(e?.name==='AbortError')$('status').textContent='';else{console.warn('共有画面を開けませんでした',e);fallback()}});return}}}catch(e){console.warn('画像共有の準備に失敗しました',e)}fallback();return}const a=document.createElement('a');a.href=png;a.download='なんちゃってハンコ.png';document.body.append(a);a.click();a.remove();previewSamples=false;draw();$('status').textContent='保存を開始しました。ダウンロード一覧をご確認ください。'}catch(e){console.error('PNG保存エラー',e);$('status').textContent='保存できませんでした。別のイラストを選ぶか、ページを開き直してお試しください。'}};
$('shareImage').onclick=async()=>{if(!savedFile||!navigator.share)return;try{await navigator.share({files:[savedFile],title:'なんちゃってハンコ'});$('iphoneSaveHelp').textContent='「画像を保存」を選んだ場合は写真アプリで確認してください。'}catch(e){$('iphoneSaveHelp').textContent=e.name==='AbortError'?'写真アプリで確認し、見当たらなければもう一度お試しください。':'共有画面を開けませんでした。画像を長押しして保存してください。'}};
$('closeIphoneSave').onclick=()=>$('iphoneSaveDialog').close();
$('iphoneSaveDialog').addEventListener('close',()=>{savedFile=null;$('iphoneSavedImage').removeAttribute('src');$('status').textContent=''});
$('reset').onclick=()=>{$('resetDialog').showModal()};$('cancelReset').onclick=()=>$('resetDialog').close();$('confirmReset').onclick=()=>{$('resetDialog').close();$('stampText').value='';$('direction').value='vertical';$('rubberSize').value='100';$('rubberFrame').value='100';$('topText').value='';$('bottomText').value='';previewSamples=true;$('rubberTextSection').open=true;['top','bottom'].forEach(p=>{$(p+'Mode').value='arc';$(p+'Arc').value=p==='top'?'75':'90';$(p+'Size').value='28';$(p+'Y').value='0';$(p+'SizeValue').textContent='28';$(p+'Arc').disabled=false});$('frameSize').value='100';$('imageSize').value='78';$('upload').value='';selected=0;custom=null;color=palette[0][1];updateColors();updateGallery();finish='roundStamp';background='white';updateBackground();updateFinish();updateTextModes();settingSections.forEach(section=>section.open=section.dataset.settingSection==='illustration');setType('rubber');$('rubberSizeValue').textContent='100';$('rubberFrameValue').textContent='100';$('status').textContent='';showHome();$('startRubber').focus()};
Promise.all(images.map(i=>i.decode())).then(()=>{ready=true;draw()}).catch(()=>{$('status').textContent='一部の素材を読み込めません。ページを開き直してください。'});document.fonts.ready.then(draw);draw();
