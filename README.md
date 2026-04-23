# FFFood POS System

A full-stack restaurant Point of Sale system built with Angular 19 and ASP.NET Core 10.

**Live URL:** https://d3rbjmod4fogyx.cloudfront.net

---

## Architecture

```
Browser (CloudFront HTTPS)
    ├── /* → S3 bucket (Angular static files)
    └── /api/* → EC2 t3.small (ASP.NET Core 10 API)
                       └── MySQL 8 (same instance)
```

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | Angular 19 (NgModule) | AWS S3 + CloudFront |
| Backend API | ASP.NET Core 10 Web API | AWS EC2 (ap-southeast-1) |
| Database | MySQL 8 | EC2 (same instance) |
| Auth | JWT (HS256) + PIN login | — |

---

## Features

### Login
- Staff select their profile from a card grid
- 4-digit PIN entry with numpad
- Offline fallback: shows mock staff immediately; replaces with API data on load

### POS (Point of Sale)
- Browse menu by category
- Add items to cart with modifier groups (size, extras, milk type)
- Search items by name
- Cart with quantity controls
- Order types: dine-in, takeaway, delivery

### Payment
- Supports cash, card, QR, split payment
- Cash: enter tendered amount → auto-calculates change
- Creates order record + deducts stock on payment
- Success screen with change due

### Menu Management
- View all items including hidden ones
- Toggle item availability on/off
- Edit name, price, tags inline
- Add new items with category, price, stock, tags
- Category sidebar filter

### Inventory
- See all items with current stock levels
- Low stock / out-of-stock filters
- Quick ±1 stock adjustment buttons
- Full adjust drawer: delivery, waste, correction, count reasons
- Adjustment history per item

---

## Staff & PINs

| Name | Role | PIN |
|------|------|-----|
| Maya Chen | Manager | 1234 |
| James Ortega | Cashier | 2345 |
| Priya Nair | Server | 3456 |
| Kenji Tanaka | Barista | 4567 |
| Sara O'Connell | Server | 5678 |

---

## Local Development

### Prerequisites
- Node.js 22+
- .NET 10 SDK
- MySQL 8

### Backend
```bash
cd fffood-api
# Set connection string in appsettings.json
dotnet run
# API runs on http://localhost:5001
```

### Frontend
```bash
cd fffood-web
npm install
npx ng serve
# App runs on http://localhost:4200
```

---

## Project Structure

```
fffood-fullstack/
├── fffood-api/                  # ASP.NET Core 10 Web API
│   ├── Controllers/
│   │   ├── AuthController.cs    # Staff list + PIN login → JWT
│   │   ├── MenuController.cs    # Categories, items CRUD
│   │   ├── OrdersController.cs  # Create, pay, void orders
│   │   └── InventoryController.cs  # Stock + adjustment history
│   ├── Data/
│   │   └── AppDbContext.cs      # EF Core 9 DbContext
│   ├── DTOs/
│   │   └── Dtos.cs              # All request/response records
│   ├── Models/                  # EF entity models
│   ├── appsettings.json         # Dev config (localhost MySQL)
│   └── Program.cs               # CORS, JWT, EF, routing setup
│
├── fffood-web/                  # Angular 19 frontend
│   └── src/app/
│       ├── pages/
│       │   ├── login/           # Staff login with PIN
│       │   ├── pos/             # POS order screen
│       │   ├── payment/         # Payment flow
│       │   ├── menu-management/ # Menu admin
│       │   └── inventory/       # Stock management
│       ├── services/
│       │   ├── api.ts           # HTTP calls to backend
│       │   ├── auth.ts          # JWT token storage
│       │   └── cart.ts          # Cart state (BehaviorSubject)
│       └── environments/
│           ├── environment.ts       # Dev: localhost:5001
│           └── environment.prod.ts  # Prod: CloudFront URL
│
└── database/                    # SQL schema & seed scripts
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/auth/staff | List all active staff |
| POST | /api/auth/login | PIN login → JWT token |
| GET | /api/menu/categories | List categories |
| GET | /api/menu/items | Active menu items (POS) |
| GET | /api/menu/items?all=true | All items including hidden (management) |
| POST | /api/menu/items | Create item |
| PUT | /api/menu/items/:id | Update item (name, price, active, tags) |
| GET | /api/orders | List orders (optional ?status=) |
| POST | /api/orders | Create order |
| POST | /api/orders/:id/pay | Pay order + deduct stock |
| POST | /api/orders/:id/void | Void order |
| GET | /api/inventory | All items with stock |
| POST | /api/inventory/:id/adjust | Adjust stock |
| GET | /api/inventory/:id/history | Adjustment history |

---

## AWS Deployment

### EC2 (API + MySQL)
- Instance: `i-087ee4a8cf0937b8d` (t3.small, ap-southeast-1)
- IP: `47.128.214.18`
- SSH: `ssh -i ~/.ssh/fffood-key.pem ec2-user@47.128.214.18`
- Service: `sudo systemctl status fffood-api`
- Logs: `journalctl -u fffood-api -f`

### Redeploy API
```bash
cd fffood-api
dotnet publish -c Release -r linux-x64 --self-contained false -o /tmp/fffood-api-publish
cd /tmp && tar czf fffood-api.tar.gz -C fffood-api-publish .
scp -i ~/.ssh/fffood-key.pem fffood-api.tar.gz ec2-user@47.128.214.18:/tmp/
ssh -i ~/.ssh/fffood-key.pem ec2-user@47.128.214.18 \
  "cd /opt/fffood-api && tar xzf /tmp/fffood-api.tar.gz && sudo systemctl restart fffood-api"
```

### Redeploy Frontend
```bash
cd fffood-web
npx ng build --configuration production
aws s3 sync dist/fffood-web/browser/ s3://fffood-pos-jhteo2019/ --delete
aws cloudfront create-invalidation --distribution-id EIW3DWZ1WCW3N --paths "/*"
```

---

## Responsive Design

Tested on:
- Desktop (1440px+): sidebar navigation, full POS layout
- Tablet (768–1024px): compact sidebar, touch-friendly targets
- Phone (<768px): bottom tab bar, collapsible cart panel
