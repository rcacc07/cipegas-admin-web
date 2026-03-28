import { obtenerDatosGoogle } from './api.js';
import { arreglarFechaPeruana, formatoMoneda } from "./utils.js";

export async function cargarBancos() {
    const lista = document.getElementById("listaBancos");
    
    // Si el HTML no tiene el contenedor, nos detenemos para evitar errores
    if (!lista) return;

    // 1. Mostramos el Loader (Efecto de carga)
    lista.innerHTML = `
        <div class="loader-container" style="padding: 20px 0;">
            <div class="circular-loader" style="width: 30px; height: 30px; border-width: 3px;"></div>
            <p class="loader-text" style="font-size: 10px; margin-top: 10px;">CONSULTANDO SALDOS BANCARIOS ...</p>
        </div>
    `;

    try {
        // 2. Pedimos los datos exclusivamente de la pestaña "Bancos"
        const datos = await obtenerDatosGoogle("Bancos"); 
        // Limpiamos el loader
        lista.innerHTML = ""; 
        // Si la hoja está vacía o hubo un error
        if (!datos || datos.length === 0 || datos.error) {
            lista.innerHTML = "<p style='text-align:center; padding:20px; color:#7f8c8d;'>No hay cuentas registradas en Bancos.</p>";
            return;
        }

        let totalGeneralBancos = 0;
        // 3. Dibujamos las tarjetas de cada cuenta bancaria
        datos.forEach((item) => {
            totalGeneralBancos += Number(item.saldo) || 0;

            const div = document.createElement("div");
            div.className = "card-banco-fila";

            // Formateo de fecha de actualización (Si existe)
            let fechaHoraTxt = "---";
            if (item.fecha) {
                const d = new Date(item.fecha);
                const fechaSimple = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
                const horaSimple = d.toLocaleTimeString("es-ES", { hour: "numeric", minute: "2-digit", hour12: true });
                fechaHoraTxt = `${fechaSimple} - ${horaSimple}`;
            }

            div.innerHTML = `
                <div class="info-banco">
                    <b>${item.banco || 'Banco'}</b>
                    <small>🕒 Act: ${fechaHoraTxt}</small>
                </div>
                <div class="monto-banco">
                    S/. ${Number(item.saldo).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </div>`;
            
            lista.appendChild(div);
        });

        // 4. Creamos la tarjeta Negra/Dorada del SALDO TOTAL
        const divTotalBancos = document.createElement("div");
        divTotalBancos.className = "card-total-bancos";
        divTotalBancos.innerHTML = `
            <div class="resumen-header">
                <span class="emoji-banco">🏦</span>
                <div class="texto-resumen">
                    <small>SALDO TOTAL DISPONIBLE</small>
                    <h2>S/. ${totalGeneralBancos.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</h2>
                </div>
            </div>`;
        
        // Lo insertamos al inicio (arriba de la lista)
        lista.prepend(divTotalBancos);
        await cargarPrestamos();

    } catch (e) {
        console.error("Error al cargar bancos:", e);
        lista.innerHTML = "<p style='color:red; text-align:center;'>Error al conectar con el servidor.</p>";
    }
}

// =================================================================
// FUNCIÓN SECUNDARIA: CARGAR PRÉSTAMOS
// =================================================================
async function cargarPrestamos() {
    const contenedorPrestamos = document.getElementById("listaPrestamos");
    if (!contenedorPrestamos) return;

    contenedorPrestamos.innerHTML = `<p style="text-align:center; color:#95a5a6; font-size:12px; padding:10px;">Buscando cuotas de préstamos...</p>`;

    try {
        // Pedimos los datos a la nueva ruta
        const datos = await obtenerDatosGoogle("Prestamos");
        contenedorPrestamos.innerHTML = ""; // Limpiamos el texto de carga
        if (!datos || datos.length === 0 || datos.error) {
            contenedorPrestamos.innerHTML = "<p style='text-align:center; color:#bdc3c7; font-size:13px;'>No hay préstamos por pagar.</p>";
            return;
        }
        // Recorremos los préstamos y aplicamos tu CSS Premium
        datos.forEach(prestamo => {
            const div = document.createElement("div");
            div.className = "card-cuota-prestamo";
            
            // Adaptamos las variables (Asegúrate de que coincidan con las cabeceras de tu Excel)
            const nombreBanco = prestamo.banco || "Banco";
            const montoCuota = Number(prestamo.monto || 0);
            
            const dfechaVence = arreglarFechaPeruana(prestamo.vencimiento);
            const fechaVence = dfechaVence ? dfechaVence.toLocaleDateString("es-PE") : "--/--/----";
            const cuota = prestamo.cuota || "Cuota mensual";

            div.innerHTML = `
                <div class="cuota-header">
                    <span class="banco-tag">${nombreBanco}</span>
                    <span class="monto-cuota">S/. ${montoCuota.toLocaleString("es-PE", {minimumFractionDigits: 2})}</span>
                </div>
                <div class="cuota-body" style="margin-top: 8px;">
                    <div class="info-pago">
                        <b>Vence: ${fechaVence}</b>
                        <small>${cuota}</small>
                    </div>
                </div>
            `;
            
            contenedorPrestamos.appendChild(div);
        });

    } catch (e) {
        console.error("Error cargando préstamos:", e);
        contenedorPrestamos.innerHTML = "<p style='color:red; text-align:center; font-size:12px;'>Error al cargar préstamos.</p>";
    }
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return "Sin fecha";
    
    // Convertimos el texto a un objeto de fecha real
    const fecha = new Date(fechaISO);
    
    // Extraemos día, mes y año
    const dia = String(fecha.getUTCDate()).padStart(2, '0');
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
    const anio = fecha.getUTCFullYear();
    
    return `${dia}/${mes}/${anio}`;
}

