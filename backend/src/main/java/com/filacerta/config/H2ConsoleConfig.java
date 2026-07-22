package com.filacerta.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.handler.SimpleUrlHandlerMapping;
import org.springframework.web.servlet.resource.ResourceHttpRequestHandler;

import java.util.Collections;

@Configuration
public class H2ConsoleConfig {

    @Bean
    public SimpleUrlHandlerMapping h2ConsoleHandlerMapping() {
        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
        mapping.setOrder(Integer.MIN_VALUE);
        mapping.setUrlMap(Collections.singletonMap("/h2-console/**", h2ConsoleRequestHandler()));
        return mapping;
    }

    @Bean
    public ResourceHttpRequestHandler h2ConsoleRequestHandler() {
        ResourceHttpRequestHandler handler = new ResourceHttpRequestHandler();
        handler.setLocations(Collections.singletonList(
            new org.springframework.core.io.ClassPathResource("org/h2/server/web/")
        ));
        return handler;
    }
}