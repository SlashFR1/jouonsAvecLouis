package com.loustic.controller;

import com.loustic.model.GameRoom;
import com.loustic.model.Player;
import com.loustic.service.GameRoomService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Création / arrivée dans une salle multi-téléphones.
 * Le temps réel passe ensuite par STOMP (/topic/room/{code}).
 */
@RestController
@RequestMapping("/api/rooms")
public class RoomRestController {

    private final GameRoomService rooms;

    public RoomRestController(GameRoomService rooms) {
        this.rooms = rooms;
    }

    public record CreateRoomRequest(@NotBlank String gameKey,
                                    @NotBlank String playerId,
                                    @NotBlank @Size(max = 24) String playerName) {}

    public record JoinRoomRequest(@NotBlank String playerId,
                                  @NotBlank @Size(max = 24) String playerName) {}

    public record LeaveRoomRequest(@NotBlank String playerId) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GameRoom.RoomView create(@Valid @RequestBody CreateRoomRequest req) {
        return rooms.createRoom(req.gameKey(), new Player(req.playerId(), req.playerName().trim())).toView();
    }

    @PostMapping("/{code}/join")
    public GameRoom.RoomView join(@PathVariable String code, @Valid @RequestBody JoinRoomRequest req) {
        return rooms.join(code, new Player(req.playerId(), req.playerName().trim())).toView();
    }

    @PostMapping("/{code}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leave(@PathVariable String code, @Valid @RequestBody LeaveRoomRequest req) {
        rooms.leave(code, req.playerId());
    }

    @GetMapping("/{code}")
    public GameRoom.RoomView get(@PathVariable String code) {
        return rooms.require(code).toView();
    }
}
