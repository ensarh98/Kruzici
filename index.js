let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let trenutniRezultat = document.getElementById("trenutniRezultat");
let rezultatSekcija = document.getElementById("rezultat");
let konacniRezultat = document.getElementById("konacniRezultat");
let pocetnaOkvir = document.getElementById("pocetnaOkvir");
let pobjedaAlert = document.getElementById("pobjeda-alert");
let porazAlert = document.getElementById("poraz-alert");
let pobjedaBodovi = document.getElementById("pobjeda-bodovi");
let porazBodovi = document.getElementById("poraz-bodovi");
let startText = document.getElementById("start-tekst");
let level1 = document.getElementById("level1");
let level2 = document.getElementById("level2");
let level3 = document.getElementById("level3");

let timer;
let brojacProtivnika = 0;
let ubrzajProtivnikVaziDo = undefined;
let faktorBrzineKretanja;
let intervalGenerisanjaProtivnika;
let jeLiPocetakIgre = false;

const BRZINA_LVL_1 = 2;
const BRZINA_LVL_2 = 4;
const BRZINA_LVL_3 = 6;
const INTERVAL_GENERISANJA_LVL_1 = 300;
const INTERVAL_GENERISANJA_LVL_2 = 200;
const INTERVAL_GENERISANJA_LVL_3 = 100;

const FAKOR_UBRZANJA_PROTIVNIKA = 5;
const UBRZANJE_PROTIVNIKA = "UBRZANJE_PROTIVNIKA";
const UVECANJE_GL_KRUGA = "UVECANJE_GL_KRUGA";
const UMANJENJE_GL_KRUGA = "UMANJENJE_GL_KRUGA";
const PROMJENA_SMJERA = "PROMJENA_SMJERA";
const specijalneOpcije = [
  UBRZANJE_PROTIVNIKA,
  UVECANJE_GL_KRUGA,
  UMANJENJE_GL_KRUGA,
  PROMJENA_SMJERA,
];

const x = canvas.width / 2;
const y = canvas.height / 2;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let protivnici = [];
let randomRadius = Math.random() * 20 + 8;
let glavniKrug = { x: x, y: y, radius: randomRadius, boja: "black" };
let rezultat = 0;
let animationId;

function crtajKrug(krug) {
  context.beginPath();
  context.arc(krug.x, krug.y, krug.radius, 0, Math.PI * 2, false);
  context.fillStyle = krug.boja;
  context.fill();
}

function crtajProtivnika(protivnik) {
  context.beginPath();
  context.arc(
    protivnik.x,
    protivnik.y,
    protivnik.radius,
    0,
    Math.PI * 2,
    false
  );
  context.fillStyle = protivnik.boja;
  context.fill();
  if (protivnik.opcija !== undefined) {
    context.strokeStyle = "red";
    context.lineWidth = 5;
    context.stroke();
  }
}

function azurirajProtivnika(protivnik) {
  this.crtajProtivnika(protivnik);
  if (protivnik.promjenaSmjera) {
    protivnik.x = protivnik.x - protivnik.brzina.x;
    protivnik.y = protivnik.y - protivnik.brzina.y;
  } else {
    protivnik.x = protivnik.x + protivnik.brzina.x;
    protivnik.y = protivnik.y + protivnik.brzina.y;
  }
}

function krajIgre() {
  pocetnaOkvir.style.display = "flex";
  konacniRezultat.style.display = "initial";
  rezultatSekcija.style.display = "none";
  canvas.style.display = "none";
  startText.innerHTML = "Igraj ponovo";
}

function novaIgra() {
  canvas.style.display = "initial";
  pocetnaOkvir.style.display = "none";
  pobjedaAlert.style.display = "none";
  porazAlert.style.display = "none";
  randomRadius = Math.random() * 20 + 8;
  glavniKrug = { x: x, y: y, radius: randomRadius, boja: "black" };
  protivnici = [];
  rezultat = 0;
  trenutniRezultat.innerHTML = rezultat;
  clearInterval(timer);
  brojacProtivnika = 0;
  ubrzajProtivnikVaziDo = undefined;
  faktorBrzineKretanja = undefined;
  intervalGenerisanjaProtivnika = undefined;
}

function updateUbrzanjeProtivnika() {
  protivnici.forEach((protivnik) => {
    protivnik.brzina = {
      x: protivnik.brzina.x / FAKOR_UBRZANJA_PROTIVNIKA,
      y: protivnik.brzina.y / FAKOR_UBRZANJA_PROTIVNIKA,
    };
    this.azurirajProtivnika(protivnik);
  });
}

function generisiProtivnike(faktorBrzine, intervalGenerisanja) {
  timer = setInterval(() => {
    brojacProtivnika++;
    const radius = Math.random() * (randomRadius + 2) + randomRadius - 8;
    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    let boja = `hsl(${Math.random() * 360}, 50%, 50%)`;
    let angle = Math.atan2(
      (Math.random() * canvas.height) / 2 - y,
      (Math.random() * canvas.width) / 2 - x
    );

    let brzina = {
      x: Math.cos(angle) * faktorBrzine,
      y: Math.sin(angle) * faktorBrzine,
    };
    if (ubrzajProtivnikVaziDo > new Date()) {
      brzina = {
        x: brzina.x * FAKOR_UBRZANJA_PROTIVNIKA,
        y: brzina.y * FAKOR_UBRZANJA_PROTIVNIKA,
      };
    }
    protivnici.push({
      x: Math.random() < 0.5 ? -x : x,
      y: Math.random() < 0.5 ? -y : y,
      radius: radius,
      boja: boja,
      brzina: brzina,
      opcija:
        brojacProtivnika % 10 == 0
          ? specijalneOpcije[
              Math.floor(Math.random() * specijalneOpcije.length)
            ]
          : undefined,
    });
  }, intervalGenerisanja);
}

function ubrzajProtivnike() {
  protivnici.forEach((protivnik) => {
    protivnik.brzina = {
      x: protivnik.brzina.x * FAKOR_UBRZANJA_PROTIVNIKA,
      y: protivnik.brzina.y * FAKOR_UBRZANJA_PROTIVNIKA,
    };
    this.azurirajProtivnika(protivnik);
  });
  ubrzajProtivnikVaziDo = new Date();
  ubrzajProtivnikVaziDo.setSeconds(
    ubrzajProtivnikVaziDo.getSeconds() + Math.random() * 10 + 1
  );
}

function promjeniSmjerProtivnicima() {
  protivnici.forEach((protivnik) => {
    protivnik.promjenaSmjera = true;
  });
}
let background = new Image(context.width, context.height);
background.src = "background.jpg";
function animate() {
  animationId = requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);
  background.onload = function () {
    context.drawImage(background, 0, 0);
  };
  crtajKrug(glavniKrug);

  protivnici.forEach((protivnik, index) => {
    azurirajProtivnika(protivnik);

    if (protivnik.x - protivnik.radius < 0 || protivnik.y < protivnik.radius) {
      setTimeout(() => {
        protivnici.splice(index, 1);
      }, 0);
    }

    const udaljenost = Math.hypot(
      glavniKrug.x - protivnik.x,
      glavniKrug.y - protivnik.y
    );

    if (Math.round(glavniKrug.radius) >= 100) {
      cancelAnimationFrame(animationId);
      krajIgre();
      pobjedaBodovi.innerHTML = rezultat;
      pobjedaAlert.style.display = "block";
    } else if (udaljenost - protivnik.radius - glavniKrug.radius < 1) {
      if (protivnik.radius > glavniKrug.radius) {
        cancelAnimationFrame(animationId);
        krajIgre();
        porazBodovi.innerHTML = rezultat;
        porazAlert.style.display = "block";
      } else {
        setTimeout(() => {
          if (protivnik.opcija !== undefined) {
            if (UBRZANJE_PROTIVNIKA === protivnik.opcija) {
              ubrzajProtivnike();
            } else if (UVECANJE_GL_KRUGA === protivnik.opcija) {
              glavniKrug.radius = glavniKrug.radius * 2;
            } else if (UMANJENJE_GL_KRUGA === protivnik.opcija) {
              glavniKrug.radius = glavniKrug.radius / 2;
            } else {
              promjeniSmjerProtivnicima();
            }
          }
          glavniKrug.radius = glavniKrug.radius + protivnik.radius / 10;
          randomRadius = glavniKrug.radius;
          rezultat = Math.round(glavniKrug.radius);
          trenutniRezultat.innerHTML = Math.round(glavniKrug.radius);
          protivnici.splice(index, 1);
          crtajKrug(glavniKrug);
        }, 0);
      }
    }
  });
}

function pokreniLevel(faktorBrzine, intervalGenerisanja) {
  pocetnaOkvir.style.display = "none";
  canvas.style.display = "initial";
  rezultatSekcija.style.display = "initial";
  novaIgra();
  animate();
  faktorBrzineKretanja = faktorBrzine;
  intervalGenerisanjaProtivnika = intervalGenerisanja;
  jeLiPocetakIgre = true;
}

canvas.addEventListener("mousemove", (event) => {
  glavniKrug = {
    x: event.clientX,
    y: event.clientY,
    radius: glavniKrug.radius,
    boja: "black",
  };
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  background.onload = function () {
    context.drawImage(background, 0, 0);
  };
  crtajKrug(glavniKrug);

  if (jeLiPocetakIgre) {
    generisiProtivnike(faktorBrzineKretanja, intervalGenerisanjaProtivnika);
    jeLiPocetakIgre = false;
  }
});

crtajKrug(glavniKrug);

level1.addEventListener("click", () => {
  pokreniLevel(BRZINA_LVL_1, INTERVAL_GENERISANJA_LVL_1);
});

level2.addEventListener("click", () => {
  pokreniLevel(BRZINA_LVL_2, INTERVAL_GENERISANJA_LVL_2);
});

level3.addEventListener("click", () => {
  pokreniLevel(BRZINA_LVL_3, INTERVAL_GENERISANJA_LVL_3);
});
