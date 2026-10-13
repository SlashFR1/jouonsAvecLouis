package com.loustic.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Permet à Spring Boot d'héberger directement le frontend React (SPA)
 * et de rediriger les routes non-fichiers (ex: /salle/synapse, /jeux/7sec) vers index.html.
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        // Si le fichier spécifique n'existe pas et que ce n'est pas un appel API, renvoyer index.html
                        if (!resourcePath.startsWith("api") && !resourcePath.startsWith("ws-game")) {
                            Resource index = location.createRelative("index.html");
                            if (index.exists() && index.isReadable()) {
                                return index;
                            }
                        }
                        return null;
                    }
                });
    }
}
