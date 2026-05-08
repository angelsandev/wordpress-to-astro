// src/lib/wpData.ts

// src/lib/wpData.ts

export async function getWordPressContent() {
    const apiUrl = import.meta.env.WP_API_URL;
    const response = await fetch(apiUrl);
    const pageData = await response.json();
    const rawContent = pageData.content.rendered;

    // 1. LIMPIEZA DE TÍTULOS (Igual que antes)
    let cleanContent = rawContent.replace(/\[vc_custom_heading[^>]*text=»([^»]+)»[^\]]*\]/g, '<h2>$1</h2>');

    // 2. FUNCIÓN PARA EXTRAER LA IMAGEN DE UNA SECCIÓN ESPECÍFICA
    const extractImageFromSection = (sectionHtml: string | null) => {
        if (!sectionHtml) return null;
        // Buscamos la primera imagen en el HTML de este bloque específico
        const match = sectionHtml.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
        return match ? match[1] : null;
    };

    // 3. SEPARACIÓN (Igual que antes)
    const allSections = cleanContent.split('<h2>');

    const findSection = (textToFind: string) => {
        const index = allSections.findIndex((s: string) => s.toLowerCase().includes(textToFind.toLowerCase()));
        if (index === -1) return null;

        let sectionContent = allSections[index].trim();
        const rawSectionText = index === 0 ? sectionContent : '<h2>' + sectionContent;

        // --- BLOQUE DE DIAGNÓSTICO ---
        if (textToFind === 'Quiénes somos') {
            const pos = rawContent.toLowerCase().indexOf(textToFind.toLowerCase());
            // Sacamos un trozo gigante para ver qué hay
            const spyGlass = rawContent.substring(Math.max(0, pos - 2000), pos + 1000);
            console.log("=== ESPIANDO CÓDIGO RAW CERCA DE QUIÉNES SOMOS ===");
            console.log(spyGlass); 
            console.log("==================================================");
        }
        // -----------------------------

        const pos = rawContent.toLowerCase().indexOf(textToFind.toLowerCase());
        const neighborhood = rawContent.substring(Math.max(0, pos - 1500), pos + 1500); // Subimos a 1500
        const image = extractImageFromSection(neighborhood);

        // Limpieza de texto (igual que antes)
        const cleanText = rawSectionText
            .replace(/\[\/?[^\]]*\]/g, ' ')
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
            .replace(/<i\b[^>]*><\/i>/gm, "");

        return { text: cleanText, image: image };
    };



    // 4. FUNCIÓN ESPECIAL para Misión, Visión y Valores (une los 3 bloques)
    const getMisionesCompletas = () => {
        const m = allSections.find((s: string) => s.includes('Misión'));
        const v = allSections.find((s: string) => s.includes('Visión'));
        const val = allSections.find((s: string) => s.includes('Valores'));

        return `${m ? '<h2>' + m : ''} ${v ? '<h2>' + v : ''} ${val ? '<h2>' + val : ''}`;
    };


    // 4. CAPTURAMOS LAS SECCIONES
    const about = findSection('Quiénes somos');
    const about2 = findSection('especializada en automatización eléctrica');
    const target = findSection('A quién nos dirigimos');
    const tech = findSection('Asesoramiento técnico');
    const projects = findSection('ayudarle a llevar a cabo sus proyectos');
    const training = findSection('Formación');
    const stock = findSection('Stock');
    const postVenta = findSection('Post-venta');
    const marcas = findSection('Nuestras Marcas');
    const catalogo = findSection('Catálogo interactivo');
    const servicios = findSection('Nuestros servicios');

    return {
        about: about?.text || '',
        aboutImg: about?.image || null,
        about2: about2?.text || '',
        about2Img: about2?.image || null,
        misiones: getMisionesCompletas(),
        target: target?.text || '',
        targetImg: target?.image || null,
        tech: tech?.text || '',
        techImg: tech?.image || null,
        projects: projects?.text || '',
        projectsImg: projects?.image || null,
        training: training?.text || '',
        trainingImg: training?.image || null,
        stock: stock?.text || '',
        stockImg: stock?.image || null,
        postVenta: postVenta?.text || '',
        postVentaImg: postVenta?.image || null,
        marcas: marcas?.text || '',
        marcasImg: marcas?.image || null,
        catalogo: catalogo?.text || '',
        catalogoImg: catalogo?.image || null,
        servicios: servicios?.text || '',
        serviciosImg: servicios?.image || null
    };
}

