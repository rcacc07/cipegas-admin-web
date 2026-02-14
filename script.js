const urlAppScript =
  "https://script.google.com/macros/s/AKfycbyQmHAPQdSnk1CtV-HUPy77ZQnalyya4hi7B7QOPPMR_e-nQTzydDszU0bCyZPOPu-y/exec";

async function cargarDashboard() {
  // Cargamos ambos al mismo tiempo para que el gerente vea todo junto
  await cargarDatos("Bancos");
  //await cargarDatos("Movimientos");
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
    //document.getElementById("listaMovimientos").innerHTML = "Cargando...";
    cargarDatos("Bancos");
    //cargarDatos("Movimientos");
  } else if (tabNombre === "cobranzas") {
    cargarDatos("Cobranzas");
  } else if (tabNombre === "proveedores") {
    cargarDatos("Proveedores");
  }
}

async function cargarDatos(tipo) {

  const lista = document.getElementById("lista" + tipo);

  if (!lista) return; 

  lista.innerHTML = "Cargando datos...";

  try {
    // Llamamos al Apps Script pasando el nombre de la pestaña (Movimientos, Cuentas o Bancos)
    const respuesta = await fetch(`${urlAppScript}?pestana=${tipo}`);
    //const datos = await respuesta.json();

    // Dentro de cargarDatos(tipo)
    const respuestaJson = await respuesta.json();
    lista.innerHTML = ""; // Limpiamos el mensaje de carga

    // Si es Bancos, los items están en respuestaJson.bancos
    // Si es otro, la respuestaJson es el array directo
    const datos = (tipo === 'Bancos') ? respuestaJson.bancos : respuestaJson;

    if (datos.length === 0) {
      lista.innerHTML = "<li>No hay registros encontrados.</li>";
      return;
    }

    let fechaActual = "";
    let contenedorActual = null;
    let totalSeccion = 0; // Variable para sumar montos
    let totalGeneralBancos = 0;

    // Invertimos para ver lo más reciente arriba
    datos.reverse().forEach((item) => {
        
        const li = (tipo === 'Bancos') ? document.createElement('div') : document.createElement('li');      
        li.className = "nota-card";
        const montoNumerico = Number(item.monto) || 0;
        totalSeccion += montoNumerico; // Sumatoria

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

        totalGeneralBancos += Number(item.saldo) || 0;
        
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
                    S/. ${item.saldo.toLocaleString('es-PE',{minimumFractionDigits:2})}
                </div>`;
        lista.appendChild(div);
      }
    });

    if(tipo==='Bancos'){

      // CREAR LA TARJETA DEL TOTAL (La pondremos arriba de todo)
      const divTotalBancos = document.createElement("div");
      divTotalBancos.className = "card-total-bancos"; // Nueva clase CSS

      divTotalBancos.innerHTML = `
        <div class="resumen-header">
          <span class="emoji-banco">🏦</span>
          <div class="texto-resumen">
            <small>SALDO TOTAL DISPONIBLE</small>
            <h2>S/. ${totalGeneralBancos.toLocaleString('es-PE', {minimumFractionDigits: 2})}</h2>
          </div>
        </div>`;

      // Insertar al principio del contenedor de bancos
      const contenedorBancos = document.getElementById('listaBancos');
      contenedorBancos.prepend(divTotalBancos);


      obtenerListaPrestamosParaBancos();
    }

    // SOLO mostrar el total si es Cobranzas o Proveedores
    if (tipo === 'Cobranzas' || tipo === 'Proveedores') {
    
        const divResumen = document.createElement("div");
        divResumen.className = "card-resumen-total";

        const esCobranza = (tipo === 'Cobranzas');
        const titulo = esCobranza ? "TOTAL POR COBRAR" : "TOTAL POR PAGAR";
        const colorTexto = esCobranza ? "#1a73e8" : "#d9534f";

        divResumen.innerHTML = `
            <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 12px; margin-bottom: 20px; border: 1px solid #eee; border-top: 5px solid ${colorTexto};">
                <small style="color: #5f6368; font-weight: bold; text-transform: uppercase;">${titulo}</small>
                <div style="font-size: 24px; font-weight: 800; color: ${colorTexto};">
                    S/. ${totalSeccion.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
            </div>`;
    
        // Insertar al inicio
        lista.prepend(divResumen);
    }   
  } catch (e) {
    console.error("Error al cargar:", e);
    lista.innerHTML = "Error al conectar con el servidor.";
  }
}

async function obtenerListaPrestamosParaBancos() {

  const contenedorPrestamos = document.getElementById("listaPrestamos");
  if(!contenedorPrestamos) return;

 try {
        const res = await fetch(`${urlAppScript}?pestana=Prestamos`);
        const prestamos = await res.json();

        contenedorPrestamos.innerHTML = "";

        prestamos.forEach(p => {

          // 1. Limpiamos la fecha
        let fechaLimpia = "---";
        if (p.vencimiento || p.fecha) {
          const d = new Date(p.vencimiento || p.fecha);
          // Formato: 11/02/2026 (Día/Mes/Año)
          fechaLimpia = d.toLocaleDateString("es-PE", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
    }
            const divP = document.createElement("div");
            divP.className = "card-cuota-prestamo"; 
            divP.innerHTML = `
                <div class="cuota-header">
                    <span class="banco-tag">${p.banco || p.entidad}</span>
                    <div style="text-align: right;">
                      <small style="color: ${"#1a73e8"}; font-weight: 800; font-size: 9px; text-transform: uppercase;">${p.estado}</small>
                      <span class="monto-cuota">S/. ${Number(p.monto).toLocaleString('es-PE', {minimumFractionDigits:2})}</span>
                    </div>     
                                  
                </div>
                <div class="cuota-body">
                  <div class="info-pago">
                  <b>Vence: <span style="color: ${"#1a73e8"}">${fechaLimpia}</span></b>
                  </div>
                </div>
               
            `;
            contenedorPrestamos.appendChild(divP);
        });
      
    } catch (e) {
        console.error("Error cargando préstamos debajo de bancos:", e);
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

function abrirModalCuentas() {
    document.getElementById("modalCuentas").style.display = "flex";
    cargarCuentasEnModal(); // Llamamos a la función que trae los datos
}

function cerrarModalCuentas() {
    document.getElementById("modalCuentas").style.display = "none";
}

async function cargarCuentasEnModal() {
    const contenedor = document.getElementById("contenedorCuentasModal");
    contenedor.innerHTML = "Cargando agenda...";

    try {
        const res = await fetch(`${urlAppScript}?pestana=AgendaCuentas`);
        const cuentas = await res.json();
        
        contenedor.innerHTML = "";
        cuentas.forEach(c => {

          
    // Validamos que el CCI exista, si no ponemos un guion
    const cciValor = c.cci ? c.cci : "Sin CCI";
    const numeroCuenta = c.numero ? c.numero : "Sin número";
    const div = document.createElement("div");
    div.className = "card-cuenta-slim";
  
    // Color dinámico según el tipo
    const esPropia = (c.tipo && c.tipo.toLowerCase() === "propia");
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
            ${(c.tipo || 'TERCERO').toUpperCase()}
        </span>
        <span style="font-size: 11px; color: #666; display: block; margin-bottom: 5px;">
            ${c.banco} (${c.moneda || 'S/'})
        </span>
        
        <div style="display: flex; flex-direction: column; gap: 3px;">
            <div style="display: flex; align-items: center; gap: 5px;">
                <small style="font-size: 8px; color: #aaa; width: 40px;">NÚMERO:</small>
                <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 11px; flex: 1; white-space: nowrap;">${c.numero}</code>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <small style="font-size: 8px; color: #aaa; width: 40px;">CCI:</small>
                <code style="background: #e8f0fe; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; color: #1a73e8; flex: 1; white-space: nowrap; letter-spacing: -0.2px;">${c.cci || '---'}</code>
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


