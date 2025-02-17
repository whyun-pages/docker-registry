export const HEADER_WWW_AUTHENTICATE = 'www-authenticate';
export const HEADER_AUTHORIZATION = 'authorization';
export const BEARER = 'Bearer ';
export const BASIC_PREFIX = 'Basic ';
export const DOCKER_HUB_REGISTRY = 'registry-1.docker.io';
export function getRegistryHost(env, reqHost) {
    switch (reqHost) {
        case env.REGISTRY_QUAY:
            return 'quay.io';
        case env.REGISTRY_GCR:
            return 'gcr.io';
        case env.REGISTRY_K8S_GCR:
            return 'k8s.gcr.io';
        case env.REGISTRY_K8S_IO:
            return 'registry.k8s.io';
        case env.REGISTRY_GHCR:
            return 'ghcr.io';
        default:
            return DOCKER_HUB_REGISTRY;
    }
}
/**
 * check if auth user in white list
 * @param {string} authHeader the http header authentication
 * @param {string[]} whiteList 
 * @returns {boolean}
 */
export function checkWhiteList(authHeader, whiteList) {
    if (!authHeader) {
        return false;
    }
    if (authHeader.startsWith(BASIC_PREFIX)) {
        authHeader = authHeader.substring(BASIC_PREFIX.length);
    }
    const authUser = atob(authHeader).split(':')[0];
    return whiteList.includes(authUser);
}

export function getAmzDate() {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

  