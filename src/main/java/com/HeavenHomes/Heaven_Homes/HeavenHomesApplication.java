package com.HeavenHomes.Heaven_Homes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HeavenHomesApplication {

	public static void main(String[] args) {
		SpringApplication.run(HeavenHomesApplication.class, args);
	}

}
