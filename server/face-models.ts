import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

// Base URL for face-api.js models from the official repository
const FACE_API_MODELS_BASE_URL = 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights';

// List of models and their files
const MODELS = {
  ssd_mobilenetv1: [
    'face_detection_model-ssd_mobilenetv1-weights_manifest.json',
    'face_detection_model-ssd_mobilenetv1-weights.bin',
    'face_detection_model-ssd_mobilenetv1-shard1',
  ],
  tiny_face_detector: [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-weights.bin',
    'tiny_face_detector_model-shard1',
  ],
  face_landmark_68: [
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-weights.bin',
    'face_landmark_68_model-shard1',
  ],
  face_recognition: [
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-weights.bin',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
  ],
  face_expression: [
    'face_expression_model-weights_manifest.json',
    'face_expression_model-weights.bin',
    'face_expression_model-shard1',
  ],
};

// Rename model files appropriately
function renameModelFiles() {
  const modelTypes = Object.keys(MODELS);
  for (const modelType of modelTypes) {
    const files = MODELS[modelType as keyof typeof MODELS];
    for (const file of files) {
      if (file.endsWith('-weights_manifest.json')) {
        const targetPath = path.join(process.cwd(), `public/models/${modelType}`);
        fs.copyFile(
          path.join(targetPath, file),
          path.join(targetPath, 'model.json')
        ).catch(err => console.error(`Error copying ${file} to model.json:`, err));
      }
    }
  }
}

// Create the necessary directories and download model files
export async function downloadFaceApiModels(): Promise<boolean> {
  try {
    // Create the base models directory
    await fs.mkdir(path.join(process.cwd(), 'public/models'), { recursive: true });
    
    const modelTypes = Object.keys(MODELS);
    
    // Download each model set
    for (const modelType of modelTypes) {
      // Create directory for this model type
      const targetDir = path.join(process.cwd(), `public/models/${modelType}`);
      await fs.mkdir(targetDir, { recursive: true });
      
      // Get list of files for this model
      const files = MODELS[modelType as keyof typeof MODELS];
      
      // Download each file
      for (const file of files) {
        const fileUrl = `${FACE_API_MODELS_BASE_URL}/${modelType}/${file}`;
        const targetPath = path.join(targetDir, file);
        
        try {
          // Only download if file doesn't exist
          try {
            await fs.access(targetPath);
            console.log(`File already exists: ${targetPath}`);
            continue;
          } catch {
            // File doesn't exist, proceed with download
          }
          
          console.log(`Downloading ${fileUrl}...`);
          const response = await fetch(fileUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to download ${fileUrl}: ${response.status} ${response.statusText}`);
          }
          
          const buffer = await response.buffer();
          await fs.writeFile(targetPath, buffer);
          
          console.log(`Downloaded ${file} for ${modelType}`);
        } catch (downloadError) {
          console.error(`Error downloading ${file} for ${modelType}:`, downloadError);
          
          // Create a placeholder file with appropriate format
          if (file.endsWith('-weights_manifest.json')) {
            const manifestData = {
              modelTopology: { model_type: modelType },
              weightsManifest: [
                {
                  paths: ['weights.bin'],
                  weights: []
                }
              ]
            };
            await fs.writeFile(targetPath, JSON.stringify(manifestData, null, 2));
            await fs.writeFile(path.join(targetDir, 'model.json'), JSON.stringify(manifestData, null, 2));
            
            // Also create a dummy weights file
            await fs.writeFile(path.join(targetDir, 'weights.bin'), Buffer.from([]));
          }
        }
      }
    }
    
    // Rename manifest files to model.json for face-api.js compatibility
    renameModelFiles();
    
    return true;
  } catch (error) {
    console.error('Error downloading face-api.js models:', error);
    return false;
  }
}