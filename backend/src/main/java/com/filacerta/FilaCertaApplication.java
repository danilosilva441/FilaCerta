package com.filacerta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@EnableRetry
@SpringBootApplication
public class FilaCertaApplication {
	public static void main(String[] args) {
		SpringApplication.run(FilaCertaApplication.class, args);
	}
}