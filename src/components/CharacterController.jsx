import { useRef, useState } from "react"
import { CharacterSoldier } from "./CharacterSoldier";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";


const MOVEMENT_SPEED = 200


export const CharacterContoroller = (
    { state, joystick, userPlayer, ...props }
) => {
    const group = useRef();
    const character = useRef();
    const [animation, setAnimation] = useState('Idle');
    const rigidbody = useRef();

    useFrame((_, delta) => {
        const angle = joystick.angle();
        if (joystick.isJoystickPressed() && angle) {
            setAnimation('Run');
            character.current.rotation.y = angle;

            const impulse = {
                x: Math.sin(angle) * MOVEMENT_SPEED * delta,
                y: 0,
                z: Math.cos(angle) * MOVEMENT_SPEED * delta,
            };

            rigidbody.current.applyImpulse(impulse, true);
        } else {
            setAnimation('Idle');
        }
    })


    return (
        <group ref={group} {...props}>
            <RigidBody ref={rigidbody} colliders={false}>
                <group ref={character}>
                    <CharacterSoldier
                        color={state.state.profile?.color}
                        animation={animation}
                    />
                </group>
                <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} />
            </RigidBody>
        </group>
    )
}