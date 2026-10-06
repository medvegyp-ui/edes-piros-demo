const PRODUCTS = [
  {
    id: "hazi-kremes",
    name: "Házi krémes",
    desc: "Karamellizált vajas lapokon vaníliás főzött krém.",
    img: "images/hazi-kremes.png",
  },
  {
    id: "brownie",
    name: "Csokoládés karamell brownie",
    desc: "A csokoládé és a karamell harmóniája.",
    img: "images/brownie.png",
  },
  {
    id: "tripla-csoki",
    name: "Tripla csokoládé",
    desc: "Csokoládés piskóta alapon fehércsoki mousse, tejcsoki mousse, házi csokival bevonva.",
    img: "images/tripla-csokolade.png",
  },
];
const SIZES = { 12: 5000, 24: 9000 };
const LEAD_DAYS = 3;

const $ = (s, r = document) => r.querySelector(s);
const ft = (n) => n.toLocaleString("hu-HU").replace(/ /g, " ") + " Ft";

let cart = [];
try { cart = JSON.parse(localStorage.getItem("ep-cart")) || []; } catch (e) {}
const save = () => { try { localStorage.setItem("ep-cart", JSON.stringify(cart)); } catch (e) {} };

/* ---------- termékek ---------- */
const grid = $("#products");
grid.innerHTML = PRODUCTS.map((p) => `
  <article class="card" data-id="${p.id}">
    <img src="${p.img}" alt="${p.name}" loading="lazy">
    <div class="card-body">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="sizes">
        ${Object.entries(SIZES).map(([s, price], i) => `
          <label><input type="radio" name="size-${p.id}" value="${s}" ${i === 0 ? "checked" : ""}>
          <span><b>${s} szeletes</b>${ft(price)}</span></label>`).join("")}
      </div>
      <button class="btn full add">Kosárba</button>
    </div>
  </article>`).join("");

grid.addEventListener("click", (e) => {
  if (!e.target.classList.contains("add")) return;
  const card = e.target.closest(".card");
  const size = +card.querySelector("input:checked").value;
  add(card.dataset.id, size);
  openCart();
});

/* ---------- kosár ---------- */
function add(id, size) {
  const it = cart.find((c) => c.id === id && c.size === size);
  it ? it.qty++ : cart.push({ id, size, qty: 1 });
  render();
}
const total = () => cart.reduce((s, c) => s + SIZES[c.size] * c.qty, 0);

function render() {
  save();
  $("#cartCount").textContent = cart.reduce((s, c) => s + c.qty, 0);
  $("#cartTotal").textContent = ft(total());
  $("#checkoutBtn").disabled = !cart.length;
  $("#cartItems").innerHTML = cart.length
    ? cart.map((c, i) => {
        const p = PRODUCTS.find((x) => x.id === c.id);
        return `<div class="item">
          <img src="${p.img}" alt="">
          <div><b>${p.name}</b><small>${c.size} szeletes · ${ft(SIZES[c.size])}</small>
            <div class="qty"><button data-a="dec" data-i="${i}" aria-label="Kevesebb">−</button>${c.qty}<button data-a="inc" data-i="${i}" aria-label="Több">+</button></div></div>
          <div style="text-align:right"><b>${ft(SIZES[c.size] * c.qty)}</b><br><button class="rm" data-a="rm" data-i="${i}">Törlés</button></div>
        </div>`;
      }).join("")
    : '<p class="empty">A kosarad még üres.</p>';
}
$("#cartItems").addEventListener("click", (e) => {
  const a = e.target.dataset.a;
  if (!a) return;
  const i = +e.target.dataset.i;
  if (a === "inc") cart[i].qty++;
  if (a === "dec" && --cart[i].qty <= 0) cart.splice(i, 1);
  if (a === "rm") cart.splice(i, 1);
  render();
});

