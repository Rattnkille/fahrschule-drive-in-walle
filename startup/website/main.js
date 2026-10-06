// Konfiguration: Zieladresse für Formulare.
// Sobald die Projekt-E-Mail existiert, hier eintragen. FormSubmit schickt beim
// ersten Absenden einmalig eine Bestätigungs-Mail an diese Adresse.
const FORM_EMAIL = ""; // z. B. "kontakt@spurlotse.de"

// Rechner
(function () {
  const fl = document.getElementById("r-fl");
  const std = document.getElementById("r-std");
  const preis = document.getElementById("r-preis");
  if (!fl) return;
  const fmt = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
  function update() {
    document.getElementById("o-fl").textContent = fl.value;
    document.getElementById("o-std").textContent = std.value;
    document.getElementById("o-preis").textContent = preis.value;
    const sum = fl.value * std.value * preis.value * 4.33;
    document.getElementById("o-sum").textContent = fmt.format(Math.round(sum / 10) * 10);
  }
  [fl, std, preis].forEach((el) => el.addEventListener("input", update));
  update();
})();

// Formulare
document.querySelectorAll("form[data-form]").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = form.querySelector(".form-msg");
    msg.className = "form-msg";

    if (!form.checkValidity()) {
      msg.textContent = "Bitte fülle alle Pflichtfelder (*) aus.";
      msg.classList.add("err");
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return; // Spam-Schutz

    if (!FORM_EMAIL) {
      // Übergangslösung ohne Formular-Dienst: E-Mail-Programm öffnen.
      const body = Object.entries(data)
        .filter(([k]) => !k.startsWith("_"))
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      window.location.href = `mailto:?subject=${encodeURIComponent(data._subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, _template: "table", _captcha: "false" }),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      msg.textContent = form.dataset.form === "pilot"
        ? "Danke! Wir melden uns innerhalb von 2 Werktagen."
        : "Danke! Du stehst auf der Warteliste.";
      msg.classList.add("ok");
    } catch (err) {
      msg.textContent = "Das hat leider nicht geklappt. Bitte versuche es später noch einmal.";
      msg.classList.add("err");
    } finally {
      btn.disabled = false;
    }
  });
});
