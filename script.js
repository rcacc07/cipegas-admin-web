const urlAppScript =
  "https://script.google.com/macros/s/AKfycbyQmHAPQdSnk1CtV-HUPy77ZQnalyya4hi7B7QOPPMR_e-nQTzydDszU0bCyZPOPu-y/exec";

async function cargarDashboard() {
  // Cargamos ambos al mismo tiempo para que el gerente vea todo junto
  await cargarDatos("Bancos");
  await cargarDatos("Movimientos");
}

function cambiarTab(tabNombre) {

    // 1. LIMPIAR EL FOCO SELECTOR EN LOS BOTONES
  // Quitamos la clase 'active' de todos los botones para que ninguno brille
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // 2. MOVER EL FOCO AL BOTÓN CLICKEADO
  // Buscamos el botón que ejecutó esta función y le ponemos 'active'
  const botonPresionado = document.querySelector(`button[onclick*="${tabNombre}"]`);
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
    // Es mejor limpiar los contenedores antes de recargar para que el gerente vea el cambio
    document.getElementById("listaBancos").innerHTML = "Cargando...";
    document.getElementById("listaMovimientos").innerHTML = "Cargando...";
    cargarDatos("Bancos");
    cargarDatos("Movimientos");
  } else if (tabNombre === "cobranzas") {
    cargarDatos("Cobranzas");
  } else if (tabNombre === "proveedores") {
    cargarDatos("Proveedores");
  }
    
  
  
}

// Función para GUARDAR datos (Notas o Cuentas)
async function guardar(tipo) {
  let payload = { pestana: tipo };

  if (tipo === "Notas") {
    payload.nota = document.getElementById("notaInput").value;
  } else if (tipo === "Cobranzas") {
    payload.concepto = document.getElementById("cuentaConcepto").value;
    payload.monto = document.getElementById("cuentaMonto").value;
  }

  await fetch(urlAppScript, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload),
  });

  alert(tipo + " guardado con éxito");
  cargarDatos(tipo); // Refresca la lista
}

async function cargarDatos(tipo) {
  const lista = document.getElementById("lista" + tipo);
  if (!lista) return; // Seguridad por si el ID no coincide

  lista.innerHTML = "Cargando datos...";

  try {
    // Llamamos al Apps Script pasando el nombre de la pestaña (Movimientos, Cuentas o Bancos)
    const respuesta = await fetch(`${urlAppScript}?pestana=${tipo}`);
    const datos = await respuesta.json();

    lista.innerHTML = ""; // Limpiamos el mensaje de carga

    if (datos.length === 0) {
      lista.innerHTML = "<li>No hay registros encontrados.</li>";
      return;
    }

    let fechaActual = "";
    let contenedorActual = null;

    // Invertimos para ver lo más reciente arriba
    datos.reverse().forEach((item) => {
        const li = (tipo === 'Bancos') ? document.createElement('div') : document.createElement('li');
        //const li = document.createElement("li");
        li.className = "nota-card";

      if (tipo === "Movimientos") {
        // Lógica de agrupación por fecha y colapso
        const dateObj = new Date(item.fecha);

        // CONFIGURACIÓN DEL FORMATO DE FECHA
        // // Esto mostrará algo como: "lunes, 20 de enero de 2026"
        const opcionesFecha = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        const fechaNota = dateObj.toLocaleDateString("es-ES", opcionesFecha);

        // Formato de hora: "19:30"
        const horaNota = dateObj.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (fechaNota !== fechaActual) {
          fechaActual = fechaNota;
          const detalles = document.createElement("details");
          detalles.className = "grupo-fecha";

          const fechaFormateada =
            fechaNota.charAt(0).toUpperCase() + fechaNota.slice(1);

          const titulo = document.createElement("summary");
          titulo.className = "fecha-separador";
          titulo.innerText = fechaFormateada;

          detalles.appendChild(titulo);
          lista.appendChild(detalles);
          contenedorActual = detalles;
        }

        li.innerHTML = `
                    <span class="nota-hora">${horaNota}</span>
                    <div class="nota-texto">${item.contenido}</div>
                `;
        contenedorActual.appendChild(li);
      } else if (tipo === "Cobranzas") {
        const montoNumerico = Number(item.monto);

        // Niveles de alerta para deudas de clientes
        const esImportante = montoNumerico >= 100000;
        const esCritico = montoNumerico >= 1000000;

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

        li.innerHTML = `
        <div class="nota-texto" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${fondoEspecial}; border: 1px solid ${esImportante ? colorMonto : "#eee"}; border-radius: 8px; margin-bottom: 8px; border-left: 6px solid ${colorMonto};">
            <div>
                <b style="display: block; color: #333;">${item.cliente}</b>
                ${etiqueta}
            </div>
            <span style="color: ${colorMonto}; font-weight: 800; font-size: ${esImportante ? "18px" : "16px"};">
                S/. ${montoNumerico.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
        </div>`;
        lista.appendChild(li);
      } else if (tipo === "Proveedores") {
        const montoNumerico = Number(item.monto);

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

        li.innerHTML = `
        <div class="nota-texto" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${fondoEspecial}; border: 1px solid ${esImportante ? colorMonto : "#eee"}; border-radius: 8px; margin-bottom: 8px; border-left: 6px solid ${colorMonto};">
            <div>
                <b style="display: block; color: #333;">${item.proveedor}</b>
                ${etiqueta}
            </div>
            <span style="color: ${colorMonto}; font-weight: 800; font-size: ${esImportante ? "18px" : "16px"};">
                S/. ${montoNumerico.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
        </div>
    `;
    lista.appendChild(li);
      } else if (tipo === "Bancos") {
        
        const div = document.createElement("div");
        div.className = "card-banco-fila";

        let fechaHoraTxt = "---";

        if (item.fecha) {
          const d = new Date(item.fecha);

          // Formato: "23 ene."
          const fechaSimple = d.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          });

          // Formato: "3:15 PM" (12 horas)
          const horaSimple = d.toLocaleTimeString("es-ES", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          fechaHoraTxt = `${fechaSimple} - ${horaSimple}`;
        }

        div.innerHTML = `
                <div class="info-banco">
                    <b>${item.banco}</b>
                    <small>🕒 Act: ${fechaHoraTxt}</small>
                </div>
                <div class="monto-banco">
                    S/. ${item.saldo}
                </div>`;
        lista.appendChild(div);
      }
    });

    
  } catch (e) {
    console.error("Error al cargar:", e);
    lista.innerHTML = "Error al conectar con el servidor.";
  }
}

function ponerSaludo() {
  const hora = new Date().getHours();
  let mensaje = "";
  if (hora < 12) mensaje = "☀️ ¡Buenos días, Gerente!";
  else if (hora < 18) mensaje = "⛅ ¡Buenas tardes, Gerente!";
  else mensaje = "🌙 ¡Buenas noches, Gerente!";

  document.getElementById("saludo-gerente").innerText = mensaje;
}

// Llama a esta función al cargar la página
window.onload = function () {
  ponerSaludo();
  cargarDashboard();
};
