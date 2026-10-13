package com.loustic.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final LousticProperties props;

    public WebSocketConfig(LousticProperties props) {
        this.props = props;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Les téléphones écoutent /topic/room/{code} ou /queue/...
        config.enableSimpleBroker("/topic", "/queue");
        // Les téléphones envoient leurs actions sur /app/...
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = props.cors().allowedOriginPatterns().toArray(String[]::new);
        // WebSocket natif (utilisé par le frontend React : tous les navigateurs mobiles récents le gèrent)
        registry.addEndpoint("/ws-game").setAllowedOriginPatterns(origins);
        // Variante SockJS (fallback HTTP long-polling si un réseau bloque les WebSockets)
        registry.addEndpoint("/ws-game-sockjs").setAllowedOriginPatterns(origins).withSockJS();
    }
}
