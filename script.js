const GITHUB_TOKEN = "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";
const HID_REPO_API = "https://api.github.com/repos/hiddify/hiddify-next/releases";
const LOGO_BASE = "https://raw.githubusercontent.com/Academivpn73/Hiddfiy_app/main/";

let androidFiles=[],windowsFiles=[],macFiles=[],linuxFiles=[],releasesOrder=[];

const isAndroid=n=>n.endsWith('.apk');
const isWindows=n=>n.endsWith('.exe')||n.endsWith('.msi')||n.endsWith('.zip');
const isMac=n=>n.endsWith('.dmg')||n.endsWith('.pkg')||n.endsWith('.zip');
const isLinux=n=>n.endsWith('.appimage')||n.endsWith('.deb')||n.endsWith('.rpm')||n.endsWith('.tar.gz')||n.endsWith('.zip');

function norm(s){return (s||'').toLowerCase();}
function archMatch(arch,name){name=norm(name);if(arch==='v8')return name.includes('arm64')||name.includes('aarch64')||name.includes('v8');if(arch==='v7')return name.includes('armeabi')||name.includes('armv7');if(arch==='universal')return name.includes('universal')||(!name.includes('arm')&&!name.includes('v7')&&!name.includes('v8'));return false;}

function makeCard(key,logo,title){
  const div=document.createElement('div');div.className='card';
  div.innerHTML=`<img src="${logo}" alt="${title}"><h3>${title}</h3><select id="${key}-vers"></select>`;
  if(key==='android')div.innerHTML+=`<select id="android-abi"><option value="universal">Universal</option><option value="v7">V7</option><option value="v8">V8</option></select>`;
  div.innerHTML+=`<button id="${key}-dl">دانلود</button>`;
  return div;
}

function populateVersions(key,arr){
  const sel=document.getElementById(key+'-vers');if(!sel)return;
  sel.innerHTML='';
  const versions=[...new Set(arr.map(x=>x.version))];
  versions.sort((a,b)=>releasesOrder.indexOf(b)-releasesOrder.indexOf(a));
  versions.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;sel.appendChild(o);});
  if(sel.options.length)sel.selectedIndex=0;
}

function findAsset(list,version,exts,arch){
  const candidates=list.filter(x=>x.version===version);if(!candidates.length)return null;
  if(arch){const matched=candidates.filter(c=>archMatch(arch,c.name));if(matched.length){for(const e of exts){const f=matched.find(m=>norm(m.name).endsWith(e));if(f)return f;}return matched[0];}}
  for(const e of exts){const f=candidates.find(c=>norm(c.name).endsWith(e));if(f)return f;}
  return candidates[0];
}

async function loadReleases(){
  try{
    const res=await fetch(HID_REPO_API,{headers:{Authorization:`token ${GITHUB_TOKEN}`}});
    const data=await res.json();
    releasesOrder=data.map(r=>r.tag_name);
    androidFiles=[];windowsFiles=[];macFiles=[];linuxFiles=[];
    data.forEach(rel=>{const v=rel.tag_name;rel.assets.forEach(a=>{const n=a.name||'';const url=a.browser_download_url;const item={version:v,name:n,url:url};const l=n.toLowerCase();if(isAndroid(l))androidFiles.push(item);else if(isWindows(l))windowsFiles.push(item);else if(isMac(l))macFiles.push(item);else if(isLinux(l))linuxFiles.push(item);});});
    document.getElementById('cards').innerHTML='';
    document.getElementById('cards').appendChild(makeCard('android',LOGO_BASE+'android_logo.png','اندروید'));
    document.getElementById('cards').appendChild(makeCard('windows',LOGO_BASE+'windows_logo.png','ویندوز'));
    document.getElementById('cards').appendChild(makeCard('mac',LOGO_BASE+'mac_logo.png','مک'));
    document.getElementById('cards').appendChild(makeCard('linux',LOGO_BASE+'linux_logo.png','لینوکس'));
    populateVersions('android',androidFiles);populateVersions('windows',windowsFiles);populateVersions('mac',macFiles);populateVersions('linux',linuxFiles);
    bindBtns();
  }catch(e){console.error(e);alert('خطا در دریافت نسخه‌ها');}
}

function bindBtns(){
  document.getElementById('android-dl').onclick=()=>{const v=document.getElementById('android-vers').value;const arch=document.getElementById('android-abi').value;const asset=findAsset(androidFiles,v,['.apk'],arch);if(asset)window.open(asset.url);else alert('فایل پیدا نشد');};
  document.getElementById('windows-dl').onclick=()=>{const v=document.getElementById('windows-vers').value;const asset=findAsset(windowsFiles,v,['.exe','.msi','.zip']);if(asset)window.open(asset.url);else alert('فایل پیدا نشد');};
  document.getElementById('mac-dl').onclick=()=>{const v=document.getElementById('mac-vers').value;const asset=findAsset(macFiles,v,['.dmg','.pkg','.zip']);if(asset)window.open(asset.url);else alert('فایل پیدا نشد');};
  document.getElementById('linux-dl').onclick=()=>{const v=document.getElementById('linux-vers').value;const asset=findAsset(linuxFiles,v,['.appimage','.deb','.rpm','.tar.gz','.zip']);if(asset)window.open(asset.url);else alert('فایل پیدا نشد');};
  document.getElementById('autoDownloadBtn').onclick=autoDownload;
}

function autoDownload(){
  const ua=navigator.userAgent.toLowerCase();
  if(ua.includes('android')){const v=document.getElementById('android-vers').value;let arch='universal';if(ua.includes('arm64'))arch='v8';else if(ua.includes('armeabi')||ua.includes('armv7'))arch='v7';const asset=findAsset(androidFiles,v,['.apk'],arch)||findAsset(androidFiles,v,['.apk'],'universal');if(asset)window.open(asset.url);else alert('فایل اندروید پیدا نشد');}
  else if(ua.includes('win')){const v=document.getElementById('windows-vers').value;const asset=findAsset(windowsFiles,v,['.exe','.msi','.zip']);if(asset)window.open(asset.url);else alert('فایل ویندوز پیدا نشد');}
  else if(ua.includes('mac')||ua.includes('iphone')||ua.includes('ipad')){const v=document.getElementById('mac-vers').value;const asset=findAsset(macFiles,v,['.dmg','.pkg','.zip']);if(asset)window.open(asset.url);else alert('فایل مک پیدا نشد');}
  else{const v=document.getElementById('linux-vers').value;const asset=findAsset(linuxFiles,v,['.appimage','.deb','.rpm','.tar.gz','.zip']);if(asset)window.open(asset.url);else alert('فایل لینوکس پیدا نشد');}
}

document.getElementById('modalClose').onclick=()=>{document.getElementById('introModal').style.display='none';document.getElementById('mainContent').classList.remove('hidden');};

window.addEventListener('load',loadReleases);
