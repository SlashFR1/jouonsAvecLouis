package com.loustic.model;

import java.util.Map;

/**
 * Enveloppe diffusée à tous les téléphones abonnés à /topic/room/{code}.
 *
 * @param type    ROOM_UPDATED, ACTION, BOMB_STARTED, BOMB_PASSED, BOMB_EXPLODED...
 * @param room    état public de la salle (joueurs, hôte)
 * @param payload données de l'événement
 */
public record RoomEvent(String type, GameRoom.RoomView room, Map<String, Object> payload) {}
