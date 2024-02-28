import { RigidBody } from "@react-three/rapier"
import { useEffect, useRef } from "react"
import { MeshBasicMaterial } from "three"

const BULLET_SPEED = 20;

const bulletMaterial = new MeshBasicMaterial({
    color: "hotPink",
    toneMapped: false,
})

bulletMaterial.color.multiplyScalar(42)

export const Bullet = ({ player, angle, position, onHit }) => {
    const rigidbody = useRef();
    useEffect(() => {
        const velocity = {
            x: Math.sin(angle) * BULLET_SPEED,
            y: 0,
            z: Math.cos(angle) * BULLET_SPEED,
        }
        rigidbody.current.setLinvel(velocity, true)
    }, [])
    return (
        <group position={[position.x, position.y, position.z]} rotation-y={angle}>
            <RigidBody ref={rigidbody}>
                <mesh position-z={0.25} material={bulletMaterial} castShadow>
                    <boxGeometry args={[0.05, 0.05, 0.5]} />
                </mesh>
            </RigidBody>
        </group>
    )
}