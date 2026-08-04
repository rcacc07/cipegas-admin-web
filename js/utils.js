// js/utils.js
export function arreglarFechaPeruana(fecha) {
    // ... tu código antibalas de las fechas ...
    if (!fecha || String(fecha).trim() === "") return null;
    
    // Convertimos a texto por si acaso
    let textoFecha = String(fecha).trim();

    // Si detectamos las barritas clásicas DD/MM/YYYY
    if (textoFecha.includes('/')) {
        let partes = textoFecha.split('/');
        
        if (partes.length === 3) {
            let dia = partes[0];
            let mes = partes[1];
            // Agarramos solo los primeros 4 dígitos del año (por si viene con horas pegadas)
            let anio = partes[2].substring(0, 4); 
            
            // Creamos la fecha exacta: Año, Mes (Ojo: JS cuenta los meses desde 0, por eso -1), Día
            let fechaCorrecta = new Date(anio, mes - 1, dia);
            
            // Comprobamos que no sea un disparate
            if (!isNaN(fechaCorrecta.getTime())) {
                return fechaCorrecta;
            }
        }
    }

    // Si viene en otro formato (ej: desde el servidor directo), intentamos lectura normal
    let fechaNormal = new Date(textoFecha);
    return isNaN(fechaNormal.getTime()) ? null : fechaNormal;
}

export function formatoMoneda(monto) {
    return Number(monto).toLocaleString("es-PE", {minimumFractionDigits: 2});
}

export function formatearFechaElegante(fechaTexto) {
    if (!fechaTexto) return "Sin fecha";

    let dia, mesIndex, anio;

    // 1. Si la fecha viene de Google Sheets con barras (ej: "28/6/2026")
    if (typeof fechaTexto === 'string' && fechaTexto.includes('/')) {
        const partes = fechaTexto.split('/');
        dia = partes[0];
        mesIndex = parseInt(partes[1]) - 1; // Se resta 1 porque el array de meses empieza en 0
        anio = partes[2];
    } 
    // 2. Si viene en formato ISO estándar de programación
    else {
        const fecha = new Date(fechaTexto);
        dia = fecha.getUTCDate();
        mesIndex = fecha.getUTCMonth();
        anio = fecha.getUTCFullYear();
    }

    // Lista de meses
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Armamos el texto final
    return `${dia} de ${meses[mesIndex]} del ${anio}`;
}