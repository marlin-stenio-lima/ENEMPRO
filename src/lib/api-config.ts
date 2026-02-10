const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const API_KEYS = {
    QUESTOES_CRONOGRAMA: OPENAI_KEY,
    REDACAO: OPENAI_KEY,
    MATEMATICA_FISICA: OPENAI_KEY,
    HUMANAS: OPENAI_KEY,
    NATUREZA: OPENAI_KEY,
    GEO_ATUALIDADES: OPENAI_KEY,
    YOUTUBE: OPENAI_KEY
};

export type AgentType = keyof typeof API_KEYS;

export const getApiKey = (agent: AgentType): string => {
    return API_KEYS[agent] || '';
};
