package com.loustic.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Configuration intelligente de la base de données Neon (PostgreSQL).
 * - Supporte le format standard Neon : postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
 * - Supporte le format JDBC : jdbc:postgresql://...
 * - Fallback transparent vers H2 en mémoire si aucune URL n'est définie (dev local sans configuration).
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${spring.datasource.url:#{null}}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:#{null}}")
    private String springUsername;

    @Value("${spring.datasource.password:#{null}}")
    private String springPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String urlToUse = databaseUrl != null && !databaseUrl.isBlank() ? databaseUrl : springDatasourceUrl;

        HikariConfig config = new HikariConfig();

        if (urlToUse != null && !urlToUse.isBlank()) {
            try {
                if (urlToUse.startsWith("postgres://") || urlToUse.startsWith("postgresql://")) {
                    log.info("🐘 Connexion à la base de données Neon PostgreSQL détectée via DATABASE_URL");
                    URI uri = URI.create(urlToUse.replace("postgres://", "http://").replace("postgresql://", "http://"));
                    
                    String host = uri.getHost();
                    int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                    String path = uri.getPath(); // /neondb
                    String query = uri.getQuery(); // sslmode=require

                    String userInfo = uri.getUserInfo();
                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        config.setUsername(parts[0]);
                        config.setPassword(parts[1]);
                    }

                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    if (query != null && !query.isBlank()) {
                        jdbcUrl += "?" + query;
                    } else {
                        jdbcUrl += "?sslmode=require";
                    }

                    config.setJdbcUrl(jdbcUrl);
                    config.setDriverClassName("org.postgresql.Driver");
                } else {
                    config.setJdbcUrl(urlToUse);
                    if (springUsername != null) config.setUsername(springUsername);
                    if (springPassword != null) config.setPassword(springPassword);
                    if (urlToUse.contains("postgresql")) {
                        config.setDriverClassName("org.postgresql.Driver");
                    }
                }

                config.setMaximumPoolSize(10);
                config.setMinimumIdle(2);
                config.setIdleTimeout(30000);
                config.setConnectionTimeout(20000);

                HikariDataSource ds = new HikariDataSource(config);
                initDatabaseSchema(ds);
                log.info("✅ Connexion à Neon PostgreSQL établie avec succès !");
                return ds;

            } catch (Exception e) {
                log.error("⚠️ Erreur lors de la configuration de Neon PostgreSQL : {}. Bascule sur H2 local.", e.getMessage());
            }
        }

        // Fallback transparent H2 en mémoire pour développement local sans base configurée
        log.info("🧪 Aucune URL Neon PostgreSQL fournie. Utilisation du fallback H2 local en mémoire (compatible Postgres).");
        config.setJdbcUrl("jdbc:h2:mem:loustic;DB_CLOSE_DELAY=-1;MODE=PostgreSQL");
        config.setDriverClassName("org.h2.Driver");
        config.setUsername("sa");
        config.setPassword("");
        config.setMaximumPoolSize(5);

        HikariDataSource ds = new HikariDataSource(config);
        initDatabaseSchema(ds);
        return ds;
    }

    /**
     * Initialisation automatique des tables pour Neon (Postgres) / H2.
     */
    private void initDatabaseSchema(DataSource ds) {
        try (Connection conn = ds.getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS loustic_rooms (
                    room_code VARCHAR(10) PRIMARY KEY,
                    game_key VARCHAR(50) NOT NULL,
                    host_id VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS loustic_game_history (
                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    room_code VARCHAR(10),
                    game_key VARCHAR(50),
                    winner_name VARCHAR(100),
                    scores_json TEXT,
                    finished_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """);
            log.info("✅ Schéma de base de données Neon (tables loustic_rooms et loustic_game_history) vérifié.");
        } catch (Exception e) {
            log.warn("Notice initialisation schéma : {}", e.getMessage());
        }
    }
}
