import {GltfBridge, GltfLightNode, NodeKind, LightKind, createTransform} from "pure3d";
import {createCamera} from "../camera/Camera";

export const prepScene = (gltfBridge:GltfBridge) => {
    let scene = gltfBridge.getOriginalScene(createCamera()) (0)
    const light:GltfLightNode & {name: string} = {
        name: "MyLight",
        kind: NodeKind.LIGHT,
        light: {
            kind: LightKind.Point,
            color: [1,1,1],
            intensity: 100 
        },
        transform: createTransform (null) ({
            translation: [-5,5,3]
        }) 
    }

    scene.nodes.push(light);

    return scene;
}
