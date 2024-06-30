export const HEADER_WWW_AUTHENTICATE = 'www-authenticate';
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