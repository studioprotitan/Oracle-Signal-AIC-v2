import { 
  Scene, 
  SceneLoader, 
  AssetContainer, 
  TransformNode, 
  MeshBuilder, 
  StandardMaterial, 
  Color3, 
  Vector3 
} from "@babylonjs/core";
import "@babylonjs/loaders";

/**
 * Service for pre-loading, caching, and instantiating 3D GLB assets.
 * Handles the "cst-ert-stealth-infiltrator-x2-a.glb" model for the Deck Monitor Cockpit.
 * Provides a high-fidelity procedural fallback if the GLB file is empty or fails to load.
 */
class GLBLoaderService {
  private cache: Map<string, AssetContainer> = new Map();
  private fallbackCache: Map<string, TransformNode> = new Map();

  /**
   * Pre-loads a GLB file and caches its AssetContainer.
   * If the file is empty or invalid, falls back gracefully to a procedural high-fidelity model.
   */
  public async preLoadModel(scene: Scene, modelPath: string): Promise<boolean> {
    if (this.cache.has(modelPath)) {
      return true;
    }

    try {
      console.log(`GLB Loader Service // Initiating pre-load sequence for: ${modelPath}`);
      // Clean path and load the asset container
      const container = await SceneLoader.LoadAssetContainerAsync("", modelPath, scene);
      this.cache.set(modelPath, container);
      console.log(`GLB Loader Service // Successfully pre-loaded and cached: ${modelPath}`);
      return true;
    } catch (error: any) {
      console.warn(
        `GLB Loader Service // Unable to load GLB file from "${modelPath}". ` +
        `Reason: ${error?.message || "File might be empty or uncompiled."} ` +
        `Deploying high-fidelity procedural fallback.`
      );
      return false;
    }
  }

  /**
   * Instantiates a pre-loaded model or falls back to a procedural mesh.
   */
  public instantiateModel(scene: Scene, modelPath: string, parent?: TransformNode): TransformNode {
    const container = this.cache.get(modelPath);

    if (container) {
      console.log(`GLB Loader Service // Instantiating cached GLB container: ${modelPath}`);
      const entries = container.instantiateModelsToScene(
        (name) => `infiltrator_${name}`,
        false
      );
      
      const rootNode = new TransformNode(`glb_root_${modelPath}`, scene);
      if (parent) {
        rootNode.parent = parent;
      }

      entries.rootNodes.forEach(node => {
        node.parent = rootNode;
      });

      return rootNode;
    }

    // Default Fallback: Create a gorgeous procedural "Stealth Infiltrator X2-A"
    console.log(`GLB Loader Service // Initializing procedural composite fallback for: ${modelPath}`);
    return this.createProceduralStealthInfiltrator(scene, parent);
  }

