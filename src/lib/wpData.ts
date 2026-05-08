// src/lib/wpData.ts

export interface WordPressData {
    title: string;
    featuredImage: string | null;
    sections: string[];
}

export async function getWordPressContent(): Promise<WordPressData> {
    const baseUrl = (import.meta as any).env.WP_API_URL;
    const API_URL = `${baseUrl}?slug=home&_embed`;
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            return { title: "Sin título", featuredImage: null, sections: [] };
        }

        const page = data[0];
        const rawContent = page.content.rendered || "";

        let featuredImage = null;
        if (page._embedded && page._embedded['wp:featuredmedia']) {
            featuredImage = page._embedded['wp:featuredmedia'][0].source_url;
        }

        // Troceado por H2
        const sections = rawContent
            .split('<h2')
            .filter((chunk: string) => chunk.trim() !== "")
            .map((chunk: string) => chunk.startsWith('>') || chunk.startsWith(' ') ? '<h2' + chunk : '<h2' + chunk);

        return {
            title: page.title.rendered,
            featuredImage,
            sections
        };
        
    } catch (error) {
        console.error("Error en fetch:", error);
        return { title: "Error", featuredImage: null, sections: [] };
    }
}
