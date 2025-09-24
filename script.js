const GITHUB_TOKEN = "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";
const REPO = "Academivpn73/Hiddfiy_app";

// گرفتن نسخه‌ها از گیت‌هاب
async function fetchReleases() {
  const response = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
  return await response.json();
}

// پر کردن منوها
async function populateVersions() {
  const releases = await fetchReleases();
  if (!releases || releases.length === 0) return;

  const latest = releases[0]; // آخرین نسخه

  const androidSelect = document.getElementById("android-versions");
  const windowsSelect = document.getElementById("windows-versions");
  const macSelect = document.getElementById("mac-versions");
  const linuxSelect = document.getElementById("linux-versions");

  releases.forEach(rel => {
    const opt = new Option(rel.tag_name, rel.tag_name);
    androidSelect.add(opt.cloneNode(true));
    windowsSelect.add(opt.cloneNode(true));
    macSelect.add(opt.cloneNode(true));
    linuxSelect.add(opt.cloneNode(true));
  });

  androidSelect.value = latest.tag_name;
  windowsSelect.value = latest.tag_name;
  macSelect.value = latest.tag_name;
  linuxSelect.value = latest.tag_name;
}

// دانلود انتخاب‌شده
function downloadSelected(device) {
  const version = document.getElementById(device + "-versions").value;
  let url = "";

  if (device === "android") {
    const abi = document.getElementById("android-abi").value;
    url = `https://github.com/${REPO}/releases/download/${version}/Hiddify-Android-${abi}.apk`;
  } else if (device === "windows") {
    url = `https://github.com/${REPO}/releases/download/${version}/Hiddify-Windows.exe`;
  } else if (device === "mac") {
    url = `https://github.com/${REPO}/releases/download/${version}/Hiddify-Mac.dmg`;
  } else if (device === "linux") {
    url = `https://github.com/${REPO}/releases/download/${version}/Hiddify-Linux.deb`;
  }

  window.open(url, "_blank");
}

// دانلود خودکار
function autoDownload() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) {
    document.getElementById("android-abi").value = "universal";
    downloadSelected("android");
  } else if (/Windows/i.test(ua)) {
    downloadSelected("windows");
  } else if (/Mac/i.test(ua)) {
    downloadSelected("mac");
  } else if (/Linux/i.test(ua)) {
    downloadSelected("linux");
  } else {
    alert("دستگاه شما پشتیبانی نمی‌شود.");
  }
}

// مدیریت پاپ‌آپ معرفی کانال
document.getElementById("enter-site").addEventListener("click", () => {
  document.getElementById("intro-overlay").style.display = "none";
  document.getElementById("main-content").classList.remove("hidden");
});

populateVersions();
