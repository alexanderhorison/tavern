import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { V3 } from "./Objects";

// Project plain DOM buttons without giving each label a second React root.
// Ancestor visibility also hides labels when a floor or walking character is hidden.
export default function SceneLabel({
  position,
  text,
  className,
  onSelect,
}: {
  position: V3;
  text: string;
  className: string;
  onSelect: () => void;
}) {
  const anchor = useRef<THREE.Group>(null);
  const button = useRef<HTMLButtonElement | null>(null);
  const action = useRef(onSelect);
  action.current = onSelect;
  const projected = useRef(new THREE.Vector3());
  const { gl, camera, size } = useThree();
  useEffect(() => {
    const element = document.createElement("button");
    element.type = "button";
    element.style.cssText =
      "position:absolute;z-index:25;display:none;transform:translate(-50%,-50%);pointer-events:auto";
    const select = (event: MouseEvent) => {
      event.stopPropagation();
      action.current();
    };
    element.addEventListener("click", select);
    gl.domElement.parentElement?.appendChild(element);
    button.current = element;
    return () => {
      element.removeEventListener("click", select);
      element.remove();
      button.current = null;
    };
  }, [gl]);
  useEffect(() => {
    if (button.current) {
      button.current.textContent = text;
      button.current.className = className;
    }
  }, [text, className, gl]);
  useFrame(() => {
    const element = button.current;
    if (!anchor.current || !element) return;
    let visible = true;
    for (
      let node: THREE.Object3D | null = anchor.current;
      node;
      node = node.parent
    )
      if (!node.visible) visible = false;
    anchor.current.getWorldPosition(projected.current).project(camera);
    const p = projected.current;
    visible =
      visible &&
      p.z > -1 &&
      p.z < 1 &&
      Math.abs(p.x) < 1.1 &&
      Math.abs(p.y) < 1.1;
    element.style.display = visible ? "block" : "none";
    if (visible) {
      element.style.left = `${(p.x * 0.5 + 0.5) * size.width}px`;
      element.style.top = `${(-p.y * 0.5 + 0.5) * size.height}px`;
    }
  });
  return <group ref={anchor} position={position} />;
}
