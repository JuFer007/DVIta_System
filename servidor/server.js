const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/recursos", express.static(path.join(__dirname, "recursos")));
app.use("/", express.static(path.join(__dirname, "templates")));

app.post("/generar-ticket-pago", async (req, res) => {
  try {
    const {
      idPago,
      idReserva,
      cliente,
      dni,
      fechaPago,
      metodoPago,
      monto,
      habitacion,
      tipoHabitacion,
      fechaIngreso,
      fechaSalida,
      noches,
      subtotal,
      descuento,
      servicios
    } = req.body;

    const templatePath = path.join(__dirname, "templates", "ticket-pago.html");
    let template = fs.readFileSync(templatePath, "utf8");

    const serviciosHtml = (servicios || []).map(s =>
      `<div class="fila-servicio">
        <div class="col-concepto">${s.concepto}</div>
        <div class="col-monto">S/. ${Number(s.monto).toFixed(2)}</div>
      </div>`
    ).join("");

    template = template
      .replace("{{idPago}}", idPago || "")
      .replace("{{idReserva}}", idReserva || "")
      .replace("{{cliente}}", cliente || "")
      .replace("{{dni}}", dni || "")
      .replace("{{fechaPago}}", fechaPago || "")
      .replace("{{metodoPago}}", metodoPago || "EFECTIVO")
      .replace("{{monto}}", Number(monto || 0).toFixed(2))
      .replace("{{habitacion}}", habitacion || "")
      .replace("{{tipoHabitacion}}", tipoHabitacion || "")
      .replace("{{fechaIngreso}}", fechaIngreso || "")
      .replace("{{fechaSalida}}", fechaSalida || "")
      .replace("{{noches}}", noches || "1")
      .replace("{{subtotal}}", Number(subtotal || monto || 0).toFixed(2))
      .replace("{{descuento}}", Number(descuento || 0).toFixed(2))
      .replace("{{servicios}}", serviciosHtml || `<div class="fila-servicio"><div class="col-concepto">Hospedaje - ${tipoHabitacion || ''}</div><div class="col-monto">S/. ${Number(monto || 0).toFixed(2)}</div></div>`);

    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: "new"
    });

    const page = await browser.newPage();
    await page.setContent(template, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);

  } catch (err) {
    console.error("Error al generar ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3005, () => {
  console.log("D'Vita PDF Service running on port 3005");
});
