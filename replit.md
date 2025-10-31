# Site de Vendas de Açaí - Açaí Prime

## Overview
Açaí Prime is an e-commerce platform designed for selling Açaí products. The project features a complete payment collection system with PIX payments via Mercado Pago (QR code generation and real-time payment processing) and credit card data saved directly to the database for manual processing.

## User Preferences
I prefer detailed explanations. Ask before making major changes. I want iterative development. I like to see the overall architecture and then drill down into specific components.

## System Architecture

### UI/UX Decisions
- **Color Scheme**: Primary (Purple): `hsl(280 50% 45%)`, Accent (Yellow): `hsl(45 100% 62%)`.
- **Font**: Poppins (Google Fonts).
- **Branding**: Professional AI-generated logo featuring an açaí bowl.
- **Key Components**:
    - **Geolocation Modal**: Automatically detects user's city via IP, allows manual selection, and saves preferences.
    - **Dynamic Promotion Banner**: Animated gradient banner displaying "Free Delivery for [CITY]!"
    - **Redesigned Header**: Centralized logo, "OPEN" badge, essential business info (min. order, delivery time, location, rating), social icons, and shopping cart.
    - **Reviews Section**: Displays customer reviews with photos, names, ratings, and comments.
    - **Product Cards**: Feature hover effects for enhanced interaction.
    - **Slide-in Cart**: Seamless shopping cart experience.

### Technical Implementations
- **Frontend**: React with TypeScript, Vite running on port 5000 (required for Replit preview)
- **Backend**: Express.js running on port 3000 (localhost only), proxied by Vite
- **Database**: MySQL (Hostinger) via Drizzle ORM
- **Validation**: Zod and React Hook Form for form validation
- **Styling**: Shadcn/ui and Tailwind CSS for modern responsive UI
- **Payment Processing**: 
  - **PIX via Mercado Pago**: Complete integration with real QR code generation, copy-paste code, and automatic payment tracking
  - **Credit Card**: Data saved to database for manual processing (no gateway integration)
- **Admin Panel**: Secure authentication (bcrypt, express-mysql-session, rate limiting), full CRUD for products, orders, reviews, and transactions
- **Geolocation**: ip-api.com with intelligent caching, IP normalization, and fallback handling
- **Environment**: Optimized for Replit development and Render production deployment

### Feature Specifications
- **Product Management**: Add, edit, delete, activate/deactivate, stock control, promotions, highlight order, image uploads.
- **Order Management**: View all orders, full details, payment status, customer data.
- **Review Management**: Add, edit, approve/reject, moderate reviews.
- **Transaction Management**: View all transactions, including masked card data (last 4 digits).
- **Analytics Dashboard**: Page views, total orders, PIX generated, card payments, total revenue, conversion rate, recent orders.
- **Customization Page**: Allows users to customize açaí with free fruits, toppings, and extras with visual counters and validation.
- **Checkout Process**: Displays selected toppings, handles customer data, and payment selection.
- **Confirmation Page**: Shows PIX QR code or card payment status.

### System Design Choices
- **Authentication**: Bcrypt for password hashing, `express-mysql-session` for persistent sessions in MySQL, rate limiting for security, HttpOnly and SameSite=lax cookies.
- **Database Schema**: `products`, `orders` (with JSON `toppings` column), `transactions`, `toppings`, `admin_users`, `analytics_events`, `reviews`, and `sessions` tables.
- **API Endpoints**: Comprehensive set of public and authenticated admin endpoints for all core functionalities.
- **Deployment**: Configured for Replit Autoscale and recommended Render.com deployment with a detailed guide.

## External Dependencies & Environment Variables

**Required Environment Variables:**
- `MYSQL_HOST`: Hostinger MySQL server address
- `MYSQL_PORT`: MySQL port (usually 3306)
- `MYSQL_USER`: MySQL username
- `MYSQL_PASSWORD`: MySQL password
- `MYSQL_DATABASE`: Database name
- `SESSION_SECRET`: Secret key for session encryption
- `MERCADO_PAGO_ACCESS_TOKEN`: Mercado Pago access token for PIX payments (get from https://www.mercadopago.com.br/developers/panel/credentials)

**Optional:**
- `MERCADO_PAGO_WEBHOOK_URL`: URL for Mercado Pago payment notifications (webhooks)

**External Services:**
- **MySQL (Hostinger)**: Primary database
- **Mercado Pago**: PIX payment gateway with real-time QR code generation
- **ip-api.com**: Free geolocation API with caching
- **Drizzle ORM**: Used for database interactions with MySQL
- **React**: Frontend library
- **Express.js**: Backend web framework
- **Vite**: Frontend build tool
- **Mercado Pago SDK**: Official Node.js SDK for payment processing
- **bcrypt**: For password hashing
- **express-mysql-session**: For storing session data in MySQL
- **Zod**: Schema validation library
- **React Hook Form**: For form management
- **Shadcn/ui & Tailwind CSS**: UI component library and CSS framework

## Recent Changes (October 2025)

### PIX Payment Integration via Mercado Pago
- **Added** `server/mercadopago-service.ts`: Complete service for Mercado Pago PIX payment integration
- **Updated** Payment flow in checkout to support real PIX payments with QR code generation
- **Updated** Confirmation page to display PIX QR code, copy-paste code, and payment timer
- **Added** Transaction tracking for PIX payments in database
- **Removed** Old payment service (pagouai-service.ts)
- **Preserved** Credit card payment method unchanged

### Technical Details
- PIX payments now generate real QR codes via Mercado Pago API
- QR code images are displayed as base64 on confirmation page
- Copy-paste PIX code provided for manual payment
- 15-minute payment timer for PIX transactions
- All PIX transaction data saved to `transactions` table
- Credit card flow remains unchanged (manual processing)