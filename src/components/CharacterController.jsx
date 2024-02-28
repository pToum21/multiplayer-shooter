import { useEffect, useRef, useState  } from "react"
import { CharacterSoldier } from "./CharacterSoldier";
import { CapsuleCollider, RigidBody, vec3} from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { isHost,  } from "playroomkit";
import { CameraControls, Billboard, Text, } from "@react-three/drei";


const MOVEMENT_SPEED = 200
const FIRE_RATE = 380;

export const WEAPON_OFFSET = {
    x: -0.2,
    y: 1.4,
    z: 0.8
}

export const CharacterContoroller = (
    { state, joystick, userPlayer, onFire, onKilled, ...props }
) => {

    const group = useRef();
    const character = useRef();
    const rigidbody = useRef();
    const lastShoot = useRef(0);
    const controls = useRef();
    const [animation, setAnimation] = useState('Idle');

    const scene = useThree((state) => state.scene)

    const spawnRandomly = () => {
        const spawns = []
        for (let i = 0; i < 1000; i++) {
            const spawn = scene.getObjectByName(`spawn_${i}`)
            if (spawn) {
                spawns.push(spawn);
            } else {
                break;
            }
        }
        const spawnPos = spawns[Math.floor(Math.random() * spawns.length)].position;
        rigidbody.current.setTranslation(spawnPos)
    }


    useEffect(() => {
        if (isHost()) {
            spawnRandomly()
        }
    }, [])


    useFrame((_, delta) => {

        if (controls.current) {
            const cameraDistanceY = window.innerWidth < 1024 ? 16 : 20;
            const cameraDistanceZ = window.innerWidth < 1024 ? 12 : 16;
            const playerWorldPos = vec3(rigidbody.current.translation());
            controls.current.setLookAt(
                playerWorldPos.x,
                playerWorldPos.y + (state.state.dead ? 12 : cameraDistanceY),
                playerWorldPos.z + (state.state.dead ? 2 : cameraDistanceZ),
                playerWorldPos.x,
                playerWorldPos.y + 1.5,
                playerWorldPos.z,
                true
            );
        }

        if(state.state.dead) {
            setAnimation('Death');
            return;
        }

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

        if (isHost()) {
            state.setState('pos', rigidbody.current.translation())
        } else {
            const pos = state.getState('pos');
            if (pos) {
                rigidbody.current.setTranslation(pos)
            }
        }

        if (joystick.isPressed("fire")) {
            setAnimation("Idle_Shoot");
            if (isHost()) {
                if (Date.now() - lastShoot.current > FIRE_RATE) {
                    lastShoot.current = Date.now();
                    const newBullet = {
                        id: state.id + "-" + +new Date(),
                        position: vec3(rigidbody.current.translation()),
                        angle,
                        player: state.id
                    };
                    onFire(newBullet);
                }
            }
        }

    })


    return (
        <group ref={group} {...props}>
            {
                userPlayer && (<CameraControls ref={controls} />)
            }
            <RigidBody
                ref={rigidbody}
                colliders={false}
                linearDamping={12}
                lockRotations
                type={isHost() ? "dynamic" : "kinematicPosition"}
                onIntersectionEnter={({ other }) => {
                    if (
                        isHost() &&
                        other.rigidBody.userData.type === 'bullet' &&
                        state.state.health > 0
                    ) {
                        const newHealth =
                            state.state.health - other.rigidBody.userData.damage;
                        if (newHealth <= 0) {
                            state.setState("deaths", state.state.deaths + 1);
                            state.setState('dead', true)
                            state.setState('health', 0)
                            rigidbody.current.setEnabled(false)
                            setTimeout(() => {
                                spawnRandomly();
                                rigidbody.current.setEnabled(true)
                                state.setState('health', 100)
                                state.setState('dead', false)
                            }, 2000)
                            onKilled(state.id, other.rigidBody.userData.player)
                        } else {
                            state.setState("health", newHealth)
                        }
                    }
                }}
            >
                <PlayerInfo state={state.state} />
                <group ref={character}>
                    <CharacterSoldier
                        color={state.state.profile?.color}
                        animation={animation}
                    />
                    <Crosshair position={[WEAPON_OFFSET.x, WEAPON_OFFSET.z, WEAPON_OFFSET.y]} />
                </group>
                {userPlayer && <CapsuleCollider args={[0.7, 0.6]} position={[0, 1.28, 0]} />}
            </RigidBody>
        </group>
    )
}



const PlayerInfo = ({ state }) => {
    const health = state.health;
    const name = state.profile.name;
    return (
        <Billboard position-y={2.5}>
            <Text position-y={0.36} fontSize={0.4}>
                {name}
                <meshBasicMaterial color={state.profile.color} />
            </Text>
            <mesh position-z={-0.1}>
                <planeGeometry args={[1, 0.2]} />
                <meshBasicMaterial color="black" transparent opacity={0.5} />
            </mesh>
            <mesh scale-x={health / 100} position-x={-0.5 * (1 - health / 100)}>
                <planeGeometry args={[1, 0.2]} />
                <meshBasicMaterial color="red" />
            </mesh>
        </Billboard>
    );
};



const Crosshair = (props) => {
    return (
        <group {...props}>
            <mesh position-z={1}>
                <boxGeometry args={[0.05, 0.05, 0.05]} />
                <meshBasicMaterial color="black" transparent opacity={0.9} />
            </mesh>
            <mesh position-z={2}>
                <boxGeometry args={[0.05, 0.05, 0.05]} />
                <meshBasicMaterial color="black" transparent opacity={0.85} />
            </mesh>
            <mesh position-z={3}>
                <boxGeometry args={[0.05, 0.05, 0.05]} />
                <meshBasicMaterial color="black" transparent opacity={0.8} />
            </mesh>

            <mesh position-z={4.5}>
                <boxGeometry args={[0.05, 0.05, 0.05]} />
                <meshBasicMaterial color="black" opacity={0.7} transparent />
            </mesh>

            <mesh position-z={6.5}>
                <boxGeometry args={[0.05, 0.05, 0.05]} />
                <meshBasicMaterial color="black" opacity={0.6} transparent />
            </mesh>

            <mesh position-z={9}>
                <boxGeometry args={[0.05, 0.05, 0.05]} />
                <meshBasicMaterial color="black" opacity={0.2} transparent />
            </mesh>
        </group>
    );
};