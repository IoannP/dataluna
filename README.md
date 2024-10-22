### Usage

Run development: ```npm run dev ```

Start: ```npm run start```

Build: ```npm run build```

Test: ```npm run test```

Lint: ```npm run lint```

API:
- GET /items - get items
- POST /purchase - purchase item (params userId, itemId)

### Environment

| Property                | Value                                 |
| ----------------------- | ------------------------------------  |
| DATABES_URL             | Postgres database connection url      |
| DATABASE_URL_TEST       | Postgres test database connection url |
| SKINPORT_API_ORIGIN_URL | Skinport api origin                   |
| CACHE_URL               | Redis url                             |