const drawer = $("#drawer"), overlay = $("#overlay");
function openCart() { drawer.classList.add("on"); overlay.classList.add("on"); drawer.setAttribute("aria-hidden", "false"); }
function closeCart() { drawer.classList.remove("on"); overlay.classList.remove("on"); drawer.setAttribute("aria-hidden", "true"); }
$("#openCart").onclick = openCart;
$("#closeCart").onclick = closeCart;
overlay.onclick = closeCart;

/* ---------- átvételi időpontok ---------- */
const dateInput = $("#pickupDate"), timeSel = $("#pickupTime");
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

function earliest() {
  const d = new Date();
  d.setDate(d.getDate() + LEAD_DAYS);
  if (d.getDay() === 1) d.setDate(d.getDate() + 1); // hétfőn zárva
  return d;
}
function fillTimes() {
  const v = dateInput.value;
  timeSel.innerHTML = "";
  if (!v) return;
  const day = new Date(v + "T12:00").getDay();
  const end = day === 0 ? 18 : 19;
  for (let h = 10; h < end; h++)
    for (const m of ["00", "30"]) timeSel.add(new Option(`${h}:${m}`, `${h}:${m}`));
}
dateInput.min = iso(earliest());
dateInput.addEventListener("change", () => {
  if (new Date(dateInput.value + "T12:00").getDay() === 1) {
    dateInput.value = "";
    $("#dateHint").textContent = "Hétfőn zárva vagyunk – kérjük, válassz másik napot.";
  } else {
    $("#dateHint").textContent = "";
  }
  fillTimes();
});
$("#dateHint").textContent = `Legkorábbi átvétel: ${earliest().toLocaleDateString("hu-HU", { month: "long", day: "numeric", weekday: "long" })} (3 napos elkészítési idő). Hétfőn zárva.`;

/* ---------- megrendelés ---------- */
const checkout = $("#checkout"), form = $("#orderForm");
$("#checkoutBtn").onclick = () => {
  closeCart();
  $("#checkoutTotal").textContent = ft(total());
  $("#checkoutView").hidden = false;
  $("#doneView").hidden = true;
  checkout.classList.add("on");
};
checkout.addEventListener("click", (e) => {
  if (e.target === checkout || e.target.hasAttribute("data-close")) checkout.classList.remove("on");
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { checkout.classList.remove("on"); closeCart(); } });

form.addEventListener("change", () => {
  const card = form.pay.value === "card";
  $("#cardBox").hidden = !card;
  $("#transferBox").hidden = card;
});
form.cardnum.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
});
form.exp.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
  e.target.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  ["name", "phone", "email", "date", "time"].forEach((n) => {
    const el = form[n];
    const bad = !el.value.trim() || (n === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
    el.classList.toggle("bad", bad);
    if (bad) ok = false;
  });
  if (!ok || !cart.length) return;

  const num = "EP-" + Date.now().toString().slice(-6);
  const pay = form.pay.value === "card" ? "Bankkártya (teszt)" : "Előreutalás";
  const when = new Date(form.date.value + "T12:00").toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  const lines = cart.map((c) => {
    const p = PRODUCTS.find((x) => x.id === c.id);
    return `<div class="sum-line"><span>${c.qty} × ${p.name} (${c.size} szeletes)</span><span>${ft(SIZES[c.size] * c.qty)}</span></div>`;
  }).join("");
  $("#doneSummary").innerHTML = `
    <p><b>Rendelésszám:</b> ${num}</p>${lines}
    <div class="sum-line"><b>Összesen</b><b>${ft(total())}</b></div>
    <p style="margin-top:.8rem"><b>Átvétel:</b> ${when}, ${form.time.value}<br>
    <b>Hely:</b> 2314 Halásztelek, Nap utca 10.<br><b>Fizetés:</b> ${pay}</p>
    ${form.pay.value === "transfer" ? `<p class="muted">Közlemény az utaláshoz: ${num}</p>` : ""}`;
  $("#checkoutView").hidden = true;
  $("#doneView").hidden = false;
  cart = [];
  form.reset();
  fillTimes();
  render();
});

$("#year").textContent = new Date().getFullYear();
render();
