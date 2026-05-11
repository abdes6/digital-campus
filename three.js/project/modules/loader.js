import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export function loadModel(url, onProgress) {
    return new Promise((resolve, reject) => {
        loader.load(
            url,
            (gltf) => resolve(gltf),
            (xhr) => {
                if (onProgress && xhr.lengthComputable) {
                    onProgress(xhr.loaded / xhr.total);
                }
            },
            (err) => reject(err)
        );
    });
}
