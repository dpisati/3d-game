import { useGLTF } from "@react-three/drei";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { SkeletonUtils } from "three-stdlib";
import { mapAtom } from "./SocketManager";

export const Item = ({ item }) => {
  const { name, gridPosition, size, rotation } = item;
  const { scene } = useGLTF(`/models/items/${name}.glb`);

  const [map] = useAtom(mapAtom);

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const width = rotation === 1 || rotation === 3 ? size[1] : size[0];
  const height = rotation === 1 || rotation === 3 ? size[0] : size[1];

  return (
    <primitive
      object={clone}
      rotation-y={(rotation ?? 0) * (Math.PI / 2)}
      position={[
        width / map.gridDivision / 2 + gridPosition[0] / map.gridDivision,
        0,
        height / map.gridDivision / 2 + gridPosition[1] / map.gridDivision,
        ,
      ]}
    />
  );
};
