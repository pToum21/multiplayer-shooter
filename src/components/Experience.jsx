// three fiber code

import { Environment, OrbitControls } from "@react-three/drei";
import { Map } from "./Map";
import { useEffect, useState } from "react";
import { Joystick, insertCoin, myPlayer, onPlayerJoin } from "playroomkit";
import { CharacterContoroller } from "./CharacterController";


export const Experience = () => {

  const [players, setPlayers] = useState([]);

  const start = async () => {
    await insertCoin();
  }

  useEffect(() => {
    start();

    onPlayerJoin((state) => {
      const joystick = new Joystick(state, {
        type: 'angular',
        buttons: [{ id: 'fire', label: 'Fire' }]
      })
      const newPlayer = { state, joystick }
      state.setState("health", 100);
      state.setState("death", 0);
      state.setState("kills", 0);
      setPlayers((players) => [...players, newPlayer])
      state.onQuit(() => {
        setPlayers((players) => players.filter((p) => p.state.id !== state.id))
      })

    })
  }, [])

  return (
    <>
      <directionalLight
        position={[25, 18, -25]}
        intensity={0.3}
        castShadow
        shadow-camera-near={0}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-bias={-0.0001}
      />
      <OrbitControls />
      <Map />
      {
        players.map(({ state, joystick }, idx) => (
          <CharacterContoroller
            key={state.id}
            position-x={idx * 2}
            state={state}
            joystick={joystick}
            userPlayer={state.id === myPlayer()?.id}
          />
        )

        )
      }
      <Environment preset="sunset" />
    </>
  );
};
