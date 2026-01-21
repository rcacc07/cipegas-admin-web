const urlAppScript = "https://script.google.com/macros/s/AKfycbyQmHAPQdSnk1CtV-HUPy77ZQnalyya4hi7B7QOPPMR_e-nQTzydDszU0bCyZPOPu-y/exec";

// Función para CAMBIAR de pestaña visualmente
function cambiarTab(tabNombre) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));

    event.currentTarget.classList.add('active');
    document.getElementById('sec-' + tabNombre).classList.add('active');
    
    // Carga los datos de esa pestaña automáticamente

    // Esto es lo que "jala" los datos del Excel al hacer clic
    cargarDatos(tabNombre === 'movimientos' ? 'Movimientos' : tabNombre === 'cobranzas' ? 'Cobranzas' : 'Bancos');
    
}

// Función para GUARDAR datos (Notas o Cuentas)
async function guardar(tipo) {
    let payload = { pestana: tipo };

    if (tipo === 'Notas') {
        payload.nota = document.getElementById('notaInput').value;
    } else if (tipo === 'Cobranzas') {
        payload.concepto = document.getElementById('cuentaConcepto').value;
        payload.monto = document.getElementById('cuentaMonto').value;
    }

    await fetch(urlAppScript, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
    });

    alert(tipo + " guardado con éxito");
    cargarDatos(tipo); // Refresca la lista
}

async function cargarDatos(tipo) {
    const lista = document.getElementById('lista' + tipo);
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
        datos.reverse().forEach(item => {
            const li = document.createElement('li');
            li.className = "nota-card";

            if (tipo === 'Movimientos') {
                // Lógica de agrupación por fecha y colapso
            const dateObj = new Date(item.fecha);

                // CONFIGURACIÓN DEL FORMATO DE FECHA
                // // Esto mostrará algo como: "lunes, 20 de enero de 2026"
            const opcionesFecha = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const fechaNota = dateObj.toLocaleDateString('es-ES', opcionesFecha);
        
            // Formato de hora: "19:30"
            const horaNota = dateObj.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
             minute: '2-digit' });
             

                if (fechaNota !== fechaActual) {
                    fechaActual = fechaNota;
                    const detalles = document.createElement('details');
                    detalles.className = "grupo-fecha";

                    const fechaFormateada = fechaNota.charAt(0).toUpperCase() + fechaNota.slice(1);

                    const titulo = document.createElement('summary');
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

            } else if (tipo === 'Cobranzas') {
                li.innerHTML = `<div class="nota-texto" style="display: flex; justify-content: space-between;">
                <span><b>${item.cliente}</b></span>
                <span style="color: #007bff; font-weight: bold;">S/. ${item.monto}</span></div>`;
                lista.appendChild(li);

            } else if (tipo === 'Bancos') {

            let fechaHoraTxt = "Sin fecha";
    
            if (item.fecha) {
                const d = new Date(item.fecha);
                // Formato: "21 ene. - 10:30"
                const fechaSimple = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                const horaSimple = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                fechaHoraTxt = `${fechaSimple} - ${horaSimple}`;
            }

            li.innerHTML = `
        <div class="nota-card-banco" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 5px 0;">
            <div>
                <b style="font-size: 18px; color: #1c1e21; display: block;">${item.banco}</b>
                <span style="font-size: 15px; color: #8a8d91;">
                    <i class="icono-reloj">🕒</i> Act: ${fechaHoraTxt}
                </span>
            </div>
            <div style="text-align: right;">
                <span style="color: #28a745; font-weight: bold; font-size: 18px; display: block;">
                    S/. ${item.saldo}
                </span>
            </div>
        </div>
    `;

            
            lista.appendChild(li);
               


            }
        });
    } catch (e) {
        console.error("Error al cargar:", e);
        lista.innerHTML = "Error al conectar con el servidor.";
    }
}

// Al abrir la web, carga las notas por defecto
window.onload = () => cargarDatos('Movimientos');