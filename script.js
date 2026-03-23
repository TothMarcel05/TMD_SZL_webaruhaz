let kosar = [];
const { jsPDF } = window.jspdf;

// Termékek betöltése
fetch("api/termekek.php")
    .then(res => res.json())
    .then(adatok => {
        let lista = document.getElementById("termekLista");
        lista.innerHTML = "";
        
        adatok.forEach(termek => {
            let div = document.createElement("div");
            div.className = "termek";
            div.innerHTML = `
                <img src="kepek/${termek.kep}" alt="${termek.termeknev}" onerror="this.src='https://via.placeholder.com/250x200?text=Kép+hiányzik'">
                <h3>${termek.termeknev}</h3>
                <p><strong>Gyártó:</strong> ${termek.gyarto}</p>
                <p class="leiras">${termek.leiras}</p>
                <ul class="tech">
                    <li>${termek.techadat1}</li>
                    <li>${termek.techadat2}</li>
                    <li>${termek.techadat3}</li>
                </ul>
                <p class="ar">${Number(termek.ara).toLocaleString()} Ft</p>
                <button onclick='kosarba(${JSON.stringify(termek)})'>Kosárba</button>
            `;
            lista.appendChild(div);
        });
    });

function kosarba(termek) {
    kosar.push(termek);
    frissitKosar();
}

function frissitKosar() {
    let div = document.getElementById("kosar");
    let osszDiv = document.getElementById("osszesito");
    let gomb = document.getElementById("rendelesGomb");
    
    if (kosar.length === 0) {
        div.innerHTML = "<p>A kosár még üres.</p>";
        osszDiv.innerHTML = "";
        gomb.style.display = "none";
        return;
    }

    div.innerHTML = kosar.map((t, index) => `
        <div class="kosar-elem">
            <span>${t.termeknev}</span>
            <span>${Number(t.ara).toLocaleString()} Ft</span>
            <button onclick="eltavolit(${index})">❌</button>
        </div>
    `).join("");

    let vegosszeg = kosar.reduce((sum, t) => sum + Number(t.ara), 0);
    osszDiv.innerHTML = `<strong>Végösszeg: ${vegosszeg.toLocaleString()} Ft</strong>`;
    gomb.style.display = "block";
}

function eltavolit(index) {
    kosar.splice(index, 1);
    frissitKosar();
}

// Fizetési folyamat
function rendelesInditasa() {
    document.getElementById("paymentModal").style.display = "flex";
}

function modalBezar() {
    document.getElementById("paymentModal").style.display = "none";
}

function fizetesFolyamat() {
    const nev = document.getElementById("vevoNev").value;
    const cim = document.getElementById("vevoCim").value;
    const kartya = document.getElementById("kartyaSzam").value;

    if (!nev || !cim || kartya.length < 12) {
        alert("Kérjük, töltsön ki minden adatot megfelelően!");
        return;
    }

    alert("Fizetés feldolgozása... Sikeres!");
    szamlaGeneralo(nev, cim);
    
    // Reset
    kosar = [];
    frissitKosar();
    modalBezar();
}

function szamlaGeneralo(nev, cim) {
    const doc = new jsPDF();
    let vegosszeg = kosar.reduce((sum, t) => sum + Number(t.ara), 0);

    doc.setFontSize(22);
    doc.text("TECHNŐS WEBÁRUHÁZ - SZÁMLA", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Vevő neve: ${nev}`, 20, 40);
    doc.text(`Cím: ${cim}`, 20, 50);
    doc.text(`Dátum: ${new Date().toLocaleDateString()}`, 20, 60);
    
    doc.line(20, 65, 190, 65);
    doc.text("Termék", 20, 75);
    doc.text("Ár", 150, 75);
    
    let y = 85;
    kosar.forEach(t => {
        doc.text(t.termeknev, 20, y);
        doc.text(`${Number(t.ara).toLocaleString()} Ft`, 150, y);
        y += 10;
    });
    
    doc.line(20, y, 190, y);
    doc.setFontSize(14);
    doc.text(`Összesen fizetve: ${vegosszeg.toLocaleString()} Ft`, 120, y + 10);

    doc.save(`szamla_${nev.replace(' ', '_')}.pdf`);
}