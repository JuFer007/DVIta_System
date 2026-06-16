const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/recursos", express.static(path.join(__dirname, "recursos")));

const TEMPLATES = path.join(__dirname, "templates");

function loadTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), "utf8");
}

async function generatePdf(html, opts = {}) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: "new"
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfOpts = { printBackground: true, ...opts };
  if (!pdfOpts.format && !pdfOpts.width) pdfOpts.format = "A4";
  const pdf = await page.pdf(pdfOpts);
  await browser.close();
  return pdf;
}

function replaceAll(template, map) {
  let result = template;
  for (const [key, value] of Object.entries(map)) {
    result = result.replaceAll(`{{${key}}}`, value ?? "");
  }
  return result;
}

// ─── Existing: Ticket de pago ───────────────────────────────
app.post("/generar-ticket-pago", async (req, res) => {
  try {
    const {
      idPago, idReserva, cliente, dni, fechaPago, metodoPago,
      monto, habitacion, tipoHabitacion, fechaIngreso, fechaSalida,
      noches, subtotal, descuento, servicios
    } = req.body;

    const serviciosHtml = (servicios || []).map(s =>
      `<div class="fila-servicio">
        <div class="col-concepto">${s.concepto}</div>
        <div class="col-monto">S/. ${Number(s.monto).toFixed(2)}</div>
      </div>`
    ).join("");

    let template = loadTemplate("ticket-pago.html");
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

    const browser = await puppeteer.launch({ args: ["--no-sandbox"], headless: "new" });
    const page = await browser.newPage();
    await page.setContent(template, { waitUntil: "networkidle0" });
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const pdf = await page.pdf({
      width: "80mm", height: `${bodyHeight + 8}px`,
      printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    await browser.close();
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Error al generar ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 1. Historial de incidencia ────────────────────────────
app.post("/generar-historial-incidencia", async (req, res) => {
  try {
    const { incidencia, resoluciones, fechaGeneracion } = req.body;
    const resolucionesHtml = (resoluciones || []).map(r => `
      <tr>
        <td class="c">V${r.version}</td>
        <td>${r.fechaResolucion}</td>
        <td>${r.solucion || "—"}</td>
        <td>${r.empleado || "—"}</td>
        <td>${r.notasAuditoria || "—"}</td>
      </tr>`).join("");

    let tpl = loadTemplate("historial-incidencia.html");
    tpl = replaceAll(tpl, {
      id: incidencia.id,
      descripcion: incidencia.descripcion,
      tipo: incidencia.tipo,
      area: incidencia.area,
      prioridad: incidencia.prioridad,
      estado: incidencia.estado,
      cliente: incidencia.cliente || "—",
      habitacion: incidencia.habitacion || "—",
      fecha: incidencia.fecha,
      esRecurrente: incidencia.esRecurrente ? "SÍ" : "NO",
      vecesResuelta: String(incidencia.vecesResuelta || 0),
      fechaGeneracion: fechaGeneracion || "",
      resoluciones: resolucionesHtml,
    });

    const pdf = await generatePdf(tpl);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Error al generar historial:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 2. Reporte general de incidencias ──────────────────────
app.post("/generar-reporte-incidencias", async (req, res) => {
  try {
    const { stats, incidencias, desde, hasta, fechaGeneracion } = req.body;
    const filas = (incidencias || []).map((i, idx) => `
      <tr class="${idx % 2 === 0 ? 'fila-par' : 'fila-impar'}">
        <td class="c">#${i.id}</td>
        <td>${i.descripcion}</td>
        <td>${i.tipo}</td>
        <td>${i.area}</td>
        <td class="c"><span class="pill">${i.prioridad}</span></td>
        <td class="c"><span class="pill">${i.estado}</span></td>
        <td>${i.fecha}</td>
      </tr>`).join("");

    let tpl = loadTemplate("reporte-incidencias.html");
    tpl = replaceAll(tpl, {
      desde: desde || "—",
      hasta: hasta || "—",
      total: String(stats?.total ?? 0),
      abierto: String(stats?.abierto ?? 0),
      enProceso: String(stats?.enProceso ?? 0),
      resuelto: String(stats?.resuelto ?? 0),
      cerrado: String(stats?.cerrado ?? 0),
      urgente: String(stats?.urgente ?? 0),
      alta: String(stats?.alta ?? 0),
      media: String(stats?.media ?? 0),
      baja: String(stats?.baja ?? 0),
      fechaGeneracion: fechaGeneracion || "",
      incidencias: filas,
    });

    const pdf = await generatePdf(tpl);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Error al generar reporte incidencias:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 3. Reporte de habitaciones ────────────────────────────
app.post("/generar-reporte-habitaciones", async (req, res) => {
  try {
    const { stats, habitaciones, fechaGeneracion } = req.body;
    const filas = (habitaciones || []).map((h, idx) => `
      <tr class="${idx % 2 === 0 ? 'fila-par' : 'fila-impar'}">
        <td class="c">${h.numero}</td>
        <td>${h.tipo}</td>
        <td class="c"><span class="pill">${h.estado}</span></td>
        <td class="r">${h.precio}</td>
      </tr>`).join("");

    let tpl = loadTemplate("reporte-habitaciones.html");
    tpl = replaceAll(tpl, {
      total: String(stats?.total ?? 0),
      disponibles: String(stats?.disponibles ?? 0),
      ocupadas: String(stats?.ocupadas ?? 0),
      mantenimiento: String(stats?.mantenimiento ?? 0),
      limpieza: String(stats?.limpieza ?? 0),
      pctOcupacion: String(stats?.pctOcupacion ?? 0),
      fechaGeneracion: fechaGeneracion || "",
      habitaciones: filas,
    });

    const pdf = await generatePdf(tpl);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Error al generar reporte habitaciones:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 4. Reporte financiero ─────────────────────────────────
app.post("/generar-reporte-financiero", async (req, res) => {
  try {
    const { stats, ingresosMensuales, metodosPago, fechaGeneracion } = req.body;
    const filasIngresos = (ingresosMensuales || []).map(m => `
      <tr>
        <td class="c">${m.mes} ${m.anio}</td>
        <td class="r">S/. ${Number(m.total).toFixed(2)}</td>
        <td class="c">${m.pagos}</td>
      </tr>`).join("");
    const filasMetodos = (metodosPago || []).map(m => `
      <tr>
        <td>${m.metodo}</td>
        <td class="r">S/. ${Number(m.total).toFixed(2)}</td>
        <td class="c">${m.cantidad}</td>
      </tr>`).join("");

    let tpl = loadTemplate("reporte-financiero.html");
    tpl = replaceAll(tpl, {
      ingresosMes: "S/. " + Number(stats?.ingresosMes ?? 0).toFixed(2),
      pctCambio: String(stats?.pctCambio ?? 0),
      totalPagos: String(stats?.totalPagos ?? 0),
      ocupacion: String(stats?.ocupacion ?? 0),
      habitacionesTotal: String(stats?.habitacionesTotal ?? 0),
      fechaGeneracion: fechaGeneracion || "",
      ingresosMensuales: filasIngresos,
      metodosPago: filasMetodos,
    });

    const pdf = await generatePdf(tpl);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Error al generar reporte financiero:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 5. Reporte de reservas ────────────────────────────────
app.post("/generar-reporte-reservas", async (req, res) => {
  try {
    const { reservas, stats, desde, hasta, fechaGeneracion } = req.body;
    const filas = (reservas || []).map((r, idx) => {
      const noches = r.noches || "—";
      return `<tr class="${idx % 2 === 0 ? 'fila-par' : 'fila-impar'}">
        <td class="c">#${r.id}</td>
        <td>${r.cliente}</td>
        <td class="c">#${r.habitacion}</td>
        <td>${r.tipoHabitacion}</td>
        <td>${r.fechaIngreso}</td>
        <td>${r.fechaSalida}</td>
        <td class="c">${noches}</td>
        <td class="c"><span class="pill">${r.estado}</span></td>
      </tr>`;
    }).join("");

    let tpl = loadTemplate("reporte-reservas.html");
    tpl = replaceAll(tpl, {
      desde: desde || "—",
      hasta: hasta || "—",
      total: String(stats?.total ?? 0),
      pendiente: String(stats?.pendiente ?? 0),
      confirmada: String(stats?.confirmada ?? 0),
      completada: String(stats?.completada ?? 0),
      cancelada: String(stats?.cancelada ?? 0),
      fechaGeneracion: fechaGeneracion || "",
      reservas: filas,
    });

    const pdf = await generatePdf(tpl);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Error al generar reporte reservas:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 6. Directorio de clientes ─────────────────────────────
app.post("/generar-reporte-clientes", async (req, res) => {
  try {
    const { clientes, total, fechaGeneracion } = req.body;
    const filas = (clientes || []).map((c, idx) => `
      <tr class="${idx % 2 === 0 ? 'fila-par' : 'fila-impar'}">
        <td class="c">${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.dni}</td>
        <td>${c.telefono || "—"}</td>
        <td>${c.email || "—"}</td>
      </tr>`).join("");

    let tpl = loadTemplate("reporte-clientes.html");
    tpl = replaceAll(tpl, {
      total: String(total ?? 0),
      fechaGeneracion: fechaGeneracion || "",
      clientes: filas,
    });

    const pdf = await generatePdf(tpl);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Error al generar reporte clientes:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 8. Reporte de pagos ────────────────────────────────────
app.post("/generar-reporte-pagos", async (req, res) => {
  try {
    const { pagos, total, totalMonto, fechaGeneracion } = req.body;
    const filas = (pagos || []).map((p, idx) => `
      <tr class="${idx % 2 === 0 ? 'fila-par' : 'fila-impar'}">
        <td class="c">#${p.id}</td>
        <td>${p.reserva || "—"}</td>
        <td>${p.cliente || "—"}</td>
        <td class="r">S/. ${Number(p.monto).toFixed(2)}</td>
        <td class="c">${p.fecha}</td>
        <td class="c">${p.metodo}</td>
      </tr>`).join("");

    let tpl = loadTemplate("reporte-pagos.html");
    tpl = replaceAll(tpl, {
      total: String(total ?? 0),
      totalMonto: Number(totalMonto ?? 0).toFixed(2),
      fechaGeneracion: fechaGeneracion || "",
      pagos: filas,
    });

    const pdf = await generatePdf(tpl);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Error al generar reporte pagos:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── 9. Reporte de empleados ───────────────────────────────
app.post("/generar-reporte-empleados", async (req, res) => {
  try {
    const { empleados, stats, fechaGeneracion } = req.body;
    const filas = (empleados || []).map((e, idx) => `
      <tr class="${idx % 2 === 0 ? 'fila-par' : 'fila-impar'}">
        <td class="c">${e.id}</td>
        <td>${e.nombre}</td>
        <td>${e.dni}</td>
        <td>${e.telefono || "—"}</td>
        <td class="c"><span class="status"><span class="status-dot ${e.activo ? 'activo' : 'inactivo'}"></span>${e.activo ? "Activo" : "Inactivo"}</span></td>
      </tr>`).join("");

    let tpl = loadTemplate("reporte-empleados.html");
    tpl = replaceAll(tpl, {
      total: String(stats?.total ?? 0),
      activos: String(stats?.activos ?? 0),
      inactivos: String(stats?.inactivos ?? 0),
      fechaGeneracion: fechaGeneracion || "",
      empleados: filas,
    });

    const pdf = await generatePdf(tpl);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("Error al generar reporte empleados:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3005, () => {
  console.log("D'Vita PDF Service running on port 3005");
});
