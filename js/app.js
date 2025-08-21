/* ------------------ CONFIG: agrega/edita aquí ------------------ */
const MUNICIPIOS = [
  {
    nombre: "Zona Oeste",
    nota: "Municipios hacia el poniente",
    territorios: [
      { nombre: "Amaxac", url: "https://www.google.com/maps/d/edit?mid=1DfpKmaJhRhs37QUWqE-ffjxOY09z4_s&usp=sharing" },
      { nombre: "Cuaxomulco", url: "https://tuservidor/municipio-oeste/territorio-02" },
      { nombre: "Ixtacuixtla", url: "https://tuservidor/municipio-oeste/territorio-03" },
      { nombre: "Panotla", url: "https://www.google.com/maps/d/edit?mid=1w-qFCSlqfJUn8i7pobw_Pw7LaODw6Qc&usp=sharing" },
      { nombre: "Texoloc", url: "https://tuservidor/municipio-oeste/territorio-05" },
      { nombre: "Nopalucan", url: "https://tuservidor/municipio-oeste/territorio-06" },
      { nombre: "Totolac", url: "https://tuservidor/municipio-oeste/territorio-07" },
      { nombre: "Yauhquemecan", url: "https://tuservidor/municipio-oeste/territorio-08" }
    ]
  },
  {
    nombre: "Zona Este",
    nota: "Municipios hacia el oriente y centro",
    territorios: [
      { nombre: "Apetatitlán", url: "https://www.google.com/maps/d/edit?mid=1yR6zYtcgoiDVybnFg1nzdwyIVaHiQ5o&usp=sharing" },
      { nombre: "Chiautempan", url: "https://tuservidor/municipio-este/territorio-02" },
      { nombre: "Contla", url: "https://tuservidor/municipio-este/territorio-03" },
      { nombre: "La Magdalena", url: "https://tuservidor/municipio-este/territorio-04" },
      { nombre: "Santa Cruz", url: "https://tuservidor/municipio-este/territorio-05" },
      { nombre: "Xiloxoxtla", url: "https://tuservidor/municipio-este/territorio-06" },
      { nombre: "Tlaxcala", url: "https://www.google.com/maps/d/edit?mid=1wNNdFOppuXb9HMxb-qs7knlsQ9WUKT8&usp=sharing" }
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

function render(items){
  $list.innerHTML = "";
  if(!items.length){
    $list.innerHTML = `<p style="color:#9aa3b2">Sin resultados.</p>`;
    return;
  }
  const frag = document.createDocumentFragment();
  items.forEach(m => {
    const card = document.createElement("article");
    card.className = "card";
    const total = m.territorios?.length ?? 0;

    card.innerHTML = `
      <header style="display:flex;align-items:center;justify-content:space-between;gap:.5rem">
        <h3>${m.nombre}</h3>
        <span class="badge">${total} link${total===1?"":"s"}</span>
      </header>
      ${m.nota ? `<p>${m.nota}</p>` : ""}
      <div class="links">
        ${ (m.territorios||[]).map(t => `
          <a class="link" href="${t.url}" target="_blank" rel="noopener">
            <span>${t.nombre}</span>
            <small>abrir ↗</small>
          </a>
        `).join("") }
      </div>
    `;
    frag.appendChild(card);
  });
  $list.appendChild(frag);
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
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  });
}

/* init */
render(MUNICIPIOS);
