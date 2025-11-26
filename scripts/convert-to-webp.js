const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const inputDir = path.join(process.cwd(), 'public', 'uploads', 'products');
const backupDir = path.join(process.cwd(), 'public', 'uploads', 'products-backup');
const outputDir = path.join(process.cwd(), 'public', 'uploads', 'products');

// WebP conversion settings
const webpOptions = {
  quality: 85, // High quality WebP
  effort: 6,   // Maximum compression effort
  lossless: false,
  nearLossless: false,
  smartSubsample: true,
  reductionEffort: 6
};

// Image processing settings
const resizeOptions = {
  width: 400,  // Resize to max 400px width
  height: 400, // Resize to max 400px height
  fit: 'inside', // Maintain aspect ratio
  withoutEnlargement: true // Don't enlarge smaller images
};

// Statistics tracking
let stats = {
  total: 0,
  converted: 0,
  skipped: 0,
  errors: 0,
  originalSize: 0,
  newSize: 0,
  saved: 0
};

// Create backup directory
function createBackupDir() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('📁 Created backup directory');
  }
}

// Get all image files
function getImageFiles() {
  const files = fs.readdirSync(inputDir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });
}

// Convert single image to WebP
async function convertImageToWebP(inputPath, outputPath) {
  try {
    // Get original file stats
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;
    
    // Process image with Sharp
    await sharp(inputPath)
      .resize(resizeOptions)
      .webp(webpOptions)
      .toFile(outputPath);
    
    // Get new file stats
    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    
    // Update statistics
    stats.originalSize += originalSize;
    stats.newSize += newSize;
    stats.saved += (originalSize - newSize);
    
    return {
      success: true,
      originalSize,
      newSize,
      saved: originalSize - newSize,
      reduction: ((originalSize - newSize) / originalSize * 100).toFixed(1)
    };
  } catch (error) {
    console.error(`❌ Error converting ${path.basename(inputPath)}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Process all images
async function convertAllImages() {
  console.log('🔄 Starting WebP conversion and compression...\n');
  
  // Create backup
  createBackupDir();
  
  // Get all image files
  const imageFiles = getImageFiles();
  stats.total = imageFiles.length;
  
  console.log(`📊 Found ${stats.total} images to process\n`);
  
  // Process each image
  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const inputPath = path.join(inputDir, filename);
    const outputPath = path.join(outputDir, filename.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    
    console.log(`[${i + 1}/${stats.total}] Processing: ${filename}`);
    
    // Check if WebP already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  WebP already exists, skipping...`);
      stats.skipped++;
      continue;
    }
    
    // Backup original file
    const backupPath = path.join(backupDir, filename);
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
    }
    
    // Convert to WebP
    const result = await convertImageToWebP(inputPath, outputPath);
    
    if (result.success) {
      console.log(`✅ Converted: ${result.originalSize} bytes → ${result.newSize} bytes (${result.reduction}% reduction)`);
      stats.converted++;
      
      // Replace original with WebP (keeping same filename structure)
      const newOriginalPath = path.join(outputDir, filename.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
      if (fs.existsSync(newOriginalPath)) {
        // Remove original and rename WebP to original name
        fs.unlinkSync(inputPath);
        fs.renameSync(newOriginalPath, inputPath);
        console.log(`🔄 Replaced original with WebP version`);
      }
    } else {
      stats.errors++;
    }
    
    console.log(''); // Empty line for readability
  }
}

// Generate conversion report
function generateReport() {
  const totalReduction = ((stats.saved / stats.originalSize) * 100).toFixed(1);
  const avgOriginalSize = (stats.originalSize / stats.converted).toFixed(0);
  const avgNewSize = (stats.newSize / stats.converted).toFixed(0);
  
  console.log('📊 CONVERSION REPORT');
  console.log('==================');
  console.log(`Total images processed: ${stats.total}`);
  console.log(`Successfully converted: ${stats.converted}`);
  console.log(`Skipped (already WebP): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log('');
  console.log(`Original total size: ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`New total size: ${(stats.newSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Space saved: ${(stats.saved / 1024 / 1024).toFixed(2)} MB (${totalReduction}%)`);
  console.log('');
  console.log(`Average original size: ${(avgOriginalSize / 1024).toFixed(1)} KB`);
  console.log(`Average new size: ${(avgNewSize / 1024).toFixed(1)} KB`);
  console.log('');
  console.log('🎉 WebP conversion completed!');
  console.log('📁 Original files backed up to:', backupDir);
}

// Main execution
async function main() {
  try {
    await convertAllImages();
    generateReport();
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { convertAllImages, convertImageToWebP };
