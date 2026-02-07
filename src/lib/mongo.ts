import mongoose from 'mongoose';
import type { GameMazo, UserChoice } from './types';

// SOLUCIÓN: Obtener MONGODB_URI de varias formas
const MONGODB_URI: string|any = 
  // 1. Desde variables de entorno de Vite/Astro
  import.meta.env.MONGODB_URI || 
  // 2. Desde variables de entorno de Node.js
  process.env.MONGODB_URI 
  // 4. Fallback para desarrollo localu
  'mongodb://localhost:27017/visualdilemma';

// Validación mejorada con mensaje informativo
if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/visualdilemma') {
  console.warn('⚠️  MONGODB_URI usando valor por defecto. Configura tu variable de entorno.');
  console.info('ℹ️  Crea un archivo .env.local con: MONGODB_URI=mongodb+srv://...');
}

// Definir la interfaz del caché
interface MongooseCache {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
}

// Declarar global con mejor tipado
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Inicializar caché
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

export async function connectDB(): Promise<mongoose.Mongoose> {
  // Si ya hay conexión cacheada, retornarla
  if (cached.conn) {
    return cached.conn;
  }

  // Si no hay una promesa de conexión en proceso, crear una
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ Conectado a MongoDB');
      return mongooseInstance;
    }).catch((error) => {
      console.error('❌ Error conectando a MongoDB:', error);
      // Limpiar la promesa cacheada en caso de error
      cached.promise = null;
      throw error;
    });
  }

  // Esperar a que se resuelva la promesa de conexión
  cached.conn = await cached.promise;

  // Cachear solo en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    global.mongoose = cached;
  }

  return cached.conn;
}

// Schema para Mazo (contenido del juego)
const mazoSchema = new mongoose.Schema<GameMazo>({
  game_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  version: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  scenes: [{
    scene_id: {
      type: String,
      required: true
    },
    image_url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    options: [{
      label: {
        type: String,
        required: true
      },
      ref_valor: {
        type: String,
        required: true
      }
    }]
  }],
  active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  collation: { locale: 'es', strength: 2 }
});

// Schema para elecciones de usuarios
const userChoiceSchema = new mongoose.Schema<UserChoice>({
  session_id: {
    type: String,
    required: true,
    index: true
  },
  game_id: {
    type: String,
    required: true,
    index: true
  },
  scene_id: {
    type: String,
    required: true
  },
  chosen_option: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ip_address: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  }
}, {
  timestamps: false
});

// Índices compuestos para búsquedas eficientes
userChoiceSchema.index({ session_id: 1, game_id: 1, scene_id: 1 });
userChoiceSchema.index({ game_id: 1, timestamp: -1 });
userChoiceSchema.index({ timestamp: -1 });

// Modelos
export const Mazo = mongoose.models.Mazo || mongoose.model<GameMazo>('Mazo', mazoSchema);
export const UserChoiceModel = mongoose.models.UserChoice || mongoose.model<UserChoice>('UserChoice', userChoiceSchema);

// Función de utilidad para cerrar la conexión
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    if (global.mongoose) {
      global.mongoose = undefined;
    }
    console.log('🔌 Desconectado de MongoDB');
  }
}