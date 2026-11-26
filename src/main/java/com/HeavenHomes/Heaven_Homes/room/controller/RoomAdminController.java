package com.HeavenHomes.Heaven_Homes.room.controller;

import com.HeavenHomes.Heaven_Homes.common.dto.RoomDto;
import com.HeavenHomes.Heaven_Homes.room.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/hotels/{hotelId}/rooms")
@RequiredArgsConstructor
public class RoomAdminController {

    private final RoomService roomService;

    @PostMapping
    @Operation(summary = "Create a new room in a hotel", tags = {"Admin Inventory"})
    public ResponseEntity<RoomDto> createNewRoom(@PathVariable Long hotelId, @RequestBody RoomDto roomDto) {
        return new ResponseEntity<>(roomService.createNewRoom(hotelId, roomDto), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all rooms in a hotel", tags = {"Admin Inventory"})
    public ResponseEntity<List<RoomDto>> getAllRoomsInHotel(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getAllRoomsInHotel(hotelId));
    }

    @GetMapping("/{roomId}")
    @Operation(summary = "Get a room by id", tags = {"Admin Inventory"})
    public ResponseEntity<RoomDto> getRoomById(@PathVariable Long hotelId, @PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomById(roomId));
    }

    @DeleteMapping("/{roomId}")
    @Operation(summary = "Delete a room by id", tags = {"Admin Inventory"})
    public ResponseEntity<Void> deleteRoomById(@PathVariable Long hotelId, @PathVariable Long roomId) {
        roomService.deleteRoomById(roomId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{roomId}")
    @Operation(summary = "Update a room", tags = {"Admin Inventory"})
    public ResponseEntity<RoomDto> updateRoomById(@PathVariable Long hotelId, @PathVariable Long roomId, @RequestBody RoomDto roomDto) {
        return ResponseEntity.ok(roomService.updateRoomById(hotelId, roomId, roomDto));
    }

    @PostMapping("/{roomId}/photos")
    @Operation(summary = "Upload a photo for a room", tags = {"Admin Inventory"})
    public ResponseEntity<RoomDto> uploadRoomPhoto(@PathVariable Long hotelId, @PathVariable Long roomId, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(roomService.uploadRoomPhoto(hotelId, roomId, file));
    }

    @DeleteMapping("/{roomId}/photos")
    @Operation(summary = "Delete a photo from a room", tags = {"Admin Inventory"})
    public ResponseEntity<RoomDto> deleteRoomPhoto(@PathVariable Long hotelId, @PathVariable Long roomId,
            @RequestParam(name = "photoUrl", required = false) String photoUrl,
            @RequestBody(required = false) Map<String, String> body) {
        String urlToDelete = photoUrl;
        if ((urlToDelete == null || urlToDelete.isEmpty()) && body != null) urlToDelete = body.get("photoUrl");
        return ResponseEntity.ok(roomService.deleteRoomPhoto(hotelId, roomId, urlToDelete));
    }
}
