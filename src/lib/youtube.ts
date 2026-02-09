// MOCK DATA CACHE to simulate a realistic environment without API quota usage
const MOCK_CACHE: Record<string, any[]> = {
    'matematica': [
        { id: { videoId: 'tK3q0tGZp5g' }, snippet: { title: 'MATEMÁTICA BÁSICA - O que mais cai no ENEM', channelTitle: 'Matemática Rio com Prof. Rafael Procopio', thumbnails: { medium: { url: 'https://i.ytimg.com/vi/tK3q0tGZp5g/mqdefault.jpg' } } } },
        { id: { videoId: 'Full_Video_ID_2' }, snippet: { title: 'INTENSIVÃO DE MATEMÁTICA ENEM - Habilidades Numéricas', channelTitle: 'Descomplica', thumbnails: { medium: { url: 'https://img.youtube.com/vi/bXg2-3I5t6U/mqdefault.jpg' } } } },
        { id: { videoId: 'Full_Video_ID_3' }, snippet: { title: 'GEOMETRIA PLANA: Tudo que você precisa saber', channelTitle: 'Professor Ferretto', thumbnails: { medium: { url: 'https://img.youtube.com/vi/5wJ5wJ5wJ5w/mqdefault.jpg' } } } },
        { id: { videoId: 'Full_Video_ID_4' }, snippet: { title: 'ANÁLISE COMBINATÓRIA em 5 passos', channelTitle: 'Matemática Rio', thumbnails: { medium: { url: 'https://img.youtube.com/vi/6xJ6xJ6xJ6x/mqdefault.jpg' } } } },
    ],
    'fisica': [
        { id: { videoId: 'MOCK_PHY_1' }, snippet: { title: 'RESUMÃO DE FÍSICA PARA O ENEM: Mecânica', channelTitle: 'Canal Física', thumbnails: { medium: { url: 'https://img.youtube.com/vi/7yM7yM7yM7M/mqdefault.jpg' } } } },
        { id: { videoId: 'MOCK_PHY_2' }, snippet: { title: 'Eletrodinâmica: Corrente e Resistência', channelTitle: 'Professor Boaro', thumbnails: { medium: { url: 'https://img.youtube.com/vi/8zN8zN8zN8N/mqdefault.jpg' } } } },
        { id: { videoId: 'MOCK_PHY_3' }, snippet: { title: 'Óptica Geométrica - Espelhos e Lentes', channelTitle: 'Chama o Físico', thumbnails: { medium: { url: 'https://img.youtube.com/vi/9aO9aO9aO9a/mqdefault.jpg' } } } },
    ],
    'quimica': [
        { id: { videoId: 'MOCK_CHE_1' }, snippet: { title: 'QUÍMICA ORGÂNICA: As principais funções', channelTitle: 'Química com G', thumbnails: { medium: { url: 'https://img.youtube.com/vi/1bP1bP1bP1b/mqdefault.jpg' } } } },
        { id: { videoId: 'MOCK_CHE_2' }, snippet: { title: 'Estequiometria sem medo - Passo a passo', channelTitle: 'Cafeína', thumbnails: { medium: { url: 'https://img.youtube.com/vi/2cQ2cQ2cQ2c/mqdefault.jpg' } } } },
    ],
    'biologia': [
        { id: { videoId: 'MOCK_BIO_1' }, snippet: { title: 'ECOLOGIA NO ENEM: Resumo Completo', channelTitle: 'Biologia Total', thumbnails: { medium: { url: 'https://img.youtube.com/vi/3dR3dR3dR3d/mqdefault.jpg' } } } },
        { id: { videoId: 'MOCK_BIO_2' }, snippet: { title: 'CITOLOGIA: A Célula e suas Organelas', channelTitle: 'Prof. Jubilut', thumbnails: { medium: { url: 'https://img.youtube.com/vi/4eS4eS4eS4e/mqdefault.jpg' } } } },
    ],
    'historia': [
        { id: { videoId: 'MOCK_HIS_1' }, snippet: { title: 'ERA VARGAS: O assunto que mais cai', channelTitle: 'Débora Aladim', thumbnails: { medium: { url: 'https://img.youtube.com/vi/5fT5fT5fT5f/mqdefault.jpg' } } } },
        { id: { videoId: 'MOCK_HIS_2' }, snippet: { title: 'DITADURA MILITAR NO BRASIL - Resumo', channelTitle: 'Se Liga Nessa História', thumbnails: { medium: { url: 'https://img.youtube.com/vi/6gU6gU6gU6g/mqdefault.jpg' } } } },
    ],
    'geografia': [
        { id: { videoId: 'MOCK_GEO_1' }, snippet: { title: 'GEOPOLÍTICA ATUAL: Conflitos e Economia', channelTitle: 'Geografia Irada', thumbnails: { medium: { url: 'https://img.youtube.com/vi/7hV7hV7hV7h/mqdefault.jpg' } } } },
        { id: { videoId: 'MOCK_GEO_2' }, snippet: { title: 'URBANIZAÇÃO BRASILEIRA', channelTitle: 'Prof. Hansen', thumbnails: { medium: { url: 'https://img.youtube.com/vi/8iW8iW8iW8i/mqdefault.jpg' } } } },
    ],
    'portugues': [
        { id: { videoId: 'MOCK_POR_1' }, snippet: { title: 'FIGURAS DE LINGUAGEM: Aula Completa', channelTitle: 'Português com Letícia', thumbnails: { medium: { url: 'https://img.youtube.com/vi/9jX9jX9jX9j/mqdefault.jpg' } } } },
        { id: { videoId: 'MOCK_POR_2' }, snippet: { title: 'INTERPRETAÇÃO DE TEXTO: Dicas de Ouro', channelTitle: 'Redação e Gramática', thumbnails: { medium: { url: 'https://img.youtube.com/vi/0kY0kY0kY0k/mqdefault.jpg' } } } },
    ],
    'redacao': [
        { id: { videoId: 'MOCK_RED_1' }, snippet: { title: 'REDAÇÃO ENEM 2024: Estrutura Nota 1000', channelTitle: 'Luma e Ponto', thumbnails: { medium: { url: 'https://img.youtube.com/vi/1lZ1lZ1lZ1l/mqdefault.jpg' } } } },
        { id: { videoId: 'MOCK_RED_2' }, snippet: { title: 'REPERTÓRIOS CORINGA Para Qualquer Tema', channelTitle: 'Profinho', thumbnails: { medium: { url: 'https://img.youtube.com/vi/2mA2mA2mA2m/mqdefault.jpg' } } } },
    ],
};

