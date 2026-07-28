package com.project.service;

import com.project.dto.CartItemRequest;
import com.project.dto.ProductResponse;
import com.project.model.CartItem;
import com.project.model.Product;
import com.project.model.User;
import com.project.repository.CartItemRepository;
import com.project.repository.ProductRepository;
import com.project.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
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

    public boolean deleteItemFromCart(String userId, Long productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
//        if (productOpt.isEmpty()) return false;
        Optional<User> userOpt = userRepository.findById(Long.valueOf(userId));
//        if (userOpt.isEmpty()) return false;

//        userOpt.flatMap(user ->
//                productOpt.map(product -> {
//                    cartItemRepository.deleteByUserAndProduct(user, product);
//                    return true;
//                })
//        );
        if(userOpt.isPresent() && productOpt.isPresent()){
            cartItemRepository.deleteByUserAndProduct(userOpt.get(), productOpt.get());
            return true;
        }
        return false;
    }

    public List<CartItem> getCart(String userId) {
        return userRepository.findById(Long.valueOf(userId))
                .map(cartItemRepository::findByUser)
                .orElseGet(List::of);

    }
}
