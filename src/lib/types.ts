export interface GameOption {
  label: string;
  ref_valor: string;
}

export interface GameScene {
  scene_id: string;
  image_url: string;
  title: string;
  comment: string;
  options: [GameOption, GameOption];
}

export interface GameMazo {
  game_id: string;
  version: string;
  title: string;
  description: string;
  scenes: GameScene[];
  active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserChoice {
  session_id: string;
  game_id: string;
  scene_id: string;
  chosen_option: string;
  timestamp: Date;
  ip_address?: string;
  country?: string;
  city?: string;
}

export interface GeoLocation {
  country?: string;
  city?: string;
  ip?: string;
}