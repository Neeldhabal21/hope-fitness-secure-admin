# Hope Fitness Secure Admin

Spring Boot 3 + Java 21 + Spring Security + MySQL backend for the Hope Fitness demo.

## Run locally

1. Install Java 21, Maven and MySQL.
2. Create database `hope_fitness_db` (the JDBC URL can create it automatically if the MySQL user has permission).
3. Set environment variables in the terminal before starting:

Windows CMD:

```bat
set DB_USERNAME=root
set DB_PASSWORD=YOUR_MYSQL_PASSWORD
set INITIAL_ADMIN_USERNAME=admin
set INITIAL_ADMIN_PASSWORD=USE_A_LONG_RANDOM_PASSWORD
mvn spring-boot:run
```

4. Open `http://localhost:8080/` for the public site.
5. Open `http://localhost:8080/admin/login.html` for the private admin.

Do not commit real credentials. `INITIAL_ADMIN_PASSWORD` is only used to create the first admin if that username does not already exist; it is stored as a BCrypt hash.

## Security

- Leads are stored server-side in MySQL, not localStorage.
- Admin APIs require an authenticated ADMIN session.
- Passwords use BCrypt.
- Session cookie is HttpOnly.
- CSRF protection uses an XSRF cookie/token for state-changing requests.
- Public clients can create leads but cannot list/update/delete them.
- Production deployment must use HTTPS and `secure: true` for the session cookie.
