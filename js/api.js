// js/api.js
// Mueve tu variable global aquí
const urlAppScript =
  "https://script.google.com/macros/s/AKfycbyQmHAPQdSnk1CtV-HUPy77ZQnalyya4hi7B7QOPPMR_e-nQTzydDszU0bCyZPOPu-y/exec";

export async function obtenerDatosGoogle(pestana, parametrosExtra = "") {
    try {
        const res = await fetch(`${urlAppScript}?pestana=${pestana}${parametrosExtra}`);
        return await res.json();
    } catch (error) {
        console.error(`Error consultando ${pestana}:`, error);
        return []; // Retorna un array vacío para que la app no explote
    }
}