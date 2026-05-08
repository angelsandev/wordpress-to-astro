// src/lib/wpData.ts

export async function getWordPressContent() {
    const apiUrl = import.meta.env.WP_API_URL;
    const response = await fetch(apiUrl);
    const pageData = await response.json();
    let content = pageData.content.rendered;

    // 1. CONVERTIR TÍTULOS: Buscamos el atributo text=»...» dentro de los headings y lo convertimos a <h2>
    // Esta regex captura el texto dentro de las comillas tipográficas » «
    content = content.replace(/\[vc_custom_heading[^>]*text=»([^»]+)»[^\]]*\]/g, '<h2>$1</h2>');

    // 1. Extraer la imagen del contenido original (antes de limpiar nada)
    const extractImageFromSection = (sectionHtml: string | null) => {
        if (!sectionHtml) return null;
        // Buscamos la primera imagen en el HTML de este bloque específico
        const match = sectionHtml.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
        return match ? match[1] : null;
    };

    //const aboutImg = extractImage(content);
    //console.log("URL de imagen encontrada:", aboutImg);



    // 2. LIMPIEZA GENERAL: Cambiamos el resto de corchetes por espacios o los eliminamos
    // para que no ensucien el texto pero mantengan la estructura
    content = content.replace(/\[\/?[^\]]*\]/g, ' ');

    // 1. Limpiar scripts (adiós error de jQuery)
    content = content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "");

    // 2. Limpiar estilos en línea que a veces mete WP y rompen cosas
    content = content.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");

    // 3. Limpiar etiquetas de iconos vacías que llaman a fuentes externas
    content = content.replace(/<i\b[^>]*><\/i>/gm, "");



    // 3. SEPARACIÓN: Ahora que hemos creado los <h2>, el split funcionará
    const allSections = content.split('<h2>');

    const findSection = (textToFind: string) => {
        const index = allSections.findIndex((s: string) => {
            const firstChars = s.substring(0, 100).toLowerCase(); // Miramos solo el inicio del bloque
            return firstChars.includes(textToFind.toLowerCase());
        });

        if (index === -1) return null;
        let sectionContent = allSections[index].trim();

        // Limpieza de caracteres residuales del split anterior
        if (sectionContent.startsWith('>')) {
            sectionContent = sectionContent.substring(1).trim();
        }

        // Si es el primer bloque de la página (index 0), no lleva H2
        // Si no, le devolvemos el H2 que el split le quitó
        return index === 0 ? sectionContent : '<h2>' + sectionContent;
    };





    // 4. FUNCIÓN ESPECIAL para Misión, Visión y Valores (une los 3 bloques)
    const getMisionesCompletas = () => {
        const m = allSections.find((s: string) => s.includes('Misión'));
        const v = allSections.find((s: string) => s.includes('Visión'));
        const val = allSections.find((s: string) => s.includes('Valores'));

        return `${m ? '<h2>' + m : ''} ${v ? '<h2>' + v : ''} ${val ? '<h2>' + val : ''}`;
    };


    // 1. Primero definimos las secciones de texto
    const aboutSection = findSection('Quiénes somos');
    const about2Section = findSection('especializada en automatización eléctrica');

    // 2. Extraemos la imagen pasándole SOLO el texto de la sección About
    // Así ignoramos los logos que haya al principio de la página
    const aboutImg = extractImageFromSection(aboutSection || '');
    console.log("URL de imagen encontrada:", aboutImg);




    return {

        about: aboutSection,
        about2: about2Section,
        aboutImg: aboutImg,
        misiones: getMisionesCompletas(),
        target: findSection('A quién nos dirigimos'),
        tech: findSection('Asesoramiento técnico'),
        projects: findSection('Déjenos ayudarle a llevar a cabo sus proyectos'),
        training: findSection('Formación'),
        stock: findSection('Stock'),
        postVenta: findSection('Post-venta'),
        marcas: findSection('Nuestras Marcas'),
        catalogo: findSection('Catálogo interactivo'),
        servicios: findSection('Nuestros servicios')

    };
}

