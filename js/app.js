// 1. IMPORTACIONES (Traemos las funciones de los otros módulos)
import { cargarCobranzas } from './cobranzas.js';
import { cargarBancos } from './bancos.js'; 
import { cargarProveedores } from './proveedores.js';
import { abrirModalCuentas } from './agenda.js';


// ==========================================
// 2. TU FUNCIÓN RESCATADA Y ADAPTADA
// ==========================================
function cambiarTab(tabNombre, idBoton) {
  // 1. LIMPIAR EL FOCO SELECTOR EN LOS BOTONES
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // 2. MOVER EL FOCO AL BOTÓN CLICKEADO (Adaptado para usar el ID del botón)
  const botonPresionado = document.getElementById(idBoton);
  if (botonPresionado) {
    botonPresionado.classList.add("active");
  }

  // 3. Ocultar todas las secciones de contenido
  document.querySelectorAll(".tab-content").forEach((section) => {
    section.classList.remove("active");
  });

  // 4. Mostrar la sección seleccionada
  const seccionActiva = document.getElementById("sec-" + tabNombre);
  if (seccionActiva) {
    seccionActiva.classList.add("active");
  }

  // 5. Cargar los datos correspondientes
  if (tabNombre === "movimientos") {
    cargarBancos(); 
  } else if (tabNombre === "cobranzas") {
    cargarCobranzas();
  } else if (tabNombre === "proveedores") {
    cargarProveedores();
  }
}

// ==========================================
// 3. INICIALIZADOR Y EVENTOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // Escuchamos los clics de cada botón y le pasamos el nombre del tab y su propio ID
    document.getElementById('btn-movimientos').addEventListener('click', () => {
        cambiarTab('movimientos', 'btn-movimientos');
    });

    document.getElementById('btn-cobranzas').addEventListener('click', () => {
        cambiarTab('cobranzas', 'btn-cobranzas');
    });

    document.getElementById('btn-proveedores').addEventListener('click', () => {
        cambiarTab('proveedores', 'btn-proveedores');
    }); 

    // Iniciar la app en una pestaña por defecto al abrir (ej. Bancos/Movimientos)
    cambiarTab('movimientos', 'btn-movimientos');
    ponerSaludo()
});

function ponerSaludo() {
  const hora = new Date().getHours();
  let mensaje = "";
  if (hora < 12) mensaje = "☀️ ¡Buenos días, Gerente!";
  else if (hora < 18) mensaje = "⛅ ¡Buenas tardes, Gerente!";
  else mensaje = "🌙 ¡Buenas noches, Gerente!";

  document.getElementById("saludo-gerente").innerText = mensaje;
}

