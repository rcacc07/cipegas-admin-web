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