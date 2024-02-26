import { useRef, useState } from "react"
import { CharacterSoldier } from "./CharacterSoldier";

export const CharacterContoroller = (
    { state, joystick, userPlayer, ...props }
) => {
    const group = useRef();
    const character = useRef();
    const [animation, setAnimation] = useState('Idle');
    return (
        <group ref={group} {...props}>
            <group ref={character}>
                <CharacterSoldier
                    color={state.state.profile?.color}
                    animation={animation}
                />
            </group>
        </group>
    )
}