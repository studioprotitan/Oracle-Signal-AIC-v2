import { useState, useEffect, useRef } from "react";
import { Scene, TransformNode } from "@babylonjs/core";
import { glbLoaderService } from "../services/glbLoaderService";

interface UseGltfAssetResult {
  model: TransformNode | null;
  isLoading: boolean;
  error: Error | null;
  isProceduralFallback: boolean;
}

/**
 * A custom React hook to load and instantiate GLB assets using the `glbLoaderService`.
 * Manages loading states, caches the asset, handles errors, and disposes of the model on unmount.
 *
 * @param scene - The BabylonJS Scene instance. If null, loading is deferred.
 * @param modelPath - The path or URL of the GLB model to load.
 * @param parent - Optional parent TransformNode to attach the instantiated model to.
 */
export function useGltfAsset(
  scene: Scene | null,
  modelPath: string,
  parent?: TransformNode
): UseGltfAssetResult {
  const [model, setModel] = useState<TransformNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isProceduralFallback, setIsProceduralFallback] = useState<boolean>(false);

  // References to keep track of the active instance across renders and prevent duplicates
  const activeModelRef = useRef<TransformNode | null>(null);
  const currentSceneRef = useRef<Scene | null>(null);

  useEffect(() => {
    currentSceneRef.current = scene;

    if (!scene || !modelPath) {
      // Clear state if scene is not yet initialized or modelPath is empty
      if (activeModelRef.current) {
        activeModelRef.current.dispose();
        activeModelRef.current = null;
        setModel(null);
      }
      setIsLoading(false);
      return;
    }

    let isAborted = false;
    setIsLoading(true);
    setError(null);

    // Sequence to preload (from cache or server) and then instantiate
    const loadAndInstantiate = async () => {
      try {
        // Step 1: Pre-load/check cache
        const preloadedSuccess = await glbLoaderService.preLoadModel(scene, modelPath);
        
        if (isAborted) return;

        // Step 2: Instantiate the asset (uses GLB if successful, procedural fallback otherwise)
        const instantiatedNode = glbLoaderService.instantiateModel(scene, modelPath, parent);
        
        if (isAborted) {
          instantiatedNode.dispose();
          return;
        }

        // Clean up any previously instantiated model before assigning the new one
        if (activeModelRef.current) {
          activeModelRef.current.dispose();
        }

        activeModelRef.current = instantiatedNode;
        setModel(instantiatedNode);
        setIsProceduralFallback(!preloadedSuccess);
        setIsLoading(false);
      } catch (err: any) {
        if (isAborted) return;
        
        console.error(`useGltfAsset // Critical failure loading "${modelPath}":`, err);
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);

        // Fallback to instantiate anyway (glbLoaderService will output procedural model on cache miss / error)
        try {
          const fallbackNode = glbLoaderService.instantiateModel(scene, modelPath, parent);
          if (activeModelRef.current) {
            activeModelRef.current.dispose();
          }
          activeModelRef.current = fallbackNode;
          setModel(fallbackNode);
          setIsProceduralFallback(true);
        } catch (fallbackErr) {
          console.error("useGltfAsset // Procedural fallback creation failed:", fallbackErr);
        }
        
        setIsLoading(false);
      }
    };

    loadAndInstantiate();

    // Clean up when unmounting, or when scene/modelPath/parent changes
    return () => {
      isAborted = true;
      if (activeModelRef.current) {
        activeModelRef.current.dispose();
        activeModelRef.current = null;
      }
    };
  }, [scene, modelPath, parent]);

  return { model, isLoading, error, isProceduralFallback };
}
