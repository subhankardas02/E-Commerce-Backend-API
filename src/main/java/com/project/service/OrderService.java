package com.project.service;

import com.project.dto.OrderItemDTO;
import com.project.dto.OrderResponse;
import com.project.model.*;
import com.project.repository.OrderRepository;
import com.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    @Autowired
    private CartService cartService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrderRepository orderRepository;

    public Optional<OrderResponse> createOrder(String userId) {
        List<CartItem> cartItems=cartService.getCart(userId);
        if(cartItems.isEmpty()){
            return Optional.empty();
        }
        Optional<User> userOptional=userRepository.findById(Long.valueOf(userId));
        if(userOptional.isEmpty()){
            return Optional.empty();

        }
        User user=userOptional.get();

        BigDecimal totalPrice= cartItems.stream()
                .map(CartItem::getPrice)
                .reduce(BigDecimal.ZERO,BigDecimal::add);

        Order order=new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setTotalAmount(totalPrice);
        List<OrderItem> orderItems=cartItems.stream()
                .map(item->new OrderItem(null, item.getProduct(), item.getQuantity(), item.getPrice(), order))
                .collect(Collectors.toList());

        order.setItem(orderItems);
        Order saveOrder=orderRepository.save(order);


        cartService.clearCart(userId);
        return Optional.of(mapToOrderResponse(saveOrder));

    }

    private OrderResponse mapToOrderResponse(Order order) {
        return new OrderResponse(
          order.getId(),
          order.getTotalAmount(),
                order.getStatus(),
                order.getItem().stream()
                        .map(orderItem->new OrderItemDTO(
                                orderItem.getId(),
                                orderItem.getProduct().getId(),
                                orderItem.getQuantity(),
                                orderItem.getPrice(),
                                orderItem.getPrice().multiply(new BigDecimal(orderItem.getQuantity()))
                        )).toList(),
                order.getCreatedAt()


        );
    }
}
