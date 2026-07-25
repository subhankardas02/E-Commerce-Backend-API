package com.project.controller;


import com.project.dto.CartItemRequest;
import com.project.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    @Autowired
    private CartService cartService;
    private ResponseEntity<String> addToCart(@RequestHeader("X-User-ID") String userId, @RequestBody CartItemRequest request){
        if(!cartService.addToCart(userId, request)){
            return ResponseEntity.badRequest().body("Product Out of Stock or User not found or Product not found");
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

}
// cart controller