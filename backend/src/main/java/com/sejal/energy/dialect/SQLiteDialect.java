package com.sejal.energy.dialect;

import org.hibernate.boot.model.TypeContributions;
import org.hibernate.dialect.DatabaseVersion;
import org.hibernate.dialect.Dialect;
import org.hibernate.dialect.identity.IdentityColumnSupport;
import org.hibernate.service.ServiceRegistry;

import java.sql.Types;

/**
 * Final stable SQLite Dialect for Hibernate 6.6.x / Spring Boot 3.5.x
 */
public class SQLiteDialect extends Dialect {

    public SQLiteDialect() {
        super(DatabaseVersion.make(3, 0));
    }

    // Don't use @Override here — Hibernate API changes across versions
    public String getTypeName(int code) {
        return switch (code) {
            case Types.BIT, Types.BOOLEAN,
                 Types.TINYINT, Types.SMALLINT,
                 Types.INTEGER, Types.BIGINT -> "integer";
            case Types.FLOAT, Types.REAL, Types.DOUBLE -> "real";
            case Types.NUMERIC, Types.DECIMAL -> "numeric";
            case Types.CHAR, Types.VARCHAR, Types.LONGVARCHAR -> "text";
            case Types.DATE -> "date";
            case Types.TIME -> "time";
            case Types.TIMESTAMP -> "datetime";
            case Types.BLOB -> "blob";
            case Types.CLOB -> "clob";
            default -> "text";
        };
    }

    public IdentityColumnSupport getIdentityColumnSupport() {
        return new SQLiteIdentityColumnSupport();
    }

    public boolean supportsIfExistsBeforeTableName() {
        return true;
    }

    public boolean dropConstraints() {
        return false;
    }

    public void contributeTypes(TypeContributions contributions, ServiceRegistry registry) {
        // Empty implementation to remain version-safe
    }
}
