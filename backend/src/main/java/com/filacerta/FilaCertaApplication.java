package com.filacerta;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class FilaCertaApplication {
	public static void main(String[] args) {
		SpringApplication.run(FilaCertaApplication.class, args);
	}
}