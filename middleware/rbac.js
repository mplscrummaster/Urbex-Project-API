import db from "../db/index.js";

export const isAdmin = (userId) => {
  if (!userId) return false;
  const row = db
    .prepare("SELECT role_user FROM users WHERE _id_user = ?")
    .get(userId);
  return row?.role_user === "admin";
};

export const canEditScenario = (userId, scenarioId) => {
  if (!userId || !scenarioId) return false;
  if (isAdmin(userId)) return true;
  const owner = db
    .prepare("SELECT created_by FROM scenarios WHERE _id_scenario = ?")
    .get(scenarioId);
  if (!owner) return false;
  return owner.created_by === userId;
};

export const canEditMission = (userId, missionId) => {
  if (!userId || !missionId) return false;
  const row = db
    .prepare("SELECT _id_scenario FROM missions WHERE _id_mission = ?")
    .get(missionId);
  if (!row) return false;
  return canEditScenario(userId, row._id_scenario);
};

export const canEditBlock = (userId, blockId) => {
  if (!userId || !blockId) return false;
  const b = db
    .prepare(
      "SELECT owner_type, _id_scenario, _id_mission FROM blocks WHERE _id_block = ?"
    )
    .get(blockId);
  if (!b) return false;
  if (b.owner_type === "mission") {
    return canEditMission(userId, b._id_mission);
  }
  return canEditScenario(userId, b._id_scenario);
};

export default {
  isAdmin,
  canEditScenario,
  canEditMission,
  canEditBlock,
};
