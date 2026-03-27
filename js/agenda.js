import { obtenerDatosGoogle } from './api.js';

export async function cargarCuentasEnModal() {
  const contenedor = document.getElementById("contenedorCuentasModal");
  contenedor.innerHTML = "Cargando agenda...";

  try {
    const cuentas = await obtenerDatosGoogle("AgendaCuentas"); 

    contenedor.innerHTML = "";
    cuentas.forEach((c) => {
      // Validamos que el CCI exista, si no ponemos un guion
      const cciValor = c.cci ? c.cci : "Sin CCI";
      const numeroCuenta = c.numero ? c.numero : "Sin número";
      const div = document.createElement("div");
      div.className = "card-cuenta-slim";

      // Color dinámico según el tipo
      const esPropia = c.tipo && c.tipo.toLowerCase() === "propia";
      const colorTipo = esPropia ? "#27ae60" : "#2980b9";
      const textoTipo = esPropia ? "CUENTA PROPIA" : "CUENTA TERCERO";

      div.style.borderLeft = `5px solid ${colorTipo}`;
      div.style.borderLeft = `5px solid ${colorTipo}`;
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.padding = "10px";

      div.innerHTML = `
    <div style="flex: 1; min-width: 0;">
        <span style="color: ${colorTipo}; font-size: 9px; font-weight: 900; display: block; margin-bottom: 2px;">
            ${(c.tipo || "TERCERO").toUpperCase()}
        </span>
        <span style="font-size: 11px; color: #666; display: block; margin-bottom: 5px;">
            ${c.banco} (${c.moneda || "S/"})
        </span>
        
        <div style="display: flex; flex-direction: column; gap: 3px;">
            <div style="display: flex; align-items: center; gap: 5px;">
                <small style="font-size: 8px; color: #aaa; width: 40px;">NÚMERO:</small>
                <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 11px; flex: 1; white-space: nowrap;">${c.numero}</code>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <small style="font-size: 8px; color: #aaa; width: 40px;">CCI:</small>
                <code style="background: #e8f0fe; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; color: #1a73e8; flex: 1; white-space: nowrap; letter-spacing: -0.2px;">${c.cci || "---"}</code>
            </div>
        </div>
    </div>
    
    <div style="display: flex; flex-direction: column; gap: 5px; margin-left: 10px;">
        <button onclick="copiarTexto('${c.numero}')" style="border:none; background:#f1f3f4; padding: 8px; border-radius: 8px; cursor:pointer;">📋</button>
        <button onclick="copiarTexto('${c.cci}')" style="border:none; background:#e8f0fe; padding: 8px; border-radius: 8px; cursor:pointer;">🔗</button>
    </div>
`;

      contenedor.appendChild(div);
    });
  } catch (e) {
    contenedor.innerHTML = "Error al cargar la agenda.";
  }
}

export function abrirModalCuentas() {
  document.getElementById("modalCuentas").style.display = "flex";
  cargarCuentasEnModal(); // Llamamos a la función que trae los datos
}

export function cerrarModalCuentas() {
  document.getElementById("modalCuentas").style.display = "none";
}

// Función extra muy útil para el gerente
function copiarTexto(texto) {
  navigator.clipboard.writeText(texto);
  alert("Número copiado: " + texto);
}

function cerrarSiClickFuera(event) {
  if (event.target.id === "modalCuentas") {
    cerrarModalCuentas();
  }
}

// 🌟 ESTA LÍNEA ES VITAL:
window.abrirModalCuentas = abrirModalCuentas;
window.cerrarModalCuentas = cerrarModalCuentas;