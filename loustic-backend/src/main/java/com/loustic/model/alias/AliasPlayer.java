package com.loustic.model.alias;

public record AliasPlayer(String id, String name, TeamColor team, PlayerRole role, boolean ready) {
    public AliasPlayer withTeamAndRole(TeamColor newTeam, PlayerRole newRole) {
        return new AliasPlayer(id, name, newTeam, newRole, true);
    }
}
