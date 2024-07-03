import { Buffer } from 'node:buffer';
export const HEADER_WWW_AUTHENTICATE = 'www-authenticate';
export const HEADER_AUTHORIZATION = 'authorization';
export const BEARER = 'Bearer ';
export const BASIC_PREFIX = 'Basic ';
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
            return 'registry-1.docker.io';
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
    const authUser = Buffer.from(authHeader, 'base64').toString().split(':')[0];
    return whiteList.includes(authUser);
}