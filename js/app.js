/* ------------------ CONFIG: agrega/edita aquí ------------------ */
const MUNICIPIOS = [
  {
    nombre: "Zona Oeste",
    nota: "Municipios hacia el poniente",
    territorios: [
      { nombre: "Amaxac",       url: "https://www.google.com/maps/d/viewer?mid=1DfpKmaJhRhs37QUWqE-ffjxOY09z4_s" },
      { nombre: "Cuaxomulco",   url: "https://www.google.com/maps/d/viewer?mid=1Oa0EeUnfvm0pnwud0yg1NaxgNjeg4LY" },
      { nombre: "Ixtacuixtla",  url: "https://www.google.com/maps/d/viewer?mid=1Ix7xnnj-0BSQI2yPOoh1FGeBgE4X4gs" },
      { nombre: "Panotla",      url: "https://www.google.com/maps/d/viewer?mid=1w-qFCSlqfJUn8i7pobw_Pw7LaODw6Qc" },
      { nombre: "Texoloc",      url: "https://www.google.com/maps/d/viewer?mid=1k-eoG-_NTszZlbomg6Xw5ctNBIqLGiY" },
      { nombre: "Nopalucan",    url: "https://tuservidor/municipio-oeste/territorio-06" },
      { nombre: "Totolac",      url: "https://tuservidor/municipio-oeste/territorio-07" },
      { nombre: "Yauhquemecan", url: "https://tuservidor/municipio-oeste/territorio-08" }
    ]
  },
  {
    nombre: "Zona Este",
    nota: "Municipios hacia el oriente y centro",
    territorios: [
      { nombre: "Apetatitlán", url: "https://www.google.com/maps/d/viewer?mid=1yR6zYtcgoiDVybnFg1nzdwyIVaHiQ5o" },
      { nombre: "Chiautempan", url: "https://tuservidor/municipio-este/territorio-02" },
      { nombre: "Contla",      url: "https://tuservidor/municipio-este/territorio-03" },
      { nombre: "La Magdalena",url: "https://tuservidor/municipio-este/territorio-04" },
      { nombre: "Santa Cruz",  url: "https://tuservidor/municipio-este/territorio-05" },
      { nombre: "Xiloxoxtla",  url: "https://tuservidor/municipio-este/territorio-06" },
      { nombre: "Tlaxcala",    url: "https://www.google.com/maps/d/viewer?mid=1wNNdFOppuXb9HMxb-qs7knlsQ9WUKT8" }
    ]
  }
];

/* ------------------ LÓGICA DE RENDER ------------------ */
const $list = document.querySelector("#list");
const $search = document.querySelector("#search");
const $clear = document.querySelector("#clearSearch");
const $year = document.querySelector("#year");
$year.textContent = new Date().getFullYear();

function normaliza(t){ return t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(); }

function normalizeMyMaps(url){
  if (!url) return url;
  return url.replace("/d/edit?mid=", "/d/viewer?mid=");
}

// Considera “pendiente” todo lo que apunte a tu servidor de ejemplo o no sea http(s)
function isPlaceholder(url){
  return !url || /tuservidor/i.test(url);
}
function isHttpUrl(url){
  try { const u = new URL(url); return /^https?:$/i.test(u.protocol); }
  catch { return false; }
}

// Si quieres ver los pendientes en la UI, cambia a true
const SHOW_PENDING = true;

function render(items){
  $list.innerHTML = "";
  if(!items.length){
    $list.innerHTML = `<p style="color:#9aa3b2">Sin resultados.</p>`;
    return;
  }
  const frag = document.createDocumentFragment();

  items.forEach(m => {
    // separa válidos y pendientes
    const validos   = (m.territorios||[]).filter(t => !isPlaceholder(t.url) && isHttpUrl(t.url));
    const pendientes = (m.territorios||[]).filter(t => isPlaceholder(t.url) || !isHttpUrl(t.url));

    // si no hay válidos y no quieres ver pendientes, oculta todo el municipio
    if (!validos.length && (!SHOW_PENDING || !pendientes.length)) return;

    const card = document.createElement("article");
    card.className = "card";
    const total = validos.length + (SHOW_PENDING ? pendientes.length : 0);

    card.innerHTML = `
      <header style="display:flex;align-items:center;justify-content:space-between;gap:.5rem">
        <h3>${m.nombre}</h3>
        <span class="badge">${total} link${total===1?"":"s"}</span>
      </header>
      ${m.nota ? `<p>${m.nota}</p>` : ""}
      <div class="links">
        ${ validos.map(t => `
          <a class="link" href="${normalizeMyMaps(t.url)}" target="_blank" rel="noopener">
            <span>${t.nombre}</span>
            <small>abrir ↗</small>
          </a>
        `).join("") }
        ${ SHOW_PENDING ? pendientes.map(t => `
          <span class="link link--disabled" title="Pendiente de URL real">
            <span>${t.nombre}</span>
            <small>pendiente</small>
          </span>
        `).join("") : "" }
      </div>
    `;
    frag.appendChild(card);
  });

  $list.appendChild(frag);

  // Si después de filtrar no quedó nada:
  if(!$list.children.length){
    $list.innerHTML = `<p style="color:#9aa3b2">Sin resultados.</p>`;
  }
}


function filtra(q){
  if(!q) return MUNICIPIOS;
  const n = normaliza(q);
  return MUNICIPIOS.map(m => {
    const coincideM = normaliza(m.nombre).includes(n) || (m.nota && normaliza(m.nota).includes(n));
    const terrs = (m.territorios||[]).filter(t => normaliza(t.nombre).includes(n));
    if(coincideM) return m; // muestra todo el municipio
    if(terrs.length) return {...m, territorios: terrs}; // muestra solo links que coinciden
    return null;
  }).filter(Boolean);
}

/* ------------------ BUSCADOR ------------------ */
$search.addEventListener("input", () => render(filtra($search.value)));
$clear.addEventListener("click", () => { $search.value=""; render(MUNICIPIOS); });

/* ------------------ PWA: instalación ------------------ */
let deferredPrompt;
const installBtn = document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});
installBtn.addEventListener("click", async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});

/* ------------------ SW ------------------ */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      // Cuando se detecte un SW nuevo:
      reg.onupdatefound = () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.onstatechange = () => {
          // Si se instaló y ya había uno controlando, refrescamos a la nueva versión
          if (newSW.state === "installed" && navigator.serviceWorker.controller) {
            // Pedimos al SW que haga skipWaiting y luego recargamos
            reg.waiting?.postMessage({ action: "skipWaiting" });
          }
        };
      };

      // Cuando el controlador cambie (nuevo SW activo), recarga una sola vez
      let hasRefreshed = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hasRefreshed) return;
        hasRefreshed = true;
        window.location.reload();
      });
    }).catch(console.error);
  });
}

/* init */
render(MUNICIPIOS);
