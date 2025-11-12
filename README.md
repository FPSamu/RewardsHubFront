# RewardsHub - Backend

> RewardsHub is a univeral platform for rewards and fidelization programs between businesses and clients.
Businesses create a RewardsHub account and configure their custom rewards and points systems.
Clients use the app to generate an unique QR ID code, which will be used by businesses to accumulate points in the client's profile.
Clients can see all the businesses registered in the platform, labeled as `visited`, not `visited` and `rewards available`.

---

> This project sets up the frontend for the web platform which will work in the same way as the mobile app: clients and businesses can create accounts, clients can see their QR code, rewards and map of businesses; businesses can scan clients' QR codes, configure their rewards and see their clients.

---

## Tech stack

- React.js
- Tailwind
- HTML
- CSS
- Handlebars
- JavaScript

---

## Project Structure (Backend)

```md
├── src/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── index.ts
├── tests/
├── jest.config.cjs
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

---

## User Flows

### Business

1. Registers/logs in with a business account.
2. Configure customs rewards and points system.
3. Opens scanner on app.
4. Inputs check's price.
5. Scans clients QR code.

### Clients

1. Registers/logs in with a client account.
2. Opens QR code.
3. See rewards, visited businesses, and not visited businesses.
