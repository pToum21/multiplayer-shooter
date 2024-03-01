import { RigidBody, vec3 } from "@react-three/rapier";
import { isHost } from "playroomkit";
import { useEffect, useRef } from "react";
import { MeshBasicMaterial } from "three";
import { WEAPON_OFFSET } from "./CharacterController";

// speed of bullet
const BULLET_SPEED = 20;

// style of bullets
const bulletMaterial = new MeshBasicMaterial({
    color: "hotpink",
    toneMapped: false,
});

bulletMaterial.color.multiplyScalar(42);

// shooting mechinc and physics of the bullet
export const Bullet = ({ player, angle, position, onHit }) => {
    const rigidbody = useRef();

    useEffect(() => {
        const audio = new Audio("/audios/rifle.mp3");
        audio.play();
        const velocity = {
            x: Math.sin(angle) * BULLET_SPEED,
            y: 0,
            z: Math.cos(angle) * BULLET_SPEED,
        };

        rigidbody.current.setLinvel(velocity, true);
    }, []);

    // bullet jsx return
    return (
        <group position={[position.x, position.y, position.z]} rotation-y={angle}>
            <group
                position-x={WEAPON_OFFSET.x}
                position-y={WEAPON_OFFSET.y}
                position-z={WEAPON_OFFSET.z}
            >
                <RigidBody
                    ref={rigidbody}
                    gravityScale={0}
                    onIntersectionEnter={(e) => {
                        if (isHost() && e.other.rigidBody.userData?.type !== "bullet") {
                            rigidbody.current.setEnabled(false);
                            onHit(vec3(rigidbody.current.translation()));
                        }
                    }}
                    sensor
                    userData={{
                        type: "bullet",
                        player,
                        damage: 10,
                    }}
                >
                    <mesh position-z={0.25} material={bulletMaterial} castShadow>
                        <boxGeometry args={[0.05, 0.05, 0.5]} />
                    </mesh>
                </RigidBody>
            </group>
        </group>
    );
};