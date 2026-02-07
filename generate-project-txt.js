// generate-project-txt.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const OUTPUT_FILE = 'project-content.txt';
const EXCLUDED_DIRS = [
  'node_modules',
  '.astro',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  '.cache',
  'coverage',
  '.vscode',
  '.idea',
  'public',
  'tmp',
  'temp',
  'logs'
];
const EXCLUDED_FILES = [
  'package-lock.json',
  'yarn.lock',
  '.DS_Store',
  OUTPUT_FILE,
  'project-content.txt',
  '.env',
  '.env.local',
  '.env.production',
  '.env.example',
  'generate-project-txt.js' // Excluir este mismo script si quieres
];
const INCLUDED_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', 
  '.vue', '.svelte', '.astro',
  '.html', '.css', '.scss', '.less',
  '.json', '.md', '.txt', '.mdx',
  '.py', '.java', '.cpp', '.c', '.cs',
  '.php', '.rb', '.go', '.rs',
  '.sql', '.graphql', '.gql',
  '.yml', '.yaml', '.toml',
  '.xml', '.svg'
];

// Función para verificar si un archivo debe ser incluido
function shouldIncludeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  
  if (EXCLUDED_FILES.includes(fileName)) return false;
  if (!INCLUDED_EXTENSIONS.includes(ext) && ext !== '') return false;
  
  return true;
}

// Función para verificar si un directorio debe ser excluido
function isExcludedDir(dirPath) {
  const dirName = path.basename(dirPath);
  return EXCLUDED_DIRS.includes(dirName);
}

// Función principal para recorrer el directorio
function traverseDirectory(dirPath, outputLines, relativePath = '') {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = relativePath ? path.join(relativePath, item) : item;
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          if (!isExcludedDir(fullPath)) {
            traverseDirectory(fullPath, outputLines, relativeItemPath);
          }
        } else if (stats.isFile() && shouldIncludeFile(fullPath)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            outputLines.push(`\n${'='.repeat(80)}\n`);
            outputLines.push(`ARCHIVO: ${relativeItemPath}\n`);
            outputLines.push(`${'='.repeat(80)}\n\n`);
            outputLines.push(content);
            outputLines.push('\n'); // Espacio adicional entre archivos
          } catch (readError) {
            outputLines.push(`\n${'='.repeat(80)}\n`);
            outputLines.push(`ARCHIVO: ${relativeItemPath}\n`);
            outputLines.push(`${'='.repeat(80)}\n\n`);
            outputLines.push(`[ERROR: No se pudo leer el archivo - ${readError.message}]\n`);
          }
        }
      } catch (err) {
        console.warn(`Advertencia: No se pudo acceder a ${fullPath}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error al leer directorio ${dirPath}: ${err.message}`);
  }
}

// Función para generar el archivo de resumen
function generateProjectSummary(startDir, outputLines) {
  outputLines.unshift('='.repeat(80));
  outputLines.unshift('RESUMEN DEL PROYECTO');
  outputLines.unshift('='.repeat(80));
  outputLines.unshift('\n');
  
  // Información del proyecto
  try {
    const packagePath = path.join(startDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      outputLines.unshift(`Versión: ${packageJson.version || 'No especificada'}`);
      outputLines.unshift(`Descripción: ${packageJson.description || 'No especificada'}`);
      outputLines.unshift(`Nombre: ${packageJson.name || 'No especificado'}`);
    }
  } catch (err) {
    // Ignorar error
  }
  
  outputLines.unshift(`Generado el: ${new Date().toLocaleString()}`);
  outputLines.unshift(`Directorio raíz: ${startDir}`);
  outputLines.unshift('');
  outputLines.unshift('='.repeat(80));
  outputLines.unshift('CONTENIDO COMPLETO DEL PROYECTO');
}

// Función principal
async function main() {
  const startDir = process.cwd(); // Directorio actual
  const outputLines = [];
  
  console.log('🚀 Iniciando generación del archivo de proyecto...');
  console.log(`📁 Directorio: ${startDir}`);
  console.log(`🚫 Archivos excluidos: ${EXCLUDED_FILES.join(', ')}`);
  console.log(`🚫 Directorios excluidos: ${EXCLUDED_DIRS.join(', ')}`);
  
  generateProjectSummary(startDir, outputLines);
  traverseDirectory(startDir, outputLines);
  
  // Escribir archivo de salida
  try {
    fs.writeFileSync(OUTPUT_FILE, outputLines.join(''));
    const fileSize = Buffer.byteLength(outputLines.join(''), 'utf-8') / 1024;
    console.log(`\n✅ Archivo generado exitosamente: ${OUTPUT_FILE}`);
    console.log(`📊 Tamaño: ${fileSize.toFixed(2)} KB`);
    console.log(`📊 Líneas aproximadas: ${outputLines.length}`);
    
    // Mostrar estadísticas
    const fileCount = outputLines.filter(line => line.includes('ARCHIVO:')).length;
    console.log(`📊 Archivos incluidos: ${fileCount}`);
    
    // Mostrar vista previa
    console.log('\n📋 Vista previa (primeras 10 líneas):');
    const preview = outputLines.slice(0, 15).join('');
    console.log(preview);
    console.log('...\n');
    
    console.log('📋 Instrucciones para usar con IA:');
    console.log('1. Este archivo contiene todo tu código estructurado');
    console.log('2. Cada archivo está delimitado con líneas de =====');
    console.log('3. Puedes enviar este archivo completo a ChatGPT/Claude/Copilot');
    console.log('4. La IA podrá analizar todo tu proyecto como contexto\n');
    
    console.log('⚠️  RECUERDA REVISAR ANTES DE COMPARTIR:');
    console.log('• Credenciales, claves API, tokens');
    console.log('• Variables de entorno sensibles');
    console.log('• Información personal o privada');
    console.log('• Usa: grep -r "password\\|secret\\|key\\|token" project-content.txt');
    
    // Sugerencia de comando para buscar posibles secretos
    console.log('\n🔍 Para buscar posibles secretos:');
    console.log(`grep -i "password\\|secret\\|key\\|token\\|api" ${OUTPUT_FILE} | head -20`);
    
  } catch (err) {
    console.error(`❌ Error al escribir el archivo: ${err.message}`);
    process.exit(1);
  }
}

// Ejecutar si es el módulo principal
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export { generateProjectSummary, traverseDirectory };