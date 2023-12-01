import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import { useAtom } from "jotai";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SkeletonUtils } from "three-stdlib";
import { useGrid } from "../hooks/useGrid";
import { userAtom } from "./SocketManager";

export const MOVEMENT_SPEED = 0.032;

export function AnimatedWoman({
  id,
  hairColor = "green",
  topColor = "pink",
  bottomColor = "blue",
  ...props
}) {
  const name = useMemo(() => `character-${id}`, []);
  const position = useMemo(() => props.position, []);
  const { gridToVector3 } = useGrid();

  const [path, setPath] = useState();

  useEffect(() => {
    const path = [];

    props.path?.forEach((gridPosition) => {
      path.push(gridToVector3(gridPosition));
    });

    setPath(path);
  }, [props.path]);

  const group = useRef();
  const { scene, materials, animations } = useGLTF("/models/AnimatedWoman.glb");
  const { actions } = useAnimations(animations, group);

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);

  const [animation, setAnimation] = useState("CharacterArmature|Idle");

  useEffect(() => {
    actions[animation].reset().fadeIn(0.32).play();

    return () => actions[animation]?.fadeOut(0.22);
  }, [animation]);

  const [user] = useAtom(userAtom);

  useFrame((state, delta) => {
    if (path?.length && group.current.position.distanceTo(path[0]) > 0.1) {
      const direction = group.current.position
        .clone()
        .sub(path[0])
        .normalize()
        .multiplyScalar(MOVEMENT_SPEED);

      group.current.position.sub(direction);
      group.current.lookAt(path[0]);
      setAnimation("CharacterArmature|Run");
    } else if (path?.length) {
      path.shift();
      setAnimation("CharacterArmature|Run");
    } else {
      setAnimation("CharacterArmature|Idle");
    }

    if (id === user) {
      state.camera.position.x = group.current.position.x + 8;
      state.camera.position.y = group.current.position.y + 8;
      state.camera.position.z = group.current.position.z + 8;
      state.camera.lookAt(group.current.position);
    }
  });

  return (
    <group
      ref={group}
      {...props}
      position={position}
      dispose={null}
      name={name}
    >
      <group name="Root_Scene">
        <group name="RootNode">
          <group
            name="CharacterArmature"
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <primitive object={nodes.Root} />
          </group>
          <group name="Casual_Body" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              name="Casual_Body_1"
              geometry={nodes.Casual_Body_1.geometry}
              material={materials.White}
              skeleton={nodes.Casual_Body_1.skeleton}
            >
              <meshStandardMaterial color={topColor} />
            </skinnedMesh>
            <skinnedMesh
              name="Casual_Body_2"
              geometry={nodes.Casual_Body_2.geometry}
              material={materials.Skin}
              skeleton={nodes.Casual_Body_2.skeleton}
            />
          </group>
          <group name="Casual_Feet" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              name="Casual_Feet_1"
              geometry={nodes.Casual_Feet_1.geometry}
              material={materials.Skin}
              skeleton={nodes.Casual_Feet_1.skeleton}
            />
            <skinnedMesh
              name="Casual_Feet_2"
              geometry={nodes.Casual_Feet_2.geometry}
              material={materials.Grey}
              skeleton={nodes.Casual_Feet_2.skeleton}
            />
          </group>
          <group name="Casual_Head" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              name="Casual_Head_1"
              geometry={nodes.Casual_Head_1.geometry}
              material={materials.Skin}
              skeleton={nodes.Casual_Head_1.skeleton}
            />
            <skinnedMesh
              name="Casual_Head_2"
              geometry={nodes.Casual_Head_2.geometry}
              material={materials.Hair_Blond}
              skeleton={nodes.Casual_Head_2.skeleton}
            >
              <meshStandardMaterial color={hairColor} />
            </skinnedMesh>
            <skinnedMesh
              name="Casual_Head_3"
              geometry={nodes.Casual_Head_3.geometry}
              material={materials.Hair_Brown}
              skeleton={nodes.Casual_Head_3.skeleton}
            />
            <skinnedMesh
              name="Casual_Head_4"
              geometry={nodes.Casual_Head_4.geometry}
              material={materials.Brown}
              skeleton={nodes.Casual_Head_4.skeleton}
            />
          </group>
          <skinnedMesh
            name="Casual_Legs"
            geometry={nodes.Casual_Legs.geometry}
            material={materials.Orange}
            skeleton={nodes.Casual_Legs.skeleton}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <meshStandardMaterial color={bottomColor} />
          </skinnedMesh>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/AnimatedWoman.glb");
