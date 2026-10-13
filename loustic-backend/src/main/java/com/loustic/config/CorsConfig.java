package com.loustic.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 1. Autorise Vercel et le dev local
        config.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://192.168.*:*",
            "http://172.*:*",
            "http://10.*:*",
            "https://lousticloustic.vercel.app",
            "https://*.vercel.app",
            "https://*.github.io"
        ));

        // 2. Autorise les cookies et sessions
        config.setAllowCredentials(true);

        // 3. Autorise toutes les méthodes (GET, POST, OPTIONS, PUT, DELETE, PATCH)
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // 4. Autorise tous les headers (Content-Type, Authorization, etc.)
        config.setAllowedHeaders(List.of("*"));

        // 5. Expose les en-têtes usuels
        config.setExposedHeaders(Arrays.asList("Authorization", "Link", "X-Total-Count"));

        // 6. Cache la réponse preflight OPTIONS 1 heure
        config.setMaxAge(3600L);

        // 7. Applique ce filtre à TOUTES les routes de l'application
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