  /**
   * Constructs a visually stunning, detailed procedural 3D model of the "Stealth Infiltrator X2-A".
   * This is fully featured with faceted dark carbon plating, glowing amber vector-thrust thrusters,
   * a sleek cybernetic sensor array, and swept-back wings.
   */
  private createProceduralStealthInfiltrator(scene: Scene, parent?: TransformNode): TransformNode {
    const infiltratorRoot = new TransformNode("stealthInfiltratorRoot", scene);
    if (parent) {
      infiltratorRoot.parent = parent;
    }

    // Material definitions
    const carbonHullMat = new StandardMaterial("carbonHullMat", scene);
    carbonHullMat.diffuseColor = new Color3(0.08, 0.09, 0.11);
    carbonHullMat.specularColor = new Color3(0.35, 0.38, 0.42);
    carbonHullMat.roughness = 0.15;

    const goldAlloyTrimMat = new StandardMaterial("goldAlloyTrimMat", scene);
    goldAlloyTrimMat.diffuseColor = new Color3(0.64, 0.45, 0.12);
    goldAlloyTrimMat.specularColor = new Color3(0.85, 0.72, 0.35);
    goldAlloyTrimMat.roughness = 0.25;

    const amberPlasmaMat = new StandardMaterial("amberPlasmaMat", scene);
    amberPlasmaMat.emissiveColor = new Color3(1.0, 0.45, 0.0);
    amberPlasmaMat.diffuseColor = new Color3(0.1, 0.02, 0.0);
    amberPlasmaMat.disableLighting = true;

    const cyberBlueMat = new StandardMaterial("cyberBlueMat", scene);
    cyberBlueMat.emissiveColor = new Color3(0.0, 0.85, 1.0);
    cyberBlueMat.diffuseColor = new Color3(0.0, 0.05, 0.1);
    cyberBlueMat.disableLighting = true;

    // 1. Sleek diamond-faceted fuselage
    const cockpitLength = 1.6;
    const bodyCenter = MeshBuilder.CreateCylinder("stealthFuselage", {
      height: cockpitLength,
      diameterTop: 0.05,
      diameterBottom: 0.35,
      tessellation: 5
    }, scene);
    bodyCenter.parent = infiltratorRoot;
    bodyCenter.rotation.x = Math.PI / 2; // Lie flat along Z-axis
    bodyCenter.position.set(0, 0.15, 0);
    bodyCenter.material = carbonHullMat;

    // 2. Angular Canopy Shield
    const canopy = MeshBuilder.CreateSphere("stealthCanopy", {
      diameterX: 0.18,
      diameterY: 0.12,
      diameterZ: 0.4
    }, scene);
    canopy.parent = infiltratorRoot;
    canopy.position.set(0, 0.25, 0.1);
    canopy.material = cyberBlueMat;

    // 3. Left Swept Wing
    const leftWing = MeshBuilder.CreateBox("stealthLeftWing", {
      width: 1.1,
      height: 0.02,
      depth: 0.4
    }, scene);
    leftWing.parent = infiltratorRoot;
    leftWing.position.set(-0.6, 0.12, -0.2);
    leftWing.rotation.set(0.04, 0, -Math.PI / 18); // Swept-back tilt
    leftWing.material = carbonHullMat;

    // Left Winglet / Wing stabilizer
    const leftWinglet = MeshBuilder.CreateBox("stealthLeftWinglet", {
      width: 0.02,
      height: 0.25,
      depth: 0.25
    }, scene);
    leftWinglet.parent = leftWing;
    leftWinglet.position.set(-0.5, 0.05, 0.05);
    leftWinglet.rotation.z = -Math.PI / 12;
    leftWinglet.material = goldAlloyTrimMat;

    // 4. Right Swept Wing
    const rightWing = MeshBuilder.CreateBox("stealthRightWing", {
      width: 1.1,
      height: 0.02,
      depth: 0.4
    }, scene);
    rightWing.parent = infiltratorRoot;
    rightWing.position.set(0.6, 0.12, -0.2);
    rightWing.rotation.set(-0.04, 0, Math.PI / 18);
    rightWing.material = carbonHullMat;

    // Right Winglet
    const rightWinglet = MeshBuilder.CreateBox("stealthRightWinglet", {
      width: 0.02,
      height: 0.25,
      depth: 0.25
    }, scene);
    rightWinglet.parent = rightWing;
    rightWinglet.position.set(0.5, 0.05, 0.05);
    rightWinglet.rotation.z = Math.PI / 12;
    rightWinglet.material = goldAlloyTrimMat;

    // 5. Twin Stealth Air Intakes
    for (let side = -1; side <= 1; side += 2) {
      const intake = MeshBuilder.CreateBox(`airIntake_${side}`, {
        width: 0.12,
        height: 0.08,
        depth: 0.24
      }, scene);
      intake.parent = infiltratorRoot;
      intake.position.set(side * 0.18, 0.14, 0.3);
      intake.rotation.y = side * 0.08;
      intake.material = carbonHullMat;

      const intakeGlow = MeshBuilder.CreateBox(`airIntakeGlow_${side}`, {
        width: 0.1,
        height: 0.06,
        depth: 0.02
      }, scene);
      intakeGlow.parent = intake;
      intakeGlow.position.set(0, 0, 0.11);
      intakeGlow.material = amberPlasmaMat;
    }

    // 6. Dual Vector Thrust Nozzles
    for (let side = -1; side <= 1; side += 2) {
      const engine = MeshBuilder.CreateCylinder(`thrusterEngine_${side}`, {
        height: 0.4,
        diameter: 0.14,
        tessellation: 8
      }, scene);
      engine.parent = infiltratorRoot;
      engine.rotation.x = Math.PI / 2;
      engine.position.set(side * 0.14, 0.12, -0.7);
      engine.material = carbonHullMat;

      const plume = MeshBuilder.CreateCylinder(`thrusterPlume_${side}`, {
        height: 0.15,
        diameterTop: 0.08,
        diameterBottom: 0.01,
        tessellation: 8
      }, scene);
      plume.parent = engine;
      plume.position.y = -0.25; // Exiting exhaust pipe
      plume.material = amberPlasmaMat;
    }

    // 7. Tactical Sub-chassis Sensor Needle
    const sensorNeedle = MeshBuilder.CreateCylinder("sensorNeedle", {
      height: 0.35,
      diameterTop: 0.005,
      diameterBottom: 0.03,
      tessellation: 4
    }, scene);
    sensorNeedle.parent = infiltratorRoot;
    sensorNeedle.rotation.x = Math.PI / 2;
    sensorNeedle.position.set(0, 0.08, 0.85);
    sensorNeedle.material = goldAlloyTrimMat;

    // Small glowing scanner orb on the sensor node
    const sensorNode = MeshBuilder.CreateSphere("sensorNode", { diameter: 0.03 }, scene);
    sensorNode.parent = sensorNeedle;
    sensorNode.position.y = 0.18; // Tip of needle
    sensorNode.material = cyberBlueMat;

    return infiltratorRoot;
  }
}

export const glbLoaderService = new GLBLoaderService();
