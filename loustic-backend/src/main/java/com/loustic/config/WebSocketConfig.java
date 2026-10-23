package com.loustic.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
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

    /**
     * Scheduler dédié ultra-léger (1 thread) pour envoyer et surveiller les heartbeats STOMP.
     * Empêche Render et les proxys intermédiaires de couper les connexions inactives après 60s.
     */
    private TaskScheduler createHeartbeatScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Les téléphones écoutent /topic/room/{code} ou /queue/...
        // Heartbeat configuré à 15s (15000 ms) serveur <-> client
        config.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[] { 15000, 15000 })
                .setTaskScheduler(createHeartbeatScheduler());

        // Les téléphones envoient leurs actions sur /app/...
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = props.cors().allowedOriginPatterns().toArray(String[]::new);

        // WebSocket natif (utilisé par le frontend React)
        registry.addEndpoint("/ws-game").setAllowedOriginPatterns(origins);

        // Variante SockJS (fallback HTTP long-polling si un réseau mobile bloque les WebSockets)
        registry.addEndpoint("/ws-game-sockjs").setAllowedOriginPatterns(origins).withSockJS();
    }
}
