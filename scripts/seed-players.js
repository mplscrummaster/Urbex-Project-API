import db from "../db/index.js";
import { users } from "./seed-users.js";

// Vide la table players avant d'insérer
db.prepare("DELETE FROM players").run();

const animalNicknames = [
  "Lynx",
  "Renard",
  "Hérisson",
  "Loup",
  "Chouette",
  "Castor",
  "Bison",
  "Faucon",
  "Cerf",
  "Ours",
  "Sanglier",
  "Écureuil",
  "Mouflon",
  "Dauphin",
  "Tortue",
  "Panthère",
];
const bios = [
  "Explorateur du dimanche",
  "Chasseur de trésors",
  "Aventurier urbain",
  "Détective des ruines",
  "Randonneur nocturne",
  "Chercheur de mystères",
  "Glaneur de secrets",
  "Traqueur de frissons",
  "Collectionneur d'émotions",
  "Voyageur des ombres",
  "Pisteur de légendes",
  "Marcheur solitaire",
  "Curieux invétéré",
  "Rêveur de béton",
  "Fouineur de l'inconnu",
  "Éclaireur des profondeurs",
];

function randomAvatarUrl(nickname) {
  // Utilise une image générée via https://api.dicebear.com/6.x/avataaars/svg?seed=Totem
  return `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(
    nickname
  )}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const now = new Date().toISOString();

// Récupère les _id_user depuis la base après le seed des users
const userRows = db
  .prepare("SELECT _id_user, mail_user FROM users WHERE role_user = 'player'")
  .all();

const players = userRows.map((u, i) => ({
  _id_player: i + 1,
  _id_user: u._id_user,
  nickname: animalNicknames[i % animalNicknames.length],
  bio: bios[i % bios.length],
  url_img_avatar: randomAvatarUrl(animalNicknames[i % animalNicknames.length]),
  score: randomInt(100, 5000),
  level: randomInt(1, 10),
  xp: randomInt(0, 3000),
  created_at: now,
}));

const insertPlayer = db.prepare(`
  INSERT INTO players (_id_player, _id_user, nickname, bio, url_img_avatar, score, level, xp, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAllPlayers = db.transaction(() => {
  for (const player of players) {
    insertPlayer.run(
      player._id_player,
      player._id_user,
      player.nickname,
      player.bio,
      player.url_img_avatar,
      player.score,
      player.level,
      player.xp,
      player.created_at
    );
  }
});

insertAllPlayers();

console.log(`Seed players: ${players.length} players insérés.`);

export { players };
