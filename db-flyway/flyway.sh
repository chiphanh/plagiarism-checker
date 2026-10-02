mvn flyway:migrate \
  -Dflyway.url="jdbc:postgresql://localhost:5435/anti-plagiarism?useSSL=false" \
  -Dflyway.user=postgres \
  -Dflyway.password=12345678 \
  -Dflyway.schemas=public
