// Central API routing constants to avoid circular imports.
// Reads Vite environment variables once and exports stable values.

const MAIN_API_ROUTER = import.meta.env.VITE_API_URL;
export const API_ROUTER = `${MAIN_API_ROUTER}/api`;
export const DOCU_API_ROUTER = import.meta.env.VITE_UPLOADS_URL || `${MAIN_API_ROUTER}/uploads`;
