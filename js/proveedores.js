import { obtenerDatosGoogle } from "./api.js";
import { arreglarFechaPeruana, formatoMoneda } from "./utils.js";

export async function cargarProveedores() {
  const contenedor = document.getElementById("listaProveedores");

  // Loader personalizado para Clientes
  contenedor.innerHTML = `
        <div class="loader-container">
            <div class="circular-loader"></div>
            <p class="loader-text">DEUDA DE PROVEEDORES ...</p>
        </div>
    `;

  try {
    const datos = await obtenerDatosGoogle("Proveedores");

    contenedor.innerHTML = ""; // Limpiamos el loader

    let totalSeccion = 0;

    // Creamos un fragmento o un contenedor temporal para los items
    const listaItems = document.createElement("div");

    datos.forEach((item) => {
      const montoNumerico = Number(item.monto) || 0;
      totalSeccion += montoNumerico; // Sumatoria

      // Nueva alerta a partir de 100,000 soles
      const esImportante = montoNumerico >= 100000;
      const esCritico = montoNumerico >= 1000000;

      // Definimos los colores según el monto
      let colorMonto = "#1a73e8"; // Azul estándar (identifica que es ingreso)
      let fondoEspecial = "#fff";
      let etiqueta = "";

      if (esCritico) {
        colorMonto = "#b21f2d"; // Rojo oscuro
        fondoEspecial = "#fff5f5";
        etiqueta =
          '<small style="color: #b21f2d; font-weight: bold;">⚠️ PAGO CRÍTICO (>1M)</small>';
      } else if (esImportante) {
        colorMonto = "#f2994a"; // Naranja tipo ámbar
        fondoEspecial = "#fffaf0"; // Fondo crema suave
        etiqueta =
          '<small style="color: #f2994a; font-weight: bold;">🔸 PAGO ELEVADO (>100K)</small>';
      }
      const li = document.createElement("li");
      li.style.listStyle = "none";

      // 2. Configurar la redirección al hacer clic
      li.onclick = () => abrirDetalleProveedor(item.ruc, item.proveedor);
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${fondoEspecial}; border: 1px solid ${esImportante ? colorMonto : "#eee"}; border-radius: 8px; margin-bottom: 8px; border-left: 6px solid ${colorMonto};">
            <div>
                <b style="display: block; color: #333;">${item.proveedor}</b>
                ${etiqueta}
            </div>
            <span style="color: ${colorMonto}; font-weight: 800; font-size: ${esImportante ? "18px" : "16px"};">
                S/. ${montoNumerico.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
        </div>
    `;
      listaItems.appendChild(li);
    });

    const titulo = "TOTAL POR PAGAR";
    const colorTexto = "#d9534f"; // Rojo para alertas/pagos

    contenedor.innerHTML = `
    <div style="text-align: center; padding: 20px; background: #ffffff; border-radius: 15px; margin-bottom: 25px; border: 1px solid #f1f3f4; border-top: 6px solid ${colorTexto}; box-shadow: 0 4px 12px rgba(217, 83, 79, 0.1);">
        
        <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">💸</span>
            <small style="color: #5f6368; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 11px;">
                ${titulo}
            </small>
        </div>

        <div style="font-size: 32px; font-weight: 900; color: ${colorTexto}; letter-spacing: -1px;">
            S/. ${totalSeccion.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </div>

        <div style="margin-top: 10px; font-size: 10px; color: #9aa0a6; font-weight: 600; text-transform: uppercase;">
            Pendiente de salida de caja
        </div>
    </div>`;
    // Insertar al inicio
    contenedor.appendChild(listaItems);
  } catch (error) {
    contenedor.innerHTML = "<p class='error'>Error al cargar cobranzas</p>";
  }
}

export async function abrirDetalleProveedor(rucProveedor, proveedorNombre) {
  console.log(
    "ATENCIÓN: El RUC que recibió el botón es ->",
    `"${rucProveedor}"`,
  );
  const contenedorLista = document.getElementById("listaProveedores");
  const contenedorDetalle = document.getElementById("detalleProveedores");

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
      "ProveeFacts",
      `&rucProveedor=${encodeURIComponent(rucProveedor)}`,
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
                <button onclick="cerrarDetalleProveedor()" style="text-decoration: none; color: #95a5a6; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 15px; border: none; background: none; cursor: pointer;">
                    ← VOLVER A PROVEEDORES
                </button>
                <h1 style="margin: 5px 0; color: #2c3e50; font-size: 24px; font-weight: 800;">${proveedorNombre}</h1>
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
    contenedorDetalle.innerHTML = `<p style="color: red; text-align:center;">Error al cargar. Revisa la consola.</p><button onclick="cerrarDetalleProveedor()">Volver</button>`;
  }
}

// Función súper simple para volver atrás
export function cerrarDetalleProveedor() {
  document.getElementById("detalleProveedores").style.display = "none";
  document.getElementById("listaProveedores").style.display = "block";
}

window.cerrarDetalleProveedor = cerrarDetalleProveedor;
