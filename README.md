# JWT

- Compact and self-contained way of transmitting data as a JSON object
- The information is digitally signed and can be trusted and verified based on that
- JWTs can be signed using a secret (HMAC algorithm) or a public/private key pair (RSA or ECDSA)

## Structure

JSON Web Tokens consist of three parts, separated by dots (xxxxx.yyyyy.zzzzzz):

1. Header

- Usually consists of two information:
  - Type of the token (JWT)
  - Signing algorithm (HMAC, SHA256, RSA)

```JSON
  {
    "alg": "HS256",
    "typ": "JWT"
  }
```

- This json is base64 encoded before added to the token

2. Payload

- Contains the claims (data) to be transmitted
- There are three different types of claims:
  - **Registered claims:** Predefined, but not mandatory claims
    - iss: issuer of the JWT
    - exp: expiration time
    - sub: subject of the JWT
    - aud: audience / recepients of the token
  - **Public claims:** Public comsumption data that might contain generic information (name, profile, etc)
    - Should use collision-resistant names
    - [IANA JSON Web Token Claims Registry](https://www.iana.org/assignments/jwt/jwt.xhtml#claims) contains examples of public registered claims
  - **Private claims:** Information specific to the application (employee ID, department, etc)

```JSON
  {
    "sub": "1234567890",
    "name": "John Doe",
    "admin": true
  }
```

3. Signature

- The signature part takes the encoded header, encoded payload, a secret, the algorithm specified in the header and sign them
- It is used to verify the message wasn't changed along the way
- Example using HMAC SHA256 algorithm:

```JAVA
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

## Workflow example

1. Client logs in using their credentials
2. Service creates the header with the token type and algorithm

```JSON
  {
    "typ": "JWT",
    "alg": "HS256"
  }
```

3. Base64 encode the header `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9`
4. Create the payload

```JSON
  {
    "userId": "123456",
    "expiry": 36432473826
  }
```

5. Base64 encode the payload `eyJ1c2VySWQiOiJhYmNkMTIzIiwiZXhwaXJ5IjoxNjQ2NjM1NjExMzAxfQ`
6. Concatenate header + payload with a dot separating them `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhYmNkMTIzIiwiZXhwaXJ5IjoxNjQ2NjM1NjExMzAxfQ`
7. Generate a secure signing key with some random source `NTNv7j0TuYARvmNMmWXo6fKvM4o6nv/aUi9ryX38ZH+L1bkrnD1ObOQ8JAUmHCBq7Iy7otZcyAagBLHVKvvYaIpmMuxmARQ97jUVG16Jkpkp1wXOPsrF9zwew6TpczyHkHgX5EuLg2MeBuiT/qJACs1J0apruOOJCg/gOtkjB4c=`
8. Apply the signing algorithm and base64 encoding to the header + payload and the signing key to generate the `signature`

```JS
  Base64URLSafe(
    HMACSHA256("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhYmNkMTIzIiwiZXhwaXJ5IjoxNjQ2NjM1NjExMzAxfQ", "NTNv7j0TuYARvmNMmWXo6fKvM4o6nv/aUi9ryX38ZH+L1bkrnD1ObOQ8JAUmHCBq7Iy7otZcyAagBLHVKvvYaIpmMuxmARQ97jUVG16Jkpkp1wXOPsrF9zwew6TpczyHkHgX5EuLg2MeBuiT/qJACs1J0apruOOJCg/gOtkjB4c=")
  )
  result: `3Thp81rDFrKXr3WrY1MyMnNK8kKoZBX9lg-JwFznR-M`
```

9. Append the <header>.<body>.<signature> (JWT): `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhYmNkMTIzIiwiZXhwaXJ5IjoxNjQ2NjM1NjExMzAxfQ.3Thp81rDFrKXr3WrY1MyMnNK8kKoZBX9lg-JwFznR-M`
10. Sends the token to the client
11. When client wants to access a protected resource, they send the JWT usually in the `Authorization` header, using `Bearer` schema

- Authorization: Bearer <token>

12. The service validates the token:

- Base64 decodes the header: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9`

```JSON
  {
    "typ": "JWT",
    "alg": "HS256"
  }
```

- Verifies the `typ` is `JWT`
- Verifies the `alg` is `HS256`
- Base64 decodes the payload: `eyJ1c2VySWQiOiJhYmNkMTIzIiwiZXhwaXJ5IjoxNjQ2NjM1NjExMzAxfQ`

```JSON
  {
    "userId": "123456",
    "expiry": 36432473826
  }
```

- Invalidates the token if current time is greater than `expiry`
- Applies the same signing algorithm and base64 encoding to the header + payload and the signing key
- If the resulting signature is not the same sent by the client, the token is invalid

- [JWT Integration with AWS Gateway](https://docs.aws.amazon.com/en_us/apigateway/latest/developerguide/http-api-jwt-authorizer.html)
