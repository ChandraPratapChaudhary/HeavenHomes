package com.HeavenHomes.Heaven_Homes.booking.controller;

import com.HeavenHomes.Heaven_Homes.booking.service.BookingService;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/webhook") @RequiredArgsConstructor @Slf4j
public class WebhookController {
    private final BookingService bookingService;
    @Value("${razorpay.webhook.secret}") private String endpointSecret;

    @PostMapping("/payment") @Operation(summary = "Capture the payments", tags = {"Webhook"})
    public ResponseEntity<Void> capturePayments(@RequestBody String payload, @RequestHeader("X-Razorpay-Signature") String signature) {
        try {
            log.info("===== WEBHOOK RECEIVED =====");
            if (!Utils.verifyWebhookSignature(payload, signature, endpointSecret)) { log.warn("Invalid webhook signature"); return ResponseEntity.status(400).build(); }
            JSONObject event = new JSONObject(payload); log.info("Event Type : {}", event.optString("event")); bookingService.capturePayment(event); log.info("Webhook Processed"); return ResponseEntity.noContent().build();
        } catch (RazorpayException e) { throw new RuntimeException(e); }
    }
}