export const searchYouTubeVideos = async (query: string, maxResults = 12) => {
    const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

    // Use Mock Data if no API key or if it simulates a specific subject query
    if (!API_KEY) {
        // Simple logic to match query to mock category
        const lowerQuery = query.toLowerCase();
        let mockData: any[] = [];

        if (lowerQuery.includes('matemática')) mockData = MOCK_CACHE['matematica'];
        else if (lowerQuery.includes('física')) mockData = MOCK_CACHE['fisica'];
        else if (lowerQuery.includes('química')) mockData = MOCK_CACHE['quimica'];
        else if (lowerQuery.includes('biologia')) mockData = MOCK_CACHE['biologia'];
        else if (lowerQuery.includes('história')) mockData = MOCK_CACHE['historia'];
        else if (lowerQuery.includes('geografia')) mockData = MOCK_CACHE['geografia'];
        else if (lowerQuery.includes('linguagens') || lowerQuery.includes('português')) mockData = MOCK_CACHE['portugues'];
        else if (lowerQuery.includes('redação')) mockData = MOCK_CACHE['redacao'];
        else mockData = [...MOCK_CACHE['matematica'], ...MOCK_CACHE['redacao']]; // Fallback mix

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return mockData || [];
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query + ' -shorts')}&type=video&key=${API_KEY}`
        );
        const data = await response.json();

        if (data.error) {
            console.error('YouTube API Error:', data.error);
            return MOCK_CACHE['matematica']; // Fallback on error
        }

        return data.items || [];
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
};
