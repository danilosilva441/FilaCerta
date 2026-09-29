package com.filacerta.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	@Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // MUDANÇA AQUI: Adicionamos o /api/ na frente
        registry.addEndpoint("/api/ws-filacerta")
                .setAllowedOriginPatterns("*"); 
    }

	@Override
	public void configureMessageBroker(MessageBrokerRegistry registry) {
		// Define o prefixo "/topic" para os canais de transmissão (onde o Java vai
		// "gritar" os avisos)
		registry.enableSimpleBroker("/topic");

		// Define o prefixo "/app" para mensagens que vierem do Angular para o Java
		// (usaremos no futuro)
		registry.setApplicationDestinationPrefixes("/app");
	}
}