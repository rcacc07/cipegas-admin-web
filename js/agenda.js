import { obtenerDatosGoogle } from "./api.js";

export async function cargarCuentasEnModal() {
  const div = document.getElementById("contenedorCuentasModal");
  
  if (!div) return;

    
    div.innerHTML = `
        <div class="loader-container" style="padding: 20px 0;">
            <div class="circular-loader" style="width: 30px; height: 30px; border-width: 3px;"></div>
            <p class="loader-text" style="font-size: 10px; margin-top: 10px;">CARGANDO ...</p>
        </div>
    `;

  try {
    const cuentas = await obtenerDatosGoogle("AgendaCuentas");
    div.innerHTML = "";

    cuentas.forEach((c) => {
      const div = document.createElement("div");
      div.className = "card-cuenta-modern"; // Nueva clase para tu CSS

      // Lógica de colores según tipo
      const esPropia = c.tipo && c.tipo.toLowerCase() === "propia";
      const colorTipo = esPropia ? "#27ae60" : "#1a73e8";
      const badgeColor = esPropia ? "#e8f5e9" : "#e8f0fe";

      div.innerHTML = `
        <div style="display: flex; align-items: center; padding: 15px; background: white; border-radius: 12px; margin-bottom: 12px; border-left: 6px solid ${colorTipo}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            
            <div style="flex: 1; min-width: 0;">
                <span style="background: ${badgeColor}; color: ${colorTipo}; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; display: inline-block; margin-bottom: 6px;">
                    ${c.tipo || "TERCERO"}
                </span>

                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                    <b style="font-size: 14px; color: #333;">${c.banco}</b>
                    <span style="font-size: 12px; color: #777; font-weight: 500;">(${c.moneda || "S/"})</span>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; align-items: center; background: #f8f9fa; padding: 5px 8px; border-radius: 6px; border: 1px solid #eee;">
                        <small style="font-size: 8px; color: #999; width: 45px; font-weight: bold;">CUENTA</small>
                        <code style="font-size: 12px; color: #333; flex: 1; font-family: 'Roboto Mono', monospace; letter-spacing: 0.5px;">${c.numero || "---"}</code>
                    </div>
                    
                    <div style="display: flex; align-items: center; background: #f0f7ff; padding: 5px 8px; border-radius: 6px; border: 1px solid #d0e3ff;">
                        <small style="font-size: 8px; color: #1a73e8; width: 45px; font-weight: bold;">CCI</small>
                        <code style="font-size: 11px; color: #1a73e8; flex: 1; font-family: 'Roboto Mono', monospace; letter-spacing: -0.2px;">${c.cci || "---"}</code>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px; margin-left: 15px;">
                <button onclick="copiarTexto('${c.numero}')" title="Copiar Cuenta" style="border:none; background:#f1f3f4; color:#5f6368; width: 38px; height: 38px; border-radius: 10px; cursor:pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                    <span style="font-size: 16px;">📋</span>
                </button>
                <button onclick="copiarTexto('${c.cci}')" title="Copiar CCI" style="border:none; background:#e8f0fe; color:#1a73e8; width: 38px; height: 38px; border-radius: 10px; cursor:pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                    <span style="font-size: 16px;">🔗</span>
                </button>
            </div>
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
