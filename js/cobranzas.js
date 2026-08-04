import { arreglarFechaPeruana, formatoMoneda } from "./utils.js";
import { obtenerDatosGoogle } from "./api.js";

export async function cargarCobranzas() {
  const contenedor = document.getElementById("listaCobranzas");

  // Loader personalizado para Clientes
  contenedor.innerHTML = `
        <div class="loader-container">
            <div class="circular-loader"></div>
            <p class="loader-text">DEUDA DE CLIENTES ...</p>
        </div>`;

  try {
    const datos = await obtenerDatosGoogle("Cobranzas");
    
    // 1. FILTRADO DE DATOS
    const clientesActivos = datos.filter((item) => {
      const estado = String(item.activo || "").trim().toUpperCase();
      return estado === "1" || estado === "ACTIVO" || estado === "TRUE";
    });

    const clientesInactivos = datos.filter((item) => {
      const estado = String(item.activo || "").trim().toUpperCase();
      return (estado === "0" || estado === "INACTIVO" || estado === "FALSE" || estado === "");
    });

    // Limpiamos el contenedor principal para empezar a construir
    contenedor.innerHTML = ""; 

    // ==========================================
    // SECCIÓN 1: CLIENTES ACTIVOS
    // ==========================================
    if (clientesActivos.length > 0) {
      let sumaFacturadoA = 0;
      let sumaPendienteA = 0;

      const listaItemsActivos = document.createElement("div");
      
      clientesActivos.reverse().forEach((item) => {
        const montoF = Number(item.monto) || 0;
        const montoP = Number(item.porfacturar) || 0;
        const montoTotal = montoF + montoP;

        sumaFacturadoA += montoF;
        sumaPendienteA += montoP;

        const esImportante = montoTotal >= 100000;
        const esCritico = montoTotal >= 1000000;

        let colorMonto = "#1a73e8"; 
        let fondoEspecial = "#fff";
        let etiqueta = "";

        if (esCritico) {
          colorMonto = "#b21f2d"; fondoEspecial = "#fff5f5";
          etiqueta = '<small style="color: #b21f2d; font-weight: bold;">💎 DEUDA CRÍTICA (>1M)</small>';
        } else if (esImportante) {
          colorMonto = "#f2994a"; fondoEspecial = "#fffaf0";
          etiqueta = '<small style="color: #f2994a; font-weight: bold;">🔹 DEUDA ELEVADA (>100K)</small>';
        }

        const li = document.createElement("div");
        li.onclick = () => abrirDetalleCliente(item.ruc, item.cliente);
        li.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${fondoEspecial}; border: 1px solid ${esImportante ? colorMonto : "#eee"}; border-radius: 10px; margin-bottom: 12px; border-left: 6px solid ${colorMonto}; box-shadow: 0 2px 5px rgba(0,0,0,0.05); cursor: pointer;">
              <div style="flex: 1; min-width: 0;">
                  <div style="margin-bottom: 4px;">${etiqueta}</div>
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
          </div>`;
        listaItemsActivos.appendChild(li);
      });

      // Renderizamos el Resumen de Activos
      const seccionActivos = document.createElement("div");
      seccionActivos.innerHTML = `
        <h3 style="font-size: 14px; color: #2ecc71; margin-bottom: 10px; margin-top: 10px;">🟢 CARTERA ACTIVA</h3>
        <div style="background: #2c3e50; color: white; border-radius: 18px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 6px solid #2ecc71;">
            <small style="color: #bdc3c7; letter-spacing: 1px; font-weight: bold; font-size: 10px; text-transform: uppercase;">
                💰 TOTAL POR COBRAR (ACTIVOS - ${clientesActivos.length})
            </small>
            <div style="font-size: 32px; font-weight: 900; color: #ffffff; margin: 5px 0;">
                S/. ${(sumaFacturadoA + sumaPendienteA).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </div>
            <div style="display: flex; gap: 15px; margin-top: 10px; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                <span>Facturado: <b>S/. ${sumaFacturadoA.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</b></span>
                <span style="color: #f39c12;">Pendiente: <b>S/. ${sumaPendienteA.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</b></span>
            </div>
        </div>
      `;
      contenedor.appendChild(seccionActivos);
      contenedor.appendChild(listaItemsActivos);
    }

    // ==========================================
    // SECCIÓN 2: CLIENTES INACTIVOS
    // ==========================================
    if (clientesInactivos.length > 0) {
      let sumaFacturadoI = 0;
      let sumaPendienteI = 0;

      const listaItemsInactivos = document.createElement("div");
      
      clientesInactivos.reverse().forEach((item) => {
        const montoF = Number(item.monto) || 0;
        const montoP = Number(item.porfacturar) || 0;

        sumaFacturadoI += montoF;
        sumaPendienteI += montoP;

        const colorMonto = "#000000"; 
        const fondoEspecial = "#fafafa";

        const li = document.createElement("div");
        li.onclick = () => abrirDetalleCliente(item.ruc, item.cliente);
        li.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${fondoEspecial}; border: 1px solid #e0e0e0; border-radius: 10px; margin-bottom: 12px; border-left: 6px solid ${colorMonto}; opacity: 0.8; cursor: pointer;">
              <div style="flex: 1; min-width: 0;">
                  <b style="display: block; color: #000000; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">
                      ${item.cliente}
                  </b>
                  <div style="font-size: 11px; color: #010101;">
                      <span style="background: #f1f2f6; padding: 2px 6px; border-radius: 4px; border: 1px solid #dfe4ea; display: inline-block;">
                          ⏳ Por Facturar: S/. ${montoP.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </span>
                  </div>
              </div>
              <div style="text-align: right; margin-left: 10px;">
                  <span style="color: ${colorMonto}; font-weight: 800; font-size: 17px; display: block; line-height: 1;">
                      S/. ${montoF.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </span>
                  <span style="font-size: 9px; color: #95a5a6; font-weight: bold; text-transform: uppercase; display: block; margin-top: 4px;">
                      Saldo Histórico
                  </span>
              </div>
          </div>`;
        listaItemsInactivos.appendChild(li);
      });

      // Renderizamos el Resumen de Inactivos
      const seccionInactivos = document.createElement("div");
      seccionInactivos.innerHTML = `
        <h3 style="font-size: 14px; color: #d03328; margin-bottom: 10px; margin-top: 30px; border-top: 1px solid #cf4343; padding-top: 20px;"> CARTERA INACTIVA (Historial)</h3>
        <div style="background: #34495e; color: #bdc3c7; border-radius: 18px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-left: 6px solid #95a5a6; opacity: 0.9;">
            <small style="color: #fcffff; letter-spacing: 1px; font-weight: bold; font-size: 10px; text-transform: uppercase;">
                ⚪ TOTAL HISTÓRICO (INACTIVOS - ${clientesInactivos.length})
            </small>
            <div style="font-size: 32px; font-weight: 900; color: #f5f8fa; margin: 5px 0;">
                S/. ${(sumaFacturadoI + sumaPendienteI).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </div>
            <div style="display: flex; gap: 15px; margin-top: 10px; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
                <span>Facturado: <b>S/. ${sumaFacturadoI.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</b></span>
                <span>Pendiente: <b>S/. ${sumaPendienteI.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</b></span>
            </div>
        </div>
      `;
      contenedor.appendChild(seccionInactivos);
      contenedor.appendChild(listaItemsInactivos);
    }

  } catch (e) {
    console.error(e);
    contenedor.innerHTML = "<p style='color:red; text-align:center;'>Error al cargar cobranzas</p>";
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
