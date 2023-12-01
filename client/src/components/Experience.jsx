import { Environment, Grid, OrbitControls, useCursor } from "@react-three/drei";

import { useAtom } from "jotai";
import { useState } from "react";
import { AnimatedWoman } from "./AnimatedWoman";
import { charactersAtom, mapAtom, socket, userAtom } from "./SocketManager";

import { useThree } from "@react-three/fiber";
import { useGrid } from "../hooks/useGrid";
import { Item } from "./Item";

export const Experience = () => {
  const [characters] = useAtom(charactersAtom);
  const [map] = useAtom(mapAtom);
  const [user] = useAtom(userAtom);

  const { gridToVector3, vector3ToGrid } = useGrid();

  const [onFloor, setOnFloor] = useState(false);

  useCursor(onFloor);

  const scene = useThree((state) => state.scene);

  const onCharacterMove = (e) => {
    const character = scene.getObjectByName(`character-${user}`);

    if (!character) return;

    socket.emit("move", {
      from: vector3ToGrid(character.position),
      to: vector3ToGrid(e.point),
    });
  };

  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.3} />

      <OrbitControls />

      <mesh
        rotation-x={-Math.PI / 2}
        position-y={-0.0001}
        onClick={onCharacterMove}
        onPointerEnter={() => setOnFloor(true)}
        onPointerLeave={() => setOnFloor(false)}
        position-x={map.size[0] / 2}
        position-z={map.size[1] / 2}
      >
        <planeGeometry args={map.size} />
        <meshStandardMaterial color="lightblue" />
      </mesh>

      <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />

      {characters.map((character) => (
        <AnimatedWoman
          key={character.id}
          id={character.id}
          path={character.path}
          position={gridToVector3(character.position)}
          hairColor={character.hairColor}
          bottomColor={character.bottomColor}
          topColor={character.topColor}
        />
      ))}

      {map.items.map((item, idx) => (
        <Item key={item.name + idx} item={item} />
      ))}
    </>
  );
};
