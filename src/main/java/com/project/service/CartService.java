package com.project.service;

import com.project.dto.CartItemRequest;
import com.project.dto.ProductResponse;
import com.project.model.CartItem;
import com.project.model.Product;
import com.project.model.User;
import com.project.repository.CartItemRepository;
import com.project.repository.ProductRepository;
import com.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private UserRepository userRepository;

    public boolean addToCart(String userId, CartItemRequest request) {
        Optional<Product> productOpt= productRepository.findById(request.getProductId());
        if(productOpt.isEmpty()) return false;
        Product product=productOpt.get();
        if(product.getStockQuantity()<request.getQuantity()) return false;
        Optional<User> userOpt=userRepository.findById(Long.valueOf(userId));
        if(userOpt.isEmpty()) return false;
        User user=userOpt.get();
        CartItem existingCartItem=cartItemRepository.findByUserAndProduct(user, product);
        if(existingCartItem!=null){
            existingCartItem.setQuantity(existingCartItem.getQuantity()+ request.getQuantity());
            existingCartItem.setPrice(product.getPrice().multiply(BigDecimal.valueOf(existingCartItem.getQuantity())));
            cartItemRepository.save(existingCartItem);
        }
        else{
            CartItem cartItem=new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setPrice(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
            cartItemRepository.save(cartItem);
        }
        return true;


    }
}
