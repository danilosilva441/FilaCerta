package com.filacerta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class FilaCertaApplication {

	public static void main(String[] args) {
		SpringApplication.run(FilaCertaApplication.class, args);
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**") // Libera todos os endpoints da sua API
						.allowedOrigins(
							"https://filacerta-production.up.railway.app/", // URL do seu Angular no Railway
							"http://localhost:4200" // Libera também o seu ambiente de desenvolvimento local
						)
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
						.allowedHeaders("*")
						.allowCredentials(true);
			}
		};
	}
}