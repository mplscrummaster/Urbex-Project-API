DROP VIEW IF EXISTS v_scenarios_full_json;

CREATE VIEW v_scenarios_full_json AS
SELECT
  s._id_scenario,
  s.title_scenario,
  s.is_published,
  s.created_at,
  s.updated_at,
  s.created_by,
  json_object(
    '_id_user', u._id_user,
    'username_user', u.username_user,
    'mail_user', u.mail_user,
    'role_user', u.role_user
  ) AS creator,
  (
    SELECT COALESCE(json_group_array(item), json('[]')) FROM (
      SELECT json_object(
        '_id_commune', c._id_commune,
        'name_fr', c.name_fr,
        'name_nl', c.name_nl,
        'name_de', c.name_de,
        'geo_point_lat', c.geo_point_lat,
        'geo_point_lon', c.geo_point_lon,
        'postal_codes', c.postal_codes
      ) AS item
      FROM scenario_communes sc
      JOIN communes c ON c._id_commune = sc._id_commune
      LEFT JOIN commune_shapes cs ON cs._id_commune = c._id_commune
      WHERE sc._id_scenario = s._id_scenario
      ORDER BY c.name_fr, c._id_commune
    )
  ) AS communes,
  (
    SELECT COALESCE(json_group_array(item), json('[]')) FROM (
      SELECT json_object(
        '_id_block', b._id_block,
        'position_block', b.position_block,
        'type_block', b.type_block,
        'content_text', b.content_text,
        'url_media', b.url_media,
        'caption', b.caption
      ) AS item
      FROM blocks b
      WHERE b.owner_type = 'scenario_intro' AND b._id_scenario = s._id_scenario
      ORDER BY b.position_block, b._id_block
    )
  ) AS intro_blocks,
  (
    SELECT COALESCE(json_group_array(item), json('[]')) FROM (
      SELECT json_object(
        '_id_mission', m._id_mission,
        '_id_scenario', m._id_scenario,
        'position_mission', m.position_mission,
        'title_mission', m.title_mission,
        'latitude', m.latitude,
        'longitude', m.longitude,
        'riddle_text', m.riddle_text,
        'answer_word', m.answer_word,
        'blocks', (
          SELECT COALESCE(json_group_array(bi), json('[]')) FROM (
            SELECT json_object(
              '_id_block', b2._id_block,
              'position_block', b2.position_block,
              'type_block', b2.type_block,
              'content_text', b2.content_text,
              'url_media', b2.url_media,
              'caption', b2.caption
            ) AS bi
            FROM blocks b2
            WHERE b2.owner_type = 'mission' AND b2._id_mission = m._id_mission
            ORDER BY b2.position_block, b2._id_block
          )
        ),
        'prerequisites', (
          SELECT COALESCE(json_group_array(pi), json('[]')) FROM (
            SELECT json_object(
              '_id_mission_required', d._id_mission_required,
              'title_mission_required', mr.title_mission,
              'position_mission_required', mr.position_mission
            ) AS pi
            FROM mission_dependencies d
            JOIN missions mr ON mr._id_mission = d._id_mission_required
            WHERE d._id_mission = m._id_mission
            ORDER BY mr.position_mission, mr._id_mission
          )
        )
      ) AS item
      FROM missions m
      WHERE m._id_scenario = s._id_scenario
      ORDER BY m.position_mission, m._id_mission
    )
  ) AS missions,
  (
    SELECT COALESCE(json_group_array(item), json('[]')) FROM (
      SELECT json_object(
        '_id_block', b._id_block,
        'position_block', b.position_block,
        'type_block', b.type_block,
        'content_text', b.content_text,
        'url_media', b.url_media,
        'caption', b.caption
      ) AS item
      FROM blocks b
      WHERE b.owner_type = 'scenario_outro' AND b._id_scenario = s._id_scenario
      ORDER BY b.position_block, b._id_block
    )
  ) AS outro_blocks
FROM scenarios s
LEFT JOIN users u ON u._id_user = s.created_by;