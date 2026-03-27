import { arreglarFechaPeruana, formatoMoneda } from "./utils.js";
import { obtenerDatosGoogle } from "./api.js";

export async function cargarCobranzas() {
  // ... todo el código gigante de tu lista y el HTML ...
  const contenedor = document.getElementById("listaCobranzas");

  // Loader personalizado para Clientes
  contenedor.innerHTML = `
        <div class="loader-container">
            <div class="circular-loader"></div>
            <p class="loader-text">DEUDA DE CLIENTES ...</p>
        </div>`;

  try {
    const datos = await obtenerDatosGoogle("Cobranzas");
    contenedor.innerHTML = ""; // Limpiamos el loader

    let sumaFacturado = 0;
    let sumaPendiente = 0;

    // Creamos un fragmento o un contenedor temporal para los items
    const listaItems = document.createElement("div");

    datos.reverse().forEach((item) => {
      const montoF = Number(item.monto) || 0;
      const montoP = Number(item.porfacturar) || 0;
      const montoTotal = montoF + montoP;

      sumaFacturado += montoF;
      sumaPendiente += montoP;

      // Niveles de alerta para deudas de clientes
      const esImportante = montoTotal >= 100000;
      const esCritico = montoTotal >= 1000000;

      let colorMonto = "#1a73e8"; // Azul estándar (identifica que es ingreso)
      let fondoEspecial = "#fff";
      let etiqueta = "";

      if (esCritico) {
        colorMonto = "#b21f2d"; // Rojo oscuro
        fondoEspecial = "#fff5f5";
        etiqueta =
          '<small style="color: #b21f2d; font-weight: bold;">💎 DEUDA CRÍTICA (>1M)</small>';
      } else if (esImportante) {
        colorMonto = "#f2994a"; // Naranja tipo ámbar
        fondoEspecial = "#fffaf0"; // Fondo crema suave
        etiqueta =
          '<small style="color: #f2994a; font-weight: bold;">🔹 DEUDA ELEVADA (>100K)</small>';
      }

      const li = document.createElement("div");

      li.onclick = () => abrirDetalleCliente(item.ruc, item.cliente);
      li.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${fondoEspecial}; border: 1px solid ${esImportante ? colorMonto : "#eee"}; border-radius: 10px; margin-bottom: 12px; border-left: 6px solid ${colorMonto}; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        
        <div style="flex: 1; min-width: 0;">
            <div style="margin-bottom: 4px;">
                ${etiqueta}
            </div>
            
            <b style="display: block; color: #333; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">
                ${item.cliente}
            </b>
            
            <div style="font-size: 11px; color: #666;">
                <span style="background: #fff3e0; padding: 2px 6px; border-radius: 4px; border: 1px solid #ffe0b2; display: inline-block;">
                    ⏳ Por Facturar: S/. ${montoP.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </span>
            </div>
        </div>

        <div style="text-align: right; margin-left: 10px;">
            <span style="color: ${colorMonto}; font-weight: 800; font-size: ${esImportante ? "20px" : "17px"}; display: block; line-height: 1;">
                S/. ${montoF.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
            <span style="font-size: 9px; color: #95a5a6; font-weight: bold; text-transform: uppercase; display: block; margin-top: 4px;">
                Saldo Facturado
            </span>
        </div>
        
    </div>
`;
      listaItems.appendChild(li);
    });

    // --- CABECERA DE TOTALES ---
    contenedor.innerHTML = `
    <div style="text-align: center; padding: 25px 20px; background: #2c3e50; color: white; border-radius: 18px; margin-bottom: 25px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); border: 1px solid #34495e;">
        
        <small style="color: #bdc3c7; letter-spacing: 1.5px; font-weight: 700; text-transform: uppercase; font-size: 11px;">
            💰 Potencial Total de Cobro
        </small>
        
        <div style="font-size: 38px; font-weight: 900; color: #f39c12; margin: 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            S/. ${(sumaFacturado + sumaPendiente).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </div>

        <div style="height: 1px; background: linear-gradient(to right, transparent, #5d6d7e, transparent); margin: 15px 0;"></div>

        <div style="display: flex; justify-content: space-around; align-items: center;">
            <div style="flex: 1;">
                <small style="font-size: 10px; color: #2ecc71; display: block; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">
                    Facturado
                </small>
                <b style="font-size: 16px; color: #ffffff;">
                    S/. ${sumaFacturado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </b>
            </div>
            
            <div style="width: 1px; height: 30px; background: #5d6d7e;"></div>

            <div style="flex: 1;">
                <small style="font-size: 10px; color: #e67e22; display: block; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">
                    Pendiente
                </small>
                <b style="font-size: 16px; color: #ffffff;">
                    S/. ${sumaPendiente.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </b>
            </div>
        </div>
    </div>`;

    contenedor.appendChild(listaItems);
  } catch (e) {
    contenedor.innerHTML = "<p class='error'>Error al cargar cobranzas</p>";
  }
}

export async function abrirDetalleCliente(rucCliente, clienteNombre) {
  console.log("ATENCIÓN: El RUC que recibió el botón es ->", `"${rucCliente}"`);
  const contenedorLista = document.getElementById("listaCobranzas");
  const contenedorDetalle = document.getElementById("detalleCobranza");

  // Ocultamos la lista principal y mostramos la pantalla de detalle
  contenedorLista.style.display = "none";
  contenedorDetalle.style.display = "block";

  contenedorDetalle.innerHTML = `
        <div class="loader-container">
            <div class="circular-loader"></div>
            <p>Buscando facturas ...</p>
        </div>`;

  try {
    // EL NUEVO CÓDIGO
    const datos = await obtenerDatosGoogle(
      "ClientesFacts",
      `&rucCliente=${encodeURIComponent(rucCliente)}`,
    );
    console.log("Lo que llegó de Google:", datos);

    // 1. CALCULAMOS EL TOTAL ANTES DE DIBUJAR
    let totalDeudaCliente = 0;
    datos.forEach((doc) => {
      totalDeudaCliente += Number(doc.total) || 0;
    });

    // Armamos la Cabecera con el Botón Volver (Estilo CIPEGAS Premium)
    let html = `
            <header style="background: #ffffff; padding: 25px 20px; border-radius: 0 0 25px 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 30px; text-align: center;">
                <button onclick="cerrarDetalleCliente()" style="text-decoration: none; color: #95a5a6; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 15px; border: none; background: none; cursor: pointer;">
                    ← VOLVER A COBRANZAS
                </button>
                <h1 style="margin: 5px 0; color: #2c3e50; font-size: 24px; font-weight: 800;">${clienteNombre}</h1>
                <div style="color: #e67e22; font-size: 20px; font-weight: 800; margin-top: 8px;">
                    <span style="font-size: 12px; color: #95a5a6; text-transform: uppercase; display: block; font-weight: 600; margin-bottom: -2px;">Deuda Total</span>
                    S/. ${totalDeudaCliente.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </div>
            </header>
            
            <div style="padding: 0 15px;">`;

    // Si el cliente no tiene facturas en esa hoja
    if (datos.length === 0) {
      html += `<div style="text-align: center; color: #7f8c8d; padding: 20px;">No hay documentos registrados para este cliente.</div>`;
    } else {
      datos.forEach((doc) => {
        const montoDoc = Number(doc.total) || 0;

        // 1. Usamos nuestra nueva función antibalas
        const dEmision = arreglarFechaPeruana(doc.emision);
        const dVencimiento = arreglarFechaPeruana(doc.vencimiento);

        // 2. Si hay fecha válida la formateamos, si no, ponemos guiones
        const fEmision = dEmision
          ? dEmision.toLocaleDateString("es-PE")
          : "--/--/----";
        const fVencimiento = dVencimiento
          ? dVencimiento.toLocaleDateString("es-PE")
          : "--/--/----";

        // 3. Verificamos si está vencida (solo si realmente hay fecha de vencimiento)
        const hoy = new Date();
        // Ponemos la hora a cero para que no haya falsos positivos por la hora
        hoy.setHours(0, 0, 0, 0);

        const estaVencida = dVencimiento && dVencimiento < hoy;
        const colorBorde = estaVencida ? "#e74c3c" : "#1a73e8"; // Rojo si venció, azul si no

        // ... Aquí debajo continúa el HTML de tu tarjeta (html += `...`) ...

        html += `
                    <div class="card-factura" style="background: white; border-radius: 12px; padding: 15px; margin-bottom: 12px; border-left: 5px solid ${colorBorde}; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div>
                                <span style="font-size: 10px; font-weight: bold; color: ${colorBorde}; display: block; margin-bottom: 3px;">
                                    ${estaVencida ? "⚠️ FACTURA VENCIDA" : "FACTURA"}
                                </span>
                                <div style="font-weight: 800; color: #2c3e50; font-size: 15px;">
                                    ${doc.numero + "-" + doc.documento || "Sin Nro"}
                                </div>
                            </div>
                            <div style="font-size: 18px; font-weight: 900; color: #2c3e50; text-align: right;">
                                S/. ${montoDoc.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; border-top: 1px solid #f1f2f6; padding-top: 8px; font-size: 11px;">
                            <div style="color: #7f8c8d;">
                                <b>Emisión:</b> ${fEmision}
                            </div>
                            <div style="color: ${estaVencida ? "#e74c3c" : "#7f8c8d"}; font-weight: ${estaVencida ? "bold" : "normal"};">
                                <b>Vencimiento:</b> ${fVencimiento}
                            </div>
                        </div>
                    </div>`;
      });
    }

    html += `</div>`;
    contenedorDetalle.innerHTML = html;
  } catch (e) {
    console.error(e);
    contenedorDetalle.innerHTML = `<p style="color: red; text-align:center;">Error al cargar. Revisa la consola.</p><button onclick="cerrarDetalleCliente()">Volver</button>`;
  }
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "Sin fecha";

  // Convertimos el texto a un objeto de fecha real
  const fecha = new Date(fechaISO);

  // Extraemos día, mes y año
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0"); // +1 porque enero es 0
  const anio = fecha.getUTCFullYear();

  return `${dia}/${mes}/${anio}`;
}

// Función súper simple para volver atrás
export function cerrarDetalleCliente() {
  document.getElementById("detalleCobranza").style.display = "none";
  document.getElementById("listaCobranzas").style.display = "block";
}

window.cerrarDetalleCliente = cerrarDetalleCliente;
