const USER_TOKEN = "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";
const HID_REPO_API = "https://api.github.com/repos/hiddify/hiddify-next/releases";
const LOGO_BASE = "https://raw.githubusercontent.com/Academivpn73/Hiddfiy_app/main/"; // user's repo logos

let androidFiles=[],windowsFiles=[],macFiles=[],linuxFiles=[],releasesOrder=[];

// helpers
const isAndroid=(n)=>n.endsWith('.apk');
const isWindows=(n)=>n.endsWith('.exe')||n.endsWith('.msi')||n.endsWith('.zip');
const isMac=(n)=>n.endsWith('.dmg')||n.endsWith('.pkg');
const isLinux=(n)=>n.endsWith('.appimage')||n.endsWith('.deb')||n.endsWith('.rpm')||n.endsWith('.tar.gz');

function archMatch(arch,name){name=name.toLowerCase(); if(arch==='v8') return name.includes('arm64')||name.includes('aarch64')||name.includes('v8'); if(arch==='v7') return name.includes('armeabi')||name.includes('v7'); if(arch==='universal') return name.includes('universal')||(!name.includes('arm')&&!name.includes('armeabi')&&!name.includes('arm64')); return false;}

function buildCard(key,logo,title){
  const div=document.createElement('div'); div.className='card'; div.id=key+'-card';
  div.innerHTML = `<img src="${logo}" alt="${title}"><h3>${title}</h3><select id="${key}-vers"></select>`;
  if(key==='android') div.innerHTML += `<select id="android-abi"><option value="universal">Universal</option><option value="v7">V7</option><option value="v8">V8</option>`;
  div.innerHTML += `<button id="${key}-dl">دانلود</button>`;
  return div;
}

function populateUI(){
  const cards=document.getElementById('cards');
  cards.innerHTML='';
  cards.appendChild(buildCard('android',LOGO_BASE+'android_logo.png','اندروید'));
  cards.appendChild(buildCard('windows',LOGO_BASE+'windows_logo.png','ویندوز'));
  cards.appendChild(buildCard('mac',LOGO_BASE+'mac_logo.png','مک'));
  cards.appendChild(buildCard('linux',LOGO_BASE+'linux_logo.png','لینوکس'));
  // bind buttons later after fills
}

async function loadReleases(){
  try{
    const res=await fetch(HID_REPO_API, {headers: {Authorization: `token ${USER_TOKEN}`}});
    if(!res.ok) throw new Error('GitHub API '+res.status);
    const data=await res.json();
    releasesOrder = data.map(r=>r.tag_name);
    // reset
    androidFiles=[];windowsFiles=[];macFiles=[];linuxFiles=[];
    data.forEach(rel=>{
      const v = rel.tag_name;
      rel.assets.forEach(a=>{
        const name=a.name || '';
        const url=a.browser_download_url;
        const item={version:v,name:name,url:url};
        const n=name.toLowerCase();
        if(isAndroid(n)) androidFiles.push(item);
        else if(isWindows(n)) windowsFiles.push(item);
        else if(isMac(n)) macFiles.push(item);
        else if(isLinux(n)) linuxFiles.push(item);
      });
    });
    populateVersions('android',androidFiles);
    populateVersions('windows',windowsFiles);
    populateVersions('mac',macFiles);
    populateVersions('linux',linuxFiles);
    bindDownloadButtons();
    document.getElementById('mainContent').classList.remove('hidden');
  }catch(e){console.error(e); alert('خطا در دریافت ریلیزها: '+e.message);}
}

function populateVersions(key,array){
  const sel=document.getElementById(key+'-vers');
  if(!sel) return;
  sel.innerHTML='';
  const versions=[...new Set(array.map(x=>x.version))];
  // sort with releasesOrder (newest first)
  versions.sort((a,b)=> releasesOrder.indexOf(b) - releasesOrder.indexOf(a));
  versions.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o); });
  if(sel.options.length) sel.selectedIndex = 0; // default last (newest)
}

function findAsset(list,version,exts,arch){
  const candidates = list.filter(x=>x.version===version);
  if(!candidates.length) return null;
  if(arch){
    const matched=candidates.filter(c=>archMatch(arch,c.name));
    if(matched.length) return matched.find(m=>exts.some(e=>m.name.toLowerCase().endsWith(e))) || matched[0];
  }
  return candidates.find(c=>exts.some(e=>c.name.toLowerCase().endsWith(e))) || candidates[0];
}

function bindDownloadButtons(){
  document.getElementById('android-dl').addEventListener('click', ()=>{
    const v=document.getElementById('android-vers').value;
    const arch=document.getElementById('android-abi').value;
    const asset=findAsset(androidFiles,v,['.apk'],arch);
    if(asset) window.open(asset.url,'_blank'); else alert('فایلی پیدا نشد');
  });
  document.getElementById('windows-dl').addEventListener('click', ()=>{
    const v=document.getElementById('windows-vers').value;
    const asset=findAsset(windowsFiles,v,['.exe','.msi','.zip'],null);
    if(asset) window.open(asset.url,'_blank'); else alert('فایلی پیدا نشد');
  });
  document.getElementById('mac-dl').addEventListener('click', ()=>{
    const v=document.getElementById('mac-vers').value;
    const asset=findAsset(macFiles,v,['.dmg','.pkg','.zip'],null);
    if(asset) window.open(asset.url,'_blank'); else alert('فایلی پیدا نشد');
  });
  document.getElementById('linux-dl').addEventListener('click', ()=>{
    const v=document.getElementById('linux-vers').value;
    const asset=findAsset(linuxFiles,v,['.appimage','.deb','.rpm','.tar.gz','.zip'],null);
    if(asset) window.open(asset.url,'_blank'); else alert('فایلی پیدا نشد');
  });
  document.getElementById('autoDownloadBtn')?.addEventListener('click', autoDownload);
}

function autoDownload(){
  const ua=navigator.userAgent.toLowerCase();
  if(ua.includes('android')){
    const v=document.getElementById('android-vers').value;
    let arch='universal'; if(ua.includes('arm64')||ua.includes('aarch64')) arch='v8'; else if(ua.includes('armeabi')||ua.includes('armv7')) arch='v7';
    const asset=findAsset(androidFiles,v,['.apk'],arch) || findAsset(androidFiles,v,['.apk'],'universal');
    if(asset) window.open(asset.url,'_blank'); else alert('فایل اندروید پیدا نشد');
  } else if(ua.includes('win')){
    const v=document.getElementById('windows-vers').value;
    const asset=findAsset(windowsFiles,v,['.exe','.msi','.zip'],null);
    if(asset) window.open(asset.url,'_blank'); else alert('فایل ویندوز پیدا نشد');
  } else if(ua.includes('mac')||ua.includes('iphone')||ua.includes('ipad')){
    const v=document.getElementById('mac-vers').value;
    const asset=findAsset(macFiles,v,['.dmg','.pkg','.zip'],null);
    if(asset) window.open(asset.url,'_blank'); else alert('فایل مک پیدا نشد');
  } else {
    const v=document.getElementById('linux-vers').value;
    const asset=findAsset(linuxFiles,v,['.appimage','.deb','.rpm','.tar.gz','.zip'],null);
    if(asset) window.open(asset.url,'_blank'); else alert('فایل لینوکس پیدا نشد');
  }
}

// modal behavior: always show until confirmed each load
document.getElementById('modalClose').addEventListener('click', ()=>{
  document.getElementById('introModal').style.display='none';
});
window.addEventListener('load', ()=>{ populateUI(); loadReleases(); });
